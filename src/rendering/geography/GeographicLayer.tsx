import { useEffect, useMemo } from "react"
import * as THREE from "three"
import {
  buildGeoBorderPositions,
  GEO_LOD_STYLE,
  type CountriesAdm0Data,
} from "./geoLod.ts"

/**
 * Couche de frontières ADM0 projetée sur la sphère terrestre.
 *
 * Architecture :
 *   EarthGroup (position orbitale monde actuelle)
 *   └── rotationGroup (rotation Y terrestre — jour/nuit + spin)
 *       ├── EarthMesh (sphère opaque + earth.jpg)
 *       ├── EarthBordersOverlay (earth-borders.png — LOD 0, toujours visible)
 *       └── GeographicLayer (ce composant — LOD 1/2, vectoriel lazy)
 *
 * Enfant du même groupe de rotation que le mesh terrestre, le layer hérite
 * naturellement de la rotation Y — aucun correctif d'angle nécessaire, aligné
 * avec la texture pendant le mouvement orbital et le suivi caméra.
 *
 * Rendu : un seul `THREE.LineSegments` (PASS avant uniquement) :
 *   - depthTest=true + depthWrite=false → la face arrière est masquée par le
 *     globe opaque (aucune frontière visible à travers la Terre).
 *   - renderOrder=1 → tracé après la sphère, sans halo additif.
 *   - Couleur subtile (jamais rouge), opacité modérée.
 *
 * Le dataset est fourni par le parent (chargé lazy via `geoLod.ts`).
 * AUCUN import statique de GeoJSON ici → rien dans le bundle initial.
 * Géométrie construite une fois (useMemo), disposée à l'unmount (pas de fuite).
 */

/** Alias historique conservé pour les consommateurs existants. */
export type CountriesGlobeData = CountriesAdm0Data

interface GeographicLayerProps {
  earthRadius: number
  /** Dataset ADM0 déjà chargé (null/undefined → rien rendu, fallback LOD 0). */
  data: CountriesAdm0Data | null | undefined
  /** Niveau visuel : 1 = globe, 2 = pays détaillé (style adapté). */
  lodLevel?: 1 | 2
  color?: string
  opacity?: number
}

export function GeographicLayer({
  earthRadius,
  data,
  lodLevel = 1,
  color,
  opacity,
}: GeographicLayerProps) {
  const style = GEO_LOD_STYLE[lodLevel] ?? GEO_LOD_STYLE[1]

  const geometry = useMemo(() => {
    if (!data) return null
    const { positions } = buildGeoBorderPositions(data, earthRadius)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [data, earthRadius])

  useEffect(() => {
    return () => {
      geometry?.dispose()
    }
  }, [geometry])

  if (!geometry) return null

  return (
    <lineSegments geometry={geometry} renderOrder={1}>
      <lineBasicMaterial
        color={color ?? style.color}
        transparent
        opacity={opacity ?? style.opacity}
        depthTest
        depthWrite={false}
      />
    </lineSegments>
  )
}
