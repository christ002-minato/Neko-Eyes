import * as THREE from "three"
import type { BodyType } from "./textureLoader.ts"
import { PlanetRenderData, PlanetMaterialProps, PlanetRenderProps, DayNightConfig } from "./types.ts"

export type SolarLighting = {
  light: THREE.DirectionalLight
  pointLight: THREE.PointLight
  dayNightConfig: DayNightConfig
}

export type PlanetMaterialConfig = {
  roughness: number
  metalness: number
}

export function createSunLight(
  sunPosition: [number, number, number],
  _planetPositions: Record<string, [number, number, number]>
): SolarLighting {
  const light = new THREE.DirectionalLight(0xffffff, 0.04)

  light.position.set(1000, 1000, 1000)
  light.target.position.set(0, 0, 0)
  light.target.updateMatrixWorld()
  light.castShadow = false

  const pointLight = new THREE.PointLight(0xffffff, 2.8, 0, 0)
  pointLight.position.set(sunPosition[0], sunPosition[1], sunPosition[2])
  pointLight.castShadow = false

  const dayNightConfig: DayNightConfig = {
    hasDaylight: true,
    daylightDirection: new THREE.Vector3(-1, 0, 0).normalize(),
    ambientIntensity: 0.02,
    directIntensity: 2.8,
  }

  return { light, pointLight, dayNightConfig }
}

export function isBodyIlluminated(
  _bodyPosition: [number, number, number],
  _sunDirection: THREE.Vector3
): boolean {
  return true
}

export function getPlanetMaterialConfig(
  bodyType: BodyType,
  _isIlluminated: boolean
): PlanetMaterialConfig {
  const roughnessMap: Record<string, number> = {
    earth: 0.5,
    moon: 0.8,
    mars: 0.8,
    jupiter: 0.6,
    saturn: 0.7,
    mercury: 0.8,
    venus: 0.5,
    uranus: 0.5,
    neptune: 0.5,
    sun: 0.3,
  }

  const metalnessMap: Record<string, number> = {
    earth: 0.1,
    moon: 0.0,
    mars: 0.0,
    jupiter: 0.2,
    saturn: 0.1,
    mercury: 0.1,
    venus: 0.0,
    uranus: 0.0,
    neptune: 0.0,
    sun: 0.1,
  }

  return {
    roughness: roughnessMap[bodyType] ?? 0.7,
    metalness: metalnessMap[bodyType] ?? 0.1,
  }
}

export function useSolarLighting(
  sunPosition: [number, number, number],
  planetPositions: Record<string, [number, number, number]>
) {
  const { light, pointLight, dayNightConfig } = createSunLight(sunPosition, planetPositions)

  const planetIllumination: Record<string, boolean> = {}
  const knownBodies = ["earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune", "mercury", "venus", "sun"]

  for (const bodyId of knownBodies) {
    if (planetPositions[bodyId] || bodyId === "sun") {
      planetIllumination[bodyId] = true
    }
  }

  return {
    light,
    pointLight,
    dayNightConfig,
    planetIllumination,
  }
}