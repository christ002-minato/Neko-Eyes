import * as THREE from "three"
import { geoLonLatToVector3 } from "./geoProjection.ts"

/**
 * Self-test for geoLonLatToVector3 projection.
 *
 * Tests:
 *  - Vector length equals radius for each test country
 *  - All projected coordinates are finite
 *  - Reference points (equator, poles, known longitudes) are correct
 */
export function runGeoProjectionSelftest(): void {
  const tolerance = 1e-6
  const radius = 1.0

  const testCountries: Array<{ name: string; lon: number; lat: number }> = [
    { name: "CIV", lon: -5.5, lat: 7.5 },
    { name: "FRA", lon: 2.0, lat: 46.5 },
    { name: "BRA", lon: -47.0, lat: -15.0 },
    { name: "USA", lon: -96.0, lat: 39.0 },
    { name: "JPN", lon: 138.0, lat: 36.0 },
  ]

  for (const country of testCountries) {
    const v = geoLonLatToVector3(country.lon, country.lat, radius)

    const length = v.length()
    if (Math.abs(length - radius) > tolerance) {
      throw new Error(
        `[geoProjection] ${country.name}: vector length ${length} differs from radius ${radius} by ${Math.abs(length - radius)}`,
      )
    }

    if (
      !Number.isFinite(v.x) ||
      !Number.isFinite(v.y) ||
      !Number.isFinite(v.z)
    ) {
      throw new Error(
        `[geoProjection] ${country.name}: non-finite coordinate (${v.x}, ${v.y}, ${v.z})`,
      )
    }
  }

  // Equator + Prime Meridian → (+r, 0, 0)
  const equator = geoLonLatToVector3(0, 0, radius)
  if (
    Math.abs(equator.x - radius) > tolerance ||
    Math.abs(equator.y) > tolerance ||
    Math.abs(equator.z) > tolerance
  ) {
    throw new Error(
      `[geoProjection] Equator/PM: expected (${radius}, 0, 0), got (${equator.x}, ${equator.y}, ${equator.z})`,
    )
  }

  // North Pole → (0, +r, 0)
  const northPole = geoLonLatToVector3(0, 90, radius)
  if (
    Math.abs(northPole.x) > tolerance ||
    Math.abs(northPole.y - radius) > tolerance ||
    Math.abs(northPole.z) > tolerance
  ) {
    throw new Error(
      `[geoProjection] North Pole: expected (0, ${radius}, 0), got (${northPole.x}, ${northPole.y}, ${northPole.z})`,
    )
  }

  // South Pole → (0, −r, 0)
  const southPole = geoLonLatToVector3(0, -90, radius)
  if (
    Math.abs(southPole.x) > tolerance ||
    Math.abs(southPole.y + radius) > tolerance ||
    Math.abs(southPole.z) > tolerance
  ) {
    throw new Error(
      `[geoProjection] South Pole: expected (0, ${-radius}, 0), got (${southPole.x}, ${southPole.y}, ${southPole.z})`,
    )
  }

  // lon=90°E, lat=0 → (0, 0, −r)   [Three.js u=0.75 = −Z]
  const lon90 = geoLonLatToVector3(90, 0, radius)
  if (
    Math.abs(lon90.x) > tolerance ||
    Math.abs(lon90.y) > tolerance ||
    Math.abs(lon90.z + radius) > tolerance
  ) {
    throw new Error(
      `[geoProjection] lon=90°E: expected (0, 0, ${-radius}), got (${lon90.x}, ${lon90.y}, ${lon90.z})`,
    )
  }

  // lon=−90°W, lat=0 → (0, 0, +r)   [Three.js u=0.25 = +Z]
  const lonNeg90 = geoLonLatToVector3(-90, 0, radius)
  if (
    Math.abs(lonNeg90.x) > tolerance ||
    Math.abs(lonNeg90.y) > tolerance ||
    Math.abs(lonNeg90.z - radius) > tolerance
  ) {
    throw new Error(
      `[geoProjection] lon=-90°W: expected (0, 0, ${radius}), got (${lonNeg90.x}, ${lonNeg90.y}, ${lonNeg90.z})`,
    )
  }

  // Rotation solidarity: applying the same Y-rotation to both the
  // GeographicLayer point and the Earth mesh must keep them coincident.
  const testAngle = Math.PI / 4
  const p = geoLonLatToVector3(45, 0, radius)
  const rotated = p
    .clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), testAngle)
  // The rotated point must still lie on the sphere
  if (Math.abs(rotated.length() - radius) > tolerance) {
    throw new Error(
      `[geoProjection] Rotation solidarity: rotated length ${rotated.length()} != radius ${radius}`,
    )
  }
}
