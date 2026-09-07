import * as THREE from 'three'

/**
 * Convertit des coordonnées géographique (longitude, latitude) en THREE.Vector3
 * sur une sphère de rayon donné.
 * 
 * Convention : longitude en degrés [-180, 180], latitude en degrés [-90, 90].
 * Le résultat est un vecteur unitaire mis à l'échelle par le rayon.
 * 
 * Formule standard Three.js sphère :
 *   x = r * cos(lat) * cos(lon)
 *   y = r * sin(lat)
 *   z = r * cos(lat) * sin(lon)
 * 
 * NOTE : La rotation de la Terre existante est appliquée par le groupe parent
 * (voir Planet component). Les coordonnées GeoJSON sont projetées dans le repère
 * LOCAL de la Terre, et la rotation du parent fait tourner les frontières
 * avec la Terre. Aucune compensation de rotation supplémentaire n'est nécessaire
 * dans cette fonction.
 */
export function geoLonLatToVector3(
  longitude: number,
  latitude: number,
  radius: number
): THREE.Vector3 {
  const latRad = (latitude / 180) * Math.PI
  const lonRad = (longitude / 180) * Math.PI

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)
  const y = radius * Math.sin(latRad)
  const z = radius * Math.cos(latRad) * Math.sin(lonRad)

  return new THREE.Vector3(x, y, z)
}

/**
 * Calcule le rayon pour la couche géographique.
 * Doit être légèrement supérieur au rayon de la Terre pour éviter le z-fighting.
 * 
 * @param earthRadius Rayon de la Terre Three.js
 * @param epsilon Marges de sécurité (recommandé: 0.001 à 0.01 selon l'échelle)
 * @returns Rayon pour la couche géographique
 */
export function getGeographicRadius(earthRadius: number, epsilon: number = 0.001): number {
  return earthRadius + epsilon
}

/**
 * Vérifie qu'un Vector3 a une longueur proche du rayon attendu.
 */
export function verifyVector3Length(
  v: THREE.Vector3,
  expectedRadius: number,
  tolerance: number = 0.01
): { valid: boolean; actualLength: number; deviation: number } {
  const actualLength = v.length()
  const deviation = Math.abs(actualLength - expectedRadius)
  return {
    valid: deviation <= tolerance,
    actualLength,
    deviation,
  }
}