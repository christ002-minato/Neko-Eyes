/**
 * Layer rendering — préparation du rendu 3D pour Neko Eyes.
 *
 * Responsabilités :
 * - Création de lumières Three.js cohérentes avec les positions orbitales
 * - Gestion de l'éclairage directionnel (Soleil)
 * - Day/night cycle computation
 * - Material configurations compatibles éclairage
 * - Abstractions réutilisables pour l'apparence 3D
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

export type { PlanetRenderData, SunRenderData, PlanetMaterialProps, DayNightConfig } from "./types.ts"
export { createSunLight, isBodyIlluminated, getPlanetMaterialConfig, useSolarLighting } from "./lighting.ts"
