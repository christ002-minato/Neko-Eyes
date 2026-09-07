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
