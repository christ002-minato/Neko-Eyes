import * as THREE from "three"
import { geoLonLatToVector3 } from "./geoProjection.ts"

/**
 * Geographic LOD (Level of Detail) — Neko Eyes.
 *
 * Objectif : zoom géographique progressif globe → pays → (futur ADM1/ADM2/villes)
 * sans charger les gros datasets au démarrage et sans toucher aux systèmes
 * verrouillés (orbital, JPL, CameraController, Focus, OrbitControls, sélection,
 * textures, éclairage, jour/nuit, rotation).
 *
 * Niveaux :
 *   LOD 0 — globe seul : Earth + `earth-borders.png`. Aucun GeoJSON.
 *   LOD 1 — `countries-adm0-globe.json` (13 Mo) chargé LAZY au seuil de zoom.
 *   LOD 2 — `countries-adm0-country.json` (49 Mo) chargé LAZY au zoom profond.
 *   LOD 3 — réservé : registre extensible pour futurs ADM1/ADM2/villes ou
 *           tuiles/API. Aucune donnée inventée, aucune API externe ici.
 *
 * `countries-adm0-detail.json` (136 Mo) et `countries-adm0-raw.json` (335 Mo)
 * ne sont JAMAIS chargés automatiquement par ce module.
 *
 * Le niveau est dérivé de la distance réelle caméra ↔ Terre (position et
 * échelle monde actuelles de la Terre, qui continue son mouvement orbital).
 * Seuils exprimés en rayons terrestres avec hysteresis anti-oscillation.
 * Le calcul LOD est throttlé côté moniteur (1 évaluation toutes les N frames
 * + seuil de déplacement minimal), jamais de geo-math lourde par frame.
 *
 * Remplacement futur par API/tuiles : enregistrer un loader via
 * `registerGeoLodSource()` sans toucher au système de caméra.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type GeoLodLevel = 0 | 1 | 2 | 3

type Ring = number[][]
export type GeoPolygonCoordinates = number[][][]
export type GeoMultiPolygonCoordinates = number[][][][]

export type CountryAdm0Geometry =
  | { type: "Polygon"; coordinates: GeoPolygonCoordinates }
  | { type: "MultiPolygon"; coordinates: GeoMultiPolygonCoordinates }

export interface CountryAdm0 {
  id: string
  name: string
  geometry: CountryAdm0Geometry
}

/** Schéma partagé par `countries-adm0-globe.json` et `countries-adm0-country.json`. */
export interface CountriesAdm0Data {
  version: number
  level: string
  detail: string
  tolerance: number
  countries: CountryAdm0[]
}

export type GeoLodStatus = "idle" | "loading" | "ready" | "error"

// ── Seuils (en rayons terrestres, avec hysteresis) ────────────────────────────
//
// Référence : rayon visuel Terre R = mapBodySizeToVisual(2.8) = 2.8.
//   LOD 1 ON  à d ≤ 8.0R  (≈ 22.4 unités) — OFF à d ≥ 9.5R (≈ 26.6)
//   LOD 2 ON  à d ≤ 3.5R  (≈ 9.8)         — OFF à d ≥ 4.2R (≈ 11.8)
//   LOD 3 réservé à d ≤ 2.2R (≈ 6.2) — rapporté, sans dataset (fallback LOD 2).
//
// Cohérence système existant : le Focus Terre place la caméra à ~4–5R
// (distance 3.5R + hauteur 2R) → LOD 1 actif à l'arrivée du focus.
// Le zoom profond manuel (< 3.5R) déclenche LOD 2.

export const GEO_LOD_THRESHOLDS = {
  lod1EnterRadii: 8.0,
  lod1ExitRadii: 9.5,
  lod2EnterRadii: 3.5,
  lod2ExitRadii: 4.2,
  lod3EnterRadii: 2.2,
  lod3ExitRadii: 2.6,
} as const

/** Petit décalage radial anti z-fighting (0,2 % au-dessus de la surface). */
export const GEOGRAPHIC_EPSILON = 0.002

/** Style par niveau : subtil, jamais rouge, jamais de halo additif. */
export const GEO_LOD_STYLE: Record<1 | 2, { color: string; opacity: number }> = {
  1: { color: "#8fd0e8", opacity: 0.55 },
  2: { color: "#d6ecf7", opacity: 0.7 },
}

/** Throttle du moniteur : 1 évaluation toutes les N frames + déplacement min. */
export const GEO_LOD_MONITOR = {
  frameSkip: 10,
  /** Distance caméra ou Terre minimale (fraction du rayon) pour réévaluer. */
  moveEpsilonRadii: 0.02,
} as const

// ── Résolution de niveau avec hysteresis ──────────────────────────────────────

/**
 * Résout le niveau LOD à partir de la distance caméra ↔ Terre.
 * L'hysteresis (seuils enter/exit distincts) évite les bascules permanentes
 * quand la caméra oscille autour d'un seuil.
 */
export function resolveGeoLodLevel(
  current: GeoLodLevel,
  cameraDistance: number,
  earthRadius: number,
): GeoLodLevel {
  const d = cameraDistance / Math.max(earthRadius, 1e-6)
  const t = GEO_LOD_THRESHOLDS

  let target: GeoLodLevel = 0
  if (d <= t.lod3EnterRadii) target = 3
  else if (d <= t.lod2EnterRadii) target = 2
  else if (d <= t.lod1EnterRadii) target = 1

  // Hysteresis : on ne redescend que si la zone de sortie est atteinte.
  if (target < current) {
    if (current >= 3 && d < t.lod3ExitRadii) return 3
    if (current >= 2 && d < t.lod2ExitRadii) return 2
    if (current >= 1 && d < t.lod1ExitRadii) return 1
  }
  return target
}

// ── Registre des sources (extensible LOD 3 / API / tuiles) ────────────────────

export type GeoLodSourceLoader = () => Promise<CountriesAdm0Data>

/**
 * Registre des loaders par niveau. Niveaux 1–2 pré-câblés (lazy).
 * Niveaux ≥ 3 : vides par défaut — un futur module (ADM1/ADM2/villes,
 * API ou tuiles) pourra appeler `registerGeoLodSource()` sans refaire
 * le système de caméra ni le moniteur.
 */
const geoLodSources = new Map<number, GeoLodSourceLoader>()

export function registerGeoLodSource(level: number, loader: GeoLodSourceLoader): void {
  geoLodSources.set(level, loader)
}

export function hasGeoLodSource(level: number): boolean {
  return geoLodSources.has(level)
}

/** Niveaux lourds explicitement exclus du chargement automatique. */
export const GEO_LOD_EXCLUDED_DATASETS = [
  "countries-adm0-detail.json",
  "countries-adm0-raw.json",
] as const

// ── Chargement lazy avec cache + single-flight ────────────────────────────────
//
// Aucun import statique de GeoJSON dans ce module : les datasets sont chargés
// via `import()` dynamique → chunks lazy séparés, absents du bundle initial
// et jamais téléchargés avant activation du LOD.

const datasetCache = new Map<number, CountriesAdm0Data>()
const datasetInflight = new Map<number, Promise<CountriesAdm0Data>>()

async function loadGlobeDataset(): Promise<CountriesAdm0Data> {
  const mod = (await import(
    "../../../data/processed/countries-adm0-globe.json"
  )) as unknown as { default: CountriesAdm0Data }
  return mod.default
}

async function loadCountryDataset(): Promise<CountriesAdm0Data> {
  const mod = (await import(
    "../../../data/processed/countries-adm0-country.json"
  )) as unknown as { default: CountriesAdm0Data }
  return mod.default
}

geoLodSources.set(1, loadGlobeDataset)
geoLodSources.set(2, loadCountryDataset)

/** Dataset chargé pour chaque niveau (informations, sans charger). */
export function getGeoLodDatasetInfo(level: GeoLodLevel): string {
  switch (level) {
    case 0:
      return "LOD 0 : Earth + earth-borders.png (aucun GeoJSON)"
    case 1:
      return "LOD 1 : countries-adm0-globe.json (lazy)"
    case 2:
      return "LOD 2 : countries-adm0-country.json (lazy)"
    case 3:
      return "LOD 3 : réservé (ADM1/ADM2/villes — aucun dataset câblé)"
  }
}

/**
 * Charge le dataset d'un niveau (1 ou 2) de façon asynchrone.
 * - Ne bloque jamais le rendu (appelée depuis useEffect, pas useFrame).
 * - Un dataset n'est chargé qu'une fois (cache + single-flight).
 * - Niveaux sans source (3+) → rejet explicite, l'appelant garde le fallback.
 */
export function loadGeoLodDataset(level: 1 | 2): Promise<CountriesAdm0Data> {
  const cached = datasetCache.get(level)
  if (cached) return Promise.resolve(cached)

  const inflight = datasetInflight.get(level)
  if (inflight) return inflight

  const loader = geoLodSources.get(level)
  if (!loader) {
    return Promise.reject(new Error(`[geoLod] no source registered for level ${level}`))
  }

  const promise = loader().then((data) => {
    datasetCache.set(level, data)
    datasetInflight.delete(level)
    return data
  })
  promise.catch(() => {
    // Échec : permettre une nouvelle tentative ultérieure, garder le fallback.
    datasetInflight.delete(level)
  })
  datasetInflight.set(level, promise)
  return promise
}

/** Libère le cache CPU d'un niveau (la géométrie GPU est disposée à l'unmount). */
export function releaseGeoLodDataset(level: 1 | 2): void {
  datasetCache.delete(level)
}

// ── Construction géométrie (pur, testable, hors boucle de rendu) ─────────────

/**
 * Construit les positions `LineSegments` des frontières pour un dataset ADM0.
 * Appelée une seule fois par dataset (useMemo), jamais par frame.
 */
export function buildGeoBorderPositions(
  data: CountriesAdm0Data,
  radius: number,
): { positions: Float32Array; segmentCount: number } {
  const geoRadius = radius * (1 + GEOGRAPHIC_EPSILON)
  const flat: number[] = []
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()

  const addRings = (rings: GeoPolygonCoordinates) => {
    for (const ring of rings) {
      for (let i = 0; i < ring.length - 1; i++) {
        geoLonLatToVector3(ring[i][0], ring[i][1], geoRadius, v1)
        geoLonLatToVector3(ring[i + 1][0], ring[i + 1][1], geoRadius, v2)
        flat.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
      }
    }
  }

  for (const country of data.countries) {
    const { type, coordinates } = country.geometry
    if (type === "Polygon") {
      addRings(coordinates)
    } else if (type === "MultiPolygon") {
      for (const polygon of coordinates) addRings(polygon)
    }
  }

  return { positions: new Float32Array(flat), segmentCount: flat.length / 6 }
}
