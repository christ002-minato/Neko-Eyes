import * as THREE from "three"
import type { BodyType } from "./textureLoader.ts"
import { PlanetRenderData, PlanetMaterialProps, PlanetRenderProps, DayNightConfig } from "./types.ts"

/**
 * Type de configuration d'éclairage solaire.
 */
export type SolarLighting = {
  light: THREE.DirectionalLight
  pointLight: THREE.PointLight
  dayNightConfig: DayNightConfig
}

/** Type de configuration de matériau planetair */
export type PlanetMaterialConfig = {
  roughness: number
  metalness: number
}

/**
 * Configuration d'éclairage solaire pour le système.
 *
 * Crée une lumière directionnelle représentant le Soleil,
 * positionnée de manière cohérente avec le modèle orbital.
 *
 * @param sunPosition Position du Soleil en unités scène (toujours [0, 0, 0] dans le système actuel)
 * @param planetPositions Dictionnaire des positions des planètes [bodyId] -> [x, y, z]
 * @returns Objet Three.js Light + configuration day/night
 */
export function createSunLight(
  sunPosition: [number, number, number],
  planetPositions: Record<string, [number, number, number]>
): SolarLighting {
  const light = new THREE.DirectionalLight(0xffffff, 1.1)

  const sampledBodies = Object.entries(planetPositions)
    .filter(([bodyId]) => bodyId !== "sun")
    .map(([, position]) => new THREE.Vector3(position[0], position[1], position[2]))
    .filter((vector) => vector.lengthSq() > 0.0001)

  const sunDir = sampledBodies.length > 0
    ? sampledBodies.reduce((acc, vector) => acc.add(vector), new THREE.Vector3()).normalize()
    : new THREE.Vector3(1, 0, 0)

  light.position.set(sunPosition[0], sunPosition[1], sunPosition[2])
  light.target.position.set(sunPosition[0] + sunDir.x, sunPosition[1] + sunDir.y, sunPosition[2] + sunDir.z)
  light.target.updateMatrixWorld()
  light.castShadow = true

  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.bias = -0.0001
  light.shadow.radius = 4

  const pointLight = new THREE.PointLight(0xffffff, 2.6, 0, 2)
  pointLight.position.set(sunPosition[0], sunPosition[1], sunPosition[2])

  const dayNightConfig: DayNightConfig = {
    hasDaylight: true,
    daylightDirection: sunDir,
    ambientIntensity: 0.05,
    directIntensity: 1.1,
  }

  return { light, pointLight, dayNightConfig }
}

/**
 * Calcule si un corpsplanétaire est actuellement éclairé.
 * Utilise la direction du Soleil par rapport au corps.
 *
 * @param bodyPosition Position du corpsplanétaire en unités scène
 * @param sunDirection Direction vers le Soleil (unité)
 * @returns true si le corps est éclairé, false s'il est dans l'ombre
 */
export function isBodyIlluminated(
  bodyPosition: [number, number, number],
  sunDirection: THREE.Vector3
): boolean {
  const bodyVec = new THREE.Vector3(bodyPosition[0], bodyPosition[1], bodyPosition[2])
  const direction = sunDirection.clone().normalize()
  return bodyVec.clone().normalize().dot(direction) > 0
}

/**
 * Obtient la configuration de matériau compatible avec l'éclairage
 * pour un corpsplanétaire, en tenant compte de son type.
 *
 * @param bodyType Type de corps ('earth', 'moon', 'mars', etc.)
 * @param isIlluminated Si le corps est actuellement éclairé
 * @returns Configuration de matériau avec propriétés d'éclairage
 */
export function getPlanetMaterialConfig(
  bodyType: BodyType,
  isIlluminated: boolean
): PlanetMaterialConfig {
  const roughnessMap: Record<string, number> = {
    earth: isIlluminated ? 0.5 : 0.9,
    moon: isIlluminated ? 0.8 : 0.9,
    mars: isIlluminated ? 0.8 : 0.9,
    jupiter: isIlluminated ? 0.6 : 0.7,
    saturn: isIlluminated ? 0.7 : 0.8,
  }
  
  const metalnessMap: Record<string, number> = {
    earth: isIlluminated ? 0.1 : 0.0,
    moon: isIlluminated ? 0.0 : 0.0,
    mars: isIlluminated ? 0.0 : 0.0,
    jupiter: isIlluminated ? 0.2 : 0.1,
    saturn: isIlluminated ? 0.1 : 0.1,
  }
  
  return {
    roughness: roughnessMap[bodyType] ?? 0.7,
    metalness: metalnessMap[bodyType] ?? 0.1,
  }
}

/**
 * Hook qui prépare les données d'éclairage pour useFrame.
 * À appeler chaque frame avec la position actuelle du Soleil et des planètes.
 *
 * @param sunPosition Position du Soleil [x, y, z]
 * @param planetPositions Dictionnaire {bodyId -> [x, y, z]} des positions des planètes
 * @returns Objet contenant la lumière Three.js et configs d'éclairage
 */
export function useSolarLighting(
  sunPosition: [number, number, number],
  planetPositions: Record<string, [number, number, number]>
) {
  const { light, pointLight, dayNightConfig } = createSunLight(sunPosition, planetPositions)

  const sunVector = new THREE.Vector3(...sunPosition)
  const planetIllumination: Record<string, boolean> = {}
  const knownBodies = ["earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune", "mercury", "venus"]

  const daylightDirection = new THREE.Vector3()
  const bodyVectors = knownBodies
    .map((bodyId) => planetPositions[bodyId] ? new THREE.Vector3(...planetPositions[bodyId]) : null)
    .filter((vector): vector is THREE.Vector3 => vector !== null && vector.lengthSq() > 0.0001)

  if (bodyVectors.length > 0) {
    daylightDirection.copy(bodyVectors.reduce((acc, vector) => acc.add(vector), new THREE.Vector3())).normalize()
  } else {
    daylightDirection.set(1, 0, 0)
  }

  for (const bodyId of knownBodies) {
    if (planetPositions[bodyId]) {
      planetIllumination[bodyId] = isBodyIlluminated(
        planetPositions[bodyId],
        daylightDirection
      )
    }
  }

  if (sunVector.lengthSq() > 0) {
    daylightDirection.copy(sunVector.multiplyScalar(-1)).normalize()
  }

  return {
    light,
    pointLight,
    dayNightConfig,
    planetIllumination,
  }
}
