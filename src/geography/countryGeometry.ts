import * as THREE from 'three'
import type { Country } from './geoJsonTypes.ts'
import type { CountryGeometry } from './geoJsonTypes.ts'
import { geoLonLatToVector3 } from './geoProjection.ts'

/**
 * Type pour les coordonnées GeoJSON :
 * - Polygon: number[][] (anneaux de points [lon, lat])
 * - MultiPolygon: number[][][] (polygons → anneaux → points)
 */
type GeoPolygonCoordinates = number[][]
type GeoMultiPolygonCoordinates = number[][][]

/**
 * Représère un point géographique [longitude, latitude].
 */
type GeoPoint = [number, number]

/**
 * Transforme un Polygon GeoJSON en tableau de LineSegments Three.js.
 * Chaque ring (contour) duPolygon devient un LineSet séparé.
 * 
 * @param polygon GeoJSON Polygon geometry.coordinates (number[][])
 * @param radius Rayon de la sphère
 * @returns Tableau de THREE.LineSegments
 */
export function polygonToLineSegments(
  polygon: GeoPolygonCoordinates,
  radius: number
): THREE.LineSegments[] {
  const lineSets: THREE.LineSegments[] = []

  // Un Polygon GeoJSON peut avoir plusieurs rings :
  // - polygon[0] = anneau extérieur (contour principal)
  // - polygon[1], polygon[2], ... = anneaux intérieurs (trous)
  //
  // On transforme chaque ring en LineSegments

  for (let ringIndex = 0; ringIndex < polygon.length; ringIndex++) {
    const ring = polygon[ringIndex]
    if (ring.length < 3) continue

    const points: THREE.Vector3[] = []
    for (let i = 0; i < ring.length; i++) {
      // Type assertion needed because ring[i] is inferred as number
      const point: any = ring[i]
      const [lon, lat] = point
      points.push(geoLonLatToVector3(lon, lat, radius))
    }

    // Fermer le contour en répétant le premier point
    if (points[0].distanceTo(points[points.length - 1]) > 0.001) {
      points.push(points[0])
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
    })

    const lineSet = new THREE.LineSegments(geometry, material)
    lineSets.push(lineSet)
  }

  return lineSets
}

/**
 * Transforme un MultiPolygon GeoJSON en tableau de LineSegments Three.js.
 * Chaque polygon de chaque MultiPolygon est traité séparément.
 * 
 * @param multiPolygon GeoJSON MultiPolygon geometry.coordinates (number[][][])
 * @param radius Rayon de la sphère
 * @returns Tableau de THREE.LineSegments
 */
export function multipolygonToLineSegments(
  multiPolygon: GeoMultiPolygonCoordinates,
  radius: number
): THREE.LineSegments[] {
  const lineSets: THREE.LineSegments[] = []

  for (let polygonIndex = 0; polygonIndex < multiPolygon.length; polygonIndex++) {
    const polygon = multiPolygon[polygonIndex]
    // polygon est de type GeoPolygonCoordinates (number[][])
    const polygonLines = polygonToLineSegments(polygon, radius)
    lineSets.push(...polygonLines)
  }

  return lineSets
}

/**
 * Convertit les frontières géographiques d'un pays en LineSegments Three.js.
 * Gère à la fois Polygon et MultiPolygon.
 * 
 * @param country Country data from the GeoJSON
 * @param radius Rayon de la sphère (devrait être earthRadius + epsilon)
 * @returns Tableau de THREE.LineSegments représentant les frontières du pays
 */
export function countryToLineSegments(
  country: Country,
  radius: number
): THREE.LineSegments[] {
  const { type, coordinates } = country.geometry

  if (type === 'Polygon') {
    return polygonToLineSegments(coordinates as unknown as GeoPolygonCoordinates, radius)
  } else if (type === 'MultiPolygon') {
    return multipolygonToLineSegments(coordinates as unknown as GeoMultiPolygonCoordinates, radius)
  }

  console.warn(`Geométrie non supportée: ${type}`)
  return []
}

/**
 * Crée la layer géographique pour un pays.
 * Regroupe tous les LineSegments dans un THREE.Group.
 * 
 * @param country Country data
 * @param radius Rayon de la couche géographique
 * @returns THREE.Group contenant les frontières du pays
 */
export function createCountryGroup(
  country: Country,
  radius: number
): THREE.Group {
  const lineSets = countryToLineSegments(country, radius)

  const countryGroup = new THREE.Group()
  countryGroup.name = `country-${country.id}`

  // Regrouper tous les lineSets
  lineSets.forEach((lineSet) => {
    countryGroup.add(lineSet)
  })

  return countryGroup
}