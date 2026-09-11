import { useEffect, useMemo } from "react"
import * as THREE from "three"
import countriesData from "../../../data/processed/countries-adm0-globe.json"
import {
  buildGeoBorderPositions,
  GEO_LOD_STYLE,
  type CountriesAdm0Data,
} from "./geoLod.ts"

/** Alias historique conservé pour les consommateurs existants. */
export type CountriesGlobeData = CountriesAdm0Data

interface GeographicLayerProps {
  earthRadius: number
  /** Dataset ADM0 déjà chargé (null/undefined → fallback vers le dataset globe statique historique). */
  data?: CountriesAdm0Data | null
  /** Niveau visuel : 1 = globe, 2 = pays détaillé. */
  lodLevel?: 1 | 2
  color?: string
  opacity?: number
  onCountrySelect?: (countryId: string) => void
}

export function GeographicLayer({
  earthRadius,
  data,
  lodLevel = 1,
  color,
  opacity,
  onCountrySelect,
}: GeographicLayerProps) {
  const style = GEO_LOD_STYLE[lodLevel] ?? GEO_LOD_STYLE[1]
  const fallbackData = data ?? (countriesData as unknown as CountriesAdm0Data)

  const geometry = useMemo(() => {
    if (!fallbackData) return null
    const { positions } = buildGeoBorderPositions(fallbackData, earthRadius)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [earthRadius, fallbackData])

  const countryPickingMeshes = useMemo(() => {
    if (!fallbackData || !onCountrySelect) return []

    return fallbackData.countries.map((country) => {
      const triangles = buildCountryPickingTriangles(country, earthRadius)
      if (!triangles.length) return null

      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.Float32BufferAttribute(triangles, 3))
      return {
        id: country.id,
        geometry: geo,
      }
    }).filter(Boolean) as Array<{ id: string; geometry: THREE.BufferGeometry }>
  }, [earthRadius, fallbackData, onCountrySelect])

  useEffect(() => {
    return () => {
      geometry?.dispose()
      for (const mesh of countryPickingMeshes) {
        mesh.geometry.dispose()
      }
    }
  }, [geometry, countryPickingMeshes])

  if (!geometry) return null

  return (
    <>
      <lineSegments geometry={geometry} renderOrder={1} raycast={() => null}>
        <lineBasicMaterial
          color={color ?? style.color}
          transparent
          opacity={opacity ?? style.opacity}
          depthTest
          depthWrite={false}
        />
      </lineSegments>

      {countryPickingMeshes.map(({ id, geometry: pickingGeometry }) => (
        <mesh
          key={id}
          geometry={pickingGeometry}
          renderOrder={2}
          onPointerDown={(event) => {
            event.stopPropagation()
            if (onCountrySelect) {
              onCountrySelect(id)
            }
          }}
        >
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

function buildCountryPickingTriangles(
  country: { id: string; geometry: { type: string; coordinates: any[] } },
  radius: number,
): number[] {
  const triangles: number[] = []
  const polygons = country.geometry.type === "Polygon"
    ? [country.geometry.coordinates]
    : country.geometry.coordinates

  const project = (lon: number, lat: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = -radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    return new THREE.Vector3(x, y, z)
  }

  for (const polygon of polygons) {
    const rings = Array.isArray(polygon[0]) && Array.isArray(polygon[0][0]) ? polygon : [polygon]

    for (const ring of rings) {
      if (!ring.length || ring.length < 3) continue
      const centroid = new THREE.Vector3()
      for (const point of ring) {
        const [lon, lat] = point
        centroid.add(project(lon, lat))
      }
      centroid.divideScalar(ring.length)

      for (let i = 1; i < ring.length - 1; i++) {
        const a = ring[0]
        const b = ring[i]
        const c = ring[i + 1]

        const va = project(a[0], a[1])
        const vb = project(b[0], b[1])
        const vc = project(c[0], c[1])

        triangles.push(
          va.x, va.y, va.z,
          vb.x, vb.y, vb.z,
          vc.x, vc.y, vc.z,

          centroid.x, centroid.y, centroid.z,
          va.x, va.y, va.z,
          vb.x, vb.y, vb.z,
        )
      }
    }
  }

  return triangles
}

/**
 * Ajoute les segments de ligne de chaque anneau (extérieur ou intérieur)
 * d'un polygone au tableau de positions.
 *
 * Cette fonction est conservée pour compatibilité si d'autres modules
 * utilisaient l'ancien utilitaire local ; le rendu actuel passe par
 * `buildGeoBorderPositions()` de `geoLod.ts`.
 */
function addPolygonRings(
  rings: number[][][],
  positions: number[],
  radius: number,
): void {
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()

  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [lon1, lat1] = ring[i]
      const [lon2, lat2] = ring[i + 1]
      const x1 = radius * Math.cos((lat1 * Math.PI) / 180) * Math.cos((lon1 * Math.PI) / 180)
      const y1 = radius * Math.sin((lat1 * Math.PI) / 180)
      const z1 = radius * Math.cos((lat1 * Math.PI) / 180) * Math.sin((lon1 * Math.PI) / 180)
      const x2 = radius * Math.cos((lat2 * Math.PI) / 180) * Math.cos((lon2 * Math.PI) / 180)
      const y2 = radius * Math.sin((lat2 * Math.PI) / 180)
      const z2 = radius * Math.cos((lat2 * Math.PI) / 180) * Math.sin((lon2 * Math.PI) / 180)
      v1.set(x1, y1, z1)
      v2.set(x2, y2, z2)
      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
    }
  }
}
