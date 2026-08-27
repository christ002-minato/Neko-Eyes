import * as THREE from "three"
import type { BodyType } from "./textureLoader.ts"

/**
 * Types de la couche rendering — indépendants de Three.js.
 *
 * Ces types séparent les données de calcul (orbitales) de la représentation
 * 3D. Ils sont typés mais n'importent pas Three.js au niveau du calcul.
 */

export interface PlanetRenderData {
  /** Position mondiale en unités scène [x, y, z] */
  position: [number, number, number]
  /** Rayon du corps en unités scène */
  radius: number
  /** Couleur principale (hex string) */
  color: string
  /** ID du corps pour identification */
  bodyId: string
  /** Indique si c'est la Terre (pour spéciaux Terre/Lune) */
  isEarth?: boolean
  /** Indique si c'est la Lune */
  isMoon?: boolean
  /** Type de corps pour configuration texture/matière */
  bodyType?: BodyType
}

export interface SunRenderData {
  /** Position du Soleil [x, y, z] — toujours [0, 0, 0] */
  position: [number, number, number]
  /** Rayon du Soleil en unités scène */
  radius: number
  /** Couleur du Soleil */
  color: string
  /** Type de corps pour configuration texture/matière */
  bodyType?: BodyType
  /** Rotation period in simulated hours. */
  rotationPeriod?: number
}

/** Configuration de matériau de base pour une planète */
export interface PlanetMaterialProps {
  /** Couleur de base de la planète */
  color: string
  /** Éclat optionnel */
  glow?: string
  /** Rugosité (0.0 = miroir, 1.0 = mat) */
  roughness?: number
  /** Métallicité (0.0 = non métallique, 1.0 = métallique) */
  metalness?: number
  /** Map de diffuse/albedo (texture) */
  map?: THREE.Texture
}

/** Props transmis au composant Planet pour le rendu */
export interface PlanetRenderProps {
  /** Données orbitales/planétaires */
  planet: PlanetRenderData
  /** Temps simulé actuel */
  time: number
  /** Vitesse de rotation de la planète */
  rotationSpeed?: number
  /** Déclencheur de sélection */
  onSelect?: () => void
  /** Déclencheur de focus */
  onFocus?: () => void
  /** État de sélection */
  selected?: boolean
  /** État de focus */
  isFocusing?: boolean
  /** Type de corps pour configuration matière */
  bodyType?: BodyType
}

/** Props pour le composant Soleil */
export interface SunRenderProps {
  /** Données solaires */
  sun: SunRenderData
  /** Déclencheur de sélection */
  onSelect?: () => void
  /** État de sélection */
  selected?: boolean
}

/** Configuration d'éclairage day/night */
export interface DayNightConfig {
  hasDaylight: boolean
  daylightDirection: THREE.Vector3
  ambientIntensity: number
  directIntensity: number
}

/** Type de configuration d'éclairage solaire */
export type SolarLighting = {
  light: THREE.DirectionalLight
  dayNightConfig: DayNightConfig
}

/** Type de configuration de matériau planetair */
export type PlanetMaterialConfig = {
  roughness: number
  metalness: number
}

/** Type pour les chemins de textures */
export type { BodyType }
export { TEXTURE_PATHS } from "./textureLoader.ts"