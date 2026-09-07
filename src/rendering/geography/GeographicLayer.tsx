import { useMemo } from "react"
import * as THREE from "three"
import { geoLonLatToVector3 } from "./geoProjection.ts"
import countriesData from "../../../data/processed/countries-adm0-globe.json"

/**
 * Epsilon appliqué au rayon terrestre pour placer les frontières
 * très légèrement au-dessus de la surface, évitant le z-fighting
 * sans produire un décalage visible.
 *
 * 0.002 = 0.2 % au-dessus de la surface.
 */
const GEOGRAPHIC_EPSILON = 0.002

/**
 * Format réel du fichier data/processed/countries-adm0-globe.json :
 *
 *   {
 *     version: 1,
 *     level: "ADM0",
 *     detail: "globe",
 *     tolerance: 0.05,
 *     countries: [ { id, name, geometry } ]
 *   }
 *
 * Geometries :
 *   - Polygon      → coordinates: number[][][]   (liste d'anneaux de points [lon, lat])
 *   - MultiPolygon → coordinates: number[][][][] (liste de polygones, chacun liste d'anneaux)
 */
type Ring = number[][]
type PolygonCoordinates = number[][][]
type MultiPolygonCoordinates = number[][][][]

type CountryGeometry =
  | { type: "Polygon"; coordinates: PolygonCoordinates }
  | { type: "MultiPolygon"; coordinates: MultiPolygonCoordinates }

interface CountryAdm0 {
  id: string
  name: string
  geometry: CountryGeometry
}

export interface CountriesGlobeData {
  version: number
  level: string
  detail: string
  tolerance: number
  countries: CountryAdm0[]
}

interface GeographicLayerProps {
  earthRadius: number
}

/**
 * Rendu des frontières ADM0 (polygones et multi-polygones)
 * projetées directement sur la sphère terrestre.
 *
 * Architecture :
 *   EarthGroup
 *   ├── EarthMesh (sphere + texture)
 *   └── GeographicLayer (ce composant)
 *
 * Étant enfant du même groupe que le mesh terrestre, le layer
 * hérite naturellement de la rotation Y du groupe —aucun
 * correctif d'angle n'est nécessaire.
 *
 * Rendu : un seul `THREE.LineSegments` avec un `BufferGeometry`
 * fusionné pour toutes les frontières de tous les pays.
 */
export function GeographicLayer({ earthRadius }: GeographicLayerProps) {
  const geoRadius = earthRadius * (1 + GEOGRAPHIC_EPSILON)

  const geometry = useMemo(() => {
    const positions: number[] = []
    const data = countriesData as unknown as CountriesGlobeData

    for (const country of data.countries) {
      const { type, coordinates } = country.geometry

      if (type === "Polygon") {
        addPolygonRings(coordinates, positions, geoRadius)
      } else {
        for (const polygon of coordinates) {
          addPolygonRings(polygon, positions, geoRadius)
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [geoRadius])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </lineSegments>
  )
}

/**
 * Ajoute les segments de ligne de chaque anneau (extérieur ou intérieur)
 * d'un polygone au tableau de positions.
 *
 * Chaque paire de points consécutifs produit 2 vertices
 * pour `THREE.LineSegments`.
 *
 * Les anneaux GeoJSON sont fermés (premier point == dernier point),
 * donc ring.length - 1 segments suffisent.
 */
function addPolygonRings(
  rings: PolygonCoordinates,
  positions: number[],
  radius: number,
): void {
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()

  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      geoLonLatToVector3(ring[i][0], ring[i][1], radius, v1)
      geoLonLatToVector3(ring[i + 1][0], ring[i + 1][1], radius, v2)
      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
    }
  }
}
