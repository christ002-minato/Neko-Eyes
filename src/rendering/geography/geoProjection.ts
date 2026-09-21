import * as THREE from "three"

/**
 * Geographic projection : longitude/latitude → THREE.Vector3.
 *
 * Uses the same coordinate convention as Three.js SphereGeometry UV mapping:
 *   x = r · cos(lat) · cos(lon)
 *   y = r · sin(lat)
 *   z = −r · cos(lat) · sin(lon)
 *
 * This ensures that lon/lat coordinates align with standard Earth textures
 * (NASA Blue Marble, etc.) wrapped by SphereGeometry without any additional
 * rotation offset.
 *
 * When placed inside the same rotation group as the Earth mesh, the group's
 * Y-rotation (which includes `calculateInitialEarthRotationAngle`) naturally
 * aligns the projected borders with the texture.
 */
const DEG_TO_RAD = Math.PI / 180

export function geoLonLatToVector3(
  lon: number,
  lat: number,
  radius: number,
  target?: THREE.Vector3,
): THREE.Vector3 {
  const latRad = lat * DEG_TO_RAD
  const lonRad = lon * DEG_TO_RAD
  const cosLat = Math.cos(latRad)

  const v = target ?? new THREE.Vector3()
  v.set(
    radius * cosLat * Math.cos(lonRad),
    radius * Math.sin(latRad),
    -radius * cosLat * Math.sin(lonRad),
  )
  return v
}

/**
 * Inverse de la projection : point 3D d'impact → (latitude, longitude).
 *
 * Convertit un point d'impact du Raycaster (repère monde) en coordonnées
 * géographiques. La dé-rotation axiale −rotationY annule la rotation du groupe
 * de la Terre (spin diurne) pour ramener le vecteur dans le repère fixe de la
 * texture équirectangulaire (repère de geoLonLatToVector3).
 *
 * Le vecteur est normalisé : seule la direction compte, donc le rayon du maillage
 * d'impact n'influence pas le résultat.
 */
const AXIS_Y = new THREE.Vector3(0, 1, 0)

export function earthImpactToLatLon(
  worldPoint: THREE.Vector3,
  earthCenter: THREE.Vector3,
  rotationY: number,
): { latitude: number; longitude: number } | null {
  const local = worldPoint.clone().sub(earthCenter)
  local.applyAxisAngle(AXIS_Y, -rotationY)

  const radius = local.length()
  if (radius < 1e-10) return null

  const latitude = Math.asin(THREE.MathUtils.clamp(local.y / radius, -1, 1)) * (180 / Math.PI)
  const longitude = Math.atan2(-local.z, local.x) * (180 / Math.PI)

  return { latitude, longitude }
}
