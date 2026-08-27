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
  // Directionnelle light representing the Sun — fill léger de champ lointain.
  const light = new THREE.DirectionalLight(0xffffff, 0.04)
  
  // Le Soleil est à l'origine [0,0,0].
  const sunDir = new THREE.Vector3()
  sunDir.set(1, 0, 0)
  light.position.set(sunPosition[0], sunPosition[1], sunPosition[2])
  light.target.position.set(sunPosition[0] + sunDir.x, sunPosition[1] + sunDir.y, sunPosition[2] + sunDir.z)
  light.target.updateMatrixWorld()
  light.castShadow = true
  
  // Config shadow settings for realism
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.bias = -0.0001
  light.shadow.radius = 4

  // Source ponctuelle au Soleil pour un éclairage radial jour/nuit cohérent.
  // decay = 0 -> pas d'atténuation en distance : chaque planète, proche ou
  // lointaine, reçoit la même irradiance du côté tourné vers le Soleil.
  // La face éclairée est nettement plus brillante que la face sombre (ambiance
  // quasi nulle), produisant une séparation jour/nuit réelle sur tous les corps.
  const pointLight = new THREE.PointLight(0xffffff, 2.8, 0, 0)
  pointLight.position.set(sunPosition[0], sunPosition[1], sunPosition[2])
  
  // Day/night configuration
  const dayNightConfig: DayNightConfig = {
    hasDaylight: true,
    daylightDirection: sunDir,
    ambientIntensity: 0.02,
    directIntensity: 1,
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
  const dotProduct = bodyVec.dot(sunDirection)
  return dotProduct > 0
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
  
  const planetIllumination: Record<string, boolean> = {}
  const knownBodies = ["earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune", "mercury", "venus"]
  
  for (const bodyId of knownBodies) {
    if (planetPositions[bodyId]) {
      planetIllumination[bodyId] = isBodyIlluminated(
        planetPositions[bodyId],
        dayNightConfig.daylightDirection
      )
    }
  }
  
  return {
    light,
    pointLight,
    dayNightConfig,
    planetIllumination,
  }
}
