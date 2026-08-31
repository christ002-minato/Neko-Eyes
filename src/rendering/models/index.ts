/**
 * Couche models — assets 3D astronomiques réels (NASA/JPL/USGS).
 *
 * Sépare clairement :
 * - données orbitales (src/orbital)
 * - données JPL (src/orbital/ephemeris)
 * - logique de caméra (CameraController / OrbitControls)
 * - rendu des corps (ce module)
 *
 * Tout asset ici référencé est une donnée scientifique réelle ; aucun asset
 * n'est généré, reconstruit ou simulé artificiellement.
 */
export * from "./types.ts"
export * from "./modelRegistry.ts"
export * from "./modelLoader.ts"
export * from "./useAstroModel.ts"
