/**
 * Layer rendering — préparation du rendu 3D pour Neko Eyes.
 *
 * Responsabilités :
 * - Création de lumières Three.js cohérentes avec les positions orbitales
 * - Gestion de l'éclairage directionnel (Soleil)
 * - Day/night cycle computation
 * - Material configurations compatibles éclairage
 * - Abstractions réutilisables pour l'apparence 3D
 * - Visual Scale / Scene Mapping : séparation données astronomiques ↔ scène visuelle
 * - Texture loading & caching : chargement performant des textures planétaires
 *
 * Ce module ne contient aucune dépendance Three.js au niveau du calcul
 * des orbites. Il ne fait que préparer l'éclairage et les matériaux
 * en se basant sur les positions fournies par src/orbital/.
 *
 * Convention : tous les exports sont typés mais sans dépendance
 * Three.js directe au niveau des calculs. Les types d'import
 * Three.js sont utilisés uniquement au moment de la création
 * effective des lumières et matériaux (dans les composants React).
 */

export type { PlanetRenderData, SunRenderData, PlanetMaterialProps, DayNightConfig, BodyType } from "./types.ts"
export { createSunLight, isBodyIlluminated, getPlanetMaterialConfig, useSolarLighting } from "./lighting.ts"
export type { VisualScaleConfig } from "./visualScale.ts"
export { getVisualScale, setVisualScale, resetVisualScale, mapOrbitalDistanceToVisual, mapBodySizeToVisual, mapOrbitalPositionToVisual, computeVisualScales, DEFAULT_VISUAL_SCALE } from "./visualScale.ts"
export { loadTexture, getTexture, hasTexture, preloadAllTextures, getMaterialConfig, clearTextureCache, TEXTURE_PATHS } from "./textureLoader.ts"
export { getRotationAngle } from "./rotation.ts"
export { createPlanetMesh } from "./planetMesh.ts"
export { createSunMesh } from "./sunMesh.ts"
export * from "./models/index.ts"
export { TRAJECTORY_COLORS, DEFAULT_TRAJECTORY_COLOR, getTrajectoryColor, getTrajectoryConfig, type TrajectoryVisualConfig } from "./trajectory.ts"
export { createOrbitTrajectory, disposeOrbitTrajectory, type OrbitTrajectory, type OrbitTrajectoryOptions } from "./orbitTrajectory.ts"
