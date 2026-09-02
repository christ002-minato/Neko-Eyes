import * as THREE from "three"
import { SIMULATION_EPOCH_MS } from "../time.ts"

export interface AstronomicalTime {
  simulationTime: number
  utcDate: Date
  julianDate: number
  gmst: number
  sunDirection: THREE.Vector3
  subsolarPoint: { latitude: number; longitude: number } | null
  earthRotationAngle: number
}

const J2000_EPOCH = new Date(Date.UTC(2000, 0, 1, 12, 0, 0))
const MS_PER_DAY = 86400000
const SECONDS_PER_DAY = 86400
const SIDEREAL_DAY_HOURS = 23.9344699
const SIDEREAL_DAY_SECONDS = SIDEREAL_DAY_HOURS * 3600

export function simulationTimeToUTC(simulationTime: number): Date {
  return new Date(SIMULATION_EPOCH_MS + simulationTime * 3600000)
}

export function utcToJulianDate(date: Date): number {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()
  const second = date.getUTCSeconds()
  const ms = date.getUTCMilliseconds()

  const timeOfDay = (hour + minute / 60 + second / 3600 + ms / 3600000) / 24

  let y = year
  let m = month
  if (m <= 2) {
    y -= 1
    m += 12
  }

  const a = Math.floor(y / 100)
  const b = 2 - a + Math.floor(a / 4)

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 + timeOfDay
  return jd
}

export function simulationTimeToJulianDate(simulationTime: number): number {
  return utcToJulianDate(simulationTimeToUTC(simulationTime))
}

export function calculateGMST(julianDate: number): number {
  const T = (julianDate - 2451545.0) / 36525
  const gmstDeg = 280.46061837 + 360.98564736629 * (julianDate - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000
  const gmstNormalized = ((gmstDeg % 360) + 360) % 360
  return (gmstNormalized / 180) * Math.PI
}

export function calculateSunEclipticLongitude(julianDate: number): number {
  const T = (julianDate - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const M_rad = (M / 180) * Math.PI
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad) + (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad) + 0.000289 * Math.sin(3 * M_rad)
  const lambda = L0 + C
  return ((lambda % 360) + 360) % 360
}

export function calculateSunDeclinationRightAscension(julianDate: number): { dec: number; ra: number } {
  const epsilon = 23.4392911111 - 0.0130041666667 * (julianDate - 2451545.0) / 36525
  const epsilon_rad = (epsilon / 180) * Math.PI
  const lambda = calculateSunEclipticLongitude(julianDate)
  const lambda_rad = (lambda / 180) * Math.PI

  const sin_lambda = Math.sin(lambda_rad)
  const cos_lambda = Math.cos(lambda_rad)
  const sin_epsilon = Math.sin(epsilon_rad)
  const cos_epsilon = Math.cos(epsilon_rad)

  const ra_rad = Math.atan2(sin_lambda * cos_epsilon, cos_lambda)
  const dec_rad = Math.asin(sin_epsilon * sin_lambda)

  let ra_deg = (ra_rad / Math.PI) * 180
  if (ra_deg < 0) ra_deg += 360

  return { dec: dec_rad, ra: ra_deg }
}

export function calculateSubsolarPoint(simulationTime: number, earthPosition: [number, number, number]): { latitude: number; longitude: number } | null {
  const jd = simulationTimeToJulianDate(simulationTime)
  const { dec, ra } = calculateSunDeclinationRightAscension(jd)
  const gmst = calculateGMST(jd)

  const sunHourAngle = gmst - (ra / 180) * Math.PI
  const subsolarLon = -sunHourAngle
  const subsolarLat = dec

  let lon_deg = (subsolarLon / Math.PI) * 180
  while (lon_deg > 180) lon_deg -= 360
  while (lon_deg <= -180) lon_deg += 360

  let lat_deg = (subsolarLat / Math.PI) * 180

  return { latitude: lat_deg, longitude: lon_deg }
}

export function calculateEarthRotationAngle(simulationTime: number): number {
  return (simulationTime / SIDEREAL_DAY_HOURS) * Math.PI * 2
}

export function calculateInitialEarthRotationAngle(earthPositionAtEpoch: [number, number, number]): number {
  const sunDir = new THREE.Vector3(-earthPositionAtEpoch[0], -earthPositionAtEpoch[1], -earthPositionAtEpoch[2]).normalize()
  const sunDirAngle = Math.atan2(sunDir.z, sunDir.x)

  const jd = simulationTimeToJulianDate(0)
  const { dec, ra } = calculateSunDeclinationRightAscension(jd)
  const gmst = calculateGMST(jd)

  const subsolarLon = - (gmst - (ra / 180) * Math.PI)
  let subsolarLonDeg = (subsolarLon / Math.PI) * 180
  while (subsolarLonDeg > 180) subsolarLonDeg -= 360
  while (subsolarLonDeg <= -180) subsolarLonDeg += 360

  const subsolarLonRad = (subsolarLonDeg / 180) * Math.PI
  const initialAngle = sunDirAngle - subsolarLonRad

  return initialAngle
}

export function getAstronomicalTime(simulationTime: number, earthPosition: [number, number, number]): AstronomicalTime {
  const utcDate = simulationTimeToUTC(simulationTime)
  const julianDate = simulationTimeToJulianDate(simulationTime)
  const gmst = calculateGMST(julianDate)
  const { dec, ra } = calculateSunDeclinationRightAscension(julianDate)
  const sunDir = new THREE.Vector3(-earthPosition[0], -earthPosition[1], -earthPosition[2]).normalize()
  const subsolarPoint = calculateSubsolarPoint(simulationTime, earthPosition)
  const earthRotationAngle = calculateEarthRotationAngle(simulationTime)

  return {
    simulationTime,
    utcDate,
    julianDate,
    gmst,
    sunDirection: sunDir,
    subsolarPoint,
    earthRotationAngle,
  }
}

export function formatUTCDate(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', ' UTC')
}

export function formatSimulationTime(simulationTime: number): string {
  const totalHours = Math.abs(simulationTime)
  const sign = simulationTime >= 0 ? '' : '-'
  const days = Math.floor(totalHours / 24)
  const hours = Math.floor(totalHours % 24)
  const minutes = Math.floor((totalHours % 1) * 60)
  let result = ''
  if (days > 0) result += `${days}d `
  result += `${hours}h ${minutes}m`
  return sign + result
}

export function getBodyOrbitalElements(bodyId: string) {
  const elements: Record<string, { period: number; eccentricity: number; inclination: number; semiMajorAxis: number }> = {
    mercury: { period: 87.97 * 24, eccentricity: 0.2056, inclination: 7.005 * Math.PI / 180, semiMajorAxis: 0.387 },
    venus: { period: 224.7 * 24, eccentricity: 0.0068, inclination: 3.395 * Math.PI / 180, semiMajorAxis: 0.723 },
    earth: { period: 365.256 * 24, eccentricity: 0.0167, inclination: 0.0, semiMajorAxis: 1.0 },
    mars: { period: 686.98 * 24, eccentricity: 0.0934, inclination: 1.85 * Math.PI / 180, semiMajorAxis: 1.524 },
    jupiter: { period: 4332.59 * 24, eccentricity: 0.0489, inclination: 1.305 * Math.PI / 180, semiMajorAxis: 5.204 },
    saturn: { period: 10759.22 * 24, eccentricity: 0.0555, inclination: 2.484 * Math.PI / 180, semiMajorAxis: 9.582 },
    uranus: { period: 30688.5 * 24, eccentricity: 0.0472, inclination: 0.773 * Math.PI / 180, semiMajorAxis: 19.22 },
    neptune: { period: 60182 * 24, eccentricity: 0.0086, inclination: 1.77 * Math.PI / 180, semiMajorAxis: 30.05 },
    moon: { period: 27.322 * 24, eccentricity: 0.0549, inclination: 5.145 * Math.PI / 180, semiMajorAxis: 0.00257 },
    sun: { period: 0, eccentricity: 0, inclination: 0, semiMajorAxis: 0 },
  }
  return elements[bodyId] ?? { period: 0, eccentricity: 0, inclination: 0, semiMajorAxis: 0 }
}