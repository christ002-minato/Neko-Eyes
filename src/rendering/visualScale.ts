import type { Vec3 } from "../orbital/types.ts"

/**
 * Visual Scale / Scene Mapping — Configuration centralisée du facteur d'échelle visuelle.
 *
 * Ce module sépare l'échelle visuelle (scène Three.js) des données astronomiques réelles
 * (orbitales, JPL). Il ne modifie JAMAIS les calculs orbitaux ni les données JPL.
 *
 * Architecture :
 *   JPL/Orbital → position astronomique réelle → Visual Scale → Rendering 3D
 *
 * Le facteur d'échelle est indépendant des données astronomiques.
 */

export interface VisualScaleConfig {
  /** Facteur d'échelle global pour les distances orbitales (Sun → planets) */
  distanceScale: number
  /** Facteur d'échelle spécifique pour la distance Terre → Lune */
  earthMoonDistanceScale: number
  /** Facteur d'échelle pour les tailles des corps (rayons) */
  bodySizeScale: number
  /** Distance minimale visuelle pour éviter les collisions visuelles */
  minVisualDistance: number
}

export const DEFAULT_VISUAL_SCALE: VisualScaleConfig = {
  distanceScale: 3.5,
  earthMoonDistanceScale: 6.0,
  bodySizeScale: 1.0,
  minVisualDistance: 0.5,
}

let currentScale: VisualScaleConfig = { ...DEFAULT_VISUAL_SCALE }

export function getVisualScale(): VisualScaleConfig {
  return { ...currentScale }
}

export function setVisualScale(config: Partial<VisualScaleConfig>): void {
  currentScale = { ...currentScale, ...config }
}

export function resetVisualScale(): void {
  currentScale = { ...DEFAULT_VISUAL_SCALE }
}

/**
 * Convertit une distance orbitale (données astronomiques / unités scène calculées)
 * en distance visuelle (unités scène Three.js pour le rendu).
 *
 * @param orbitalDistance Distance en unités orbitales (ex: orbitRadius du modèle, ou UA converties)
 * @param isEarthMoonDistance Si true, applique le facteur Terre-Lune spécifique
 * @returns Distance visuelle pour la scène Three.js
 */
export function mapOrbitalDistanceToVisual(
  orbitalDistance: number,
  isEarthMoonDistance: boolean = false
): number {
  const scale = getVisualScale()
  const factor = isEarthMoonDistance ? scale.earthMoonDistanceScale : scale.distanceScale
  const visualDistance = orbitalDistance * factor
  return Math.max(visualDistance, scale.minVisualDistance)
}

/**
 * Convertit un rayon de corps (données astronomiques) en rayon visuel.
 *
 * @param orbitalRadius Rayon en unités orbitales
 * @returns Rayon visuel pour la scène Three.js
 */
export function mapBodySizeToVisual(orbitalRadius: number): number {
  const scale = getVisualScale()
  return orbitalRadius * scale.bodySizeScale
}

/**
 * Convertit une position orbitale (Vec3) en position visuelle.
 * Applique le scaling sur X et Z (plan orbital), conserve Y (inclinaison).
 *
 * @param orbitalPosition Position en unités orbitales [x, y, z]
 * @param isEarthMoonOffset Si true, c'est un offset Terre→Lune (facteur spécifique)
 * @returns Position visuelle pour la scène Three.js
 */
export function mapOrbitalPositionToVisual(
  orbitalPosition: Vec3,
  isEarthMoonOffset: boolean = false
): Vec3 {
  const scale = getVisualScale()
  const factor = isEarthMoonOffset ? scale.earthMoonDistanceScale : scale.distanceScale
  return [
    orbitalPosition[0] * factor,
    orbitalPosition[1] * factor,
    orbitalPosition[2] * factor,
  ]
}

/**
 * Calcule les échelles visuelles pour tout le système solaire à partir des définitions orbitales.
 * Utile pour initialiser la scène avec les bonnes distances visuelles.
 *
 * @param orbitalDefinitions Définitions orbitales plates (avec orbitalRadius)
 * @returns Map id → { visualOrbitRadius, visualRadius }
 */
export function computeVisualScales(
  orbitalDefinitions: Array<{ id: string; orbitalRadius: number; radius?: number }>
): Map<string, { visualOrbitRadius: number; visualRadius: number }> {
  const result = new Map<string, { visualOrbitRadius: number; visualRadius: number }>()

  for (const def of orbitalDefinitions) {
    const isMoon = def.id === "moon"
    const visualOrbitRadius = mapOrbitalDistanceToVisual(def.orbitalRadius, isMoon)
    const visualRadius = def.radius ? mapBodySizeToVisual(def.radius) : 1
    result.set(def.id, { visualOrbitRadius, visualRadius })
  }

  return result
}