import type { BodyType } from "../textureLoader.ts"

/**
 * Type d'asset astronomique reconnu par le registre de modèles.
 *
 * - "texture" : carte équirectangulaire réelle (albédo/couleur) provenant d'une
 *   source NASA/JPL/USGS (ou dérivée NASA, licenciée explicitement). La planète
 *   étant une sphère, la carte équirectangulaire est l'asset scientifique réel.
 * - "gltf"    : modèle 3D GLB/glTF existant (maillage + matériaux), chargé une
 *   seule fois et réutilisé. Prêt à l'emploi pour tout futur asset GLB officiel.
 */
export type AstroAssetType = "gltf" | "texture"

/**
 * Métadonnées d'un asset astronomique réel pour un corps donné.
 *
 * Chaque champ documente précisément la provenance afin de respecter
 * l'exigence de traçabilité des sources (NASA/JPL).
 */
export interface AstroModelAsset {
  /** Identifiant du corps (doit correspondre à BodyType) */
  id: BodyType
  /** Nom lisible */
  label: string
  /** Nature de l'asset */
  assetType: AstroAssetType
  /** Organisation / mission source (ex. "NASA SVS", "USGS Astrogeology") */
  source: string
  /** URL publique exacte de provenance */
  sourceUrl: string
  /** Conditions d'utilisation (NASA = domaine public ; CC BY 4.0 le cas échéant) */
  license: string
  /** Format et dimensions réels de l'asset */
  format: string
  /** Cartes fournies (albédo, normal, roughness, déplacement…) */
  textures: string[]
  /** Chemin local de la texture équirectangulaire (public/textures/...) */
  textureFile?: string
  /** Chemin local du modèle GLB/glTF (public/models/...) */
  gltfFile?: string
  /** Échelle à appliquer au modèle GLB (unités scène) */
  scale?: number
  /** Orientation (radians) à appliquer au modèle GLB */
  orientation?: { x: number; y: number; z: number }
  /** true => rendu de secours (sphère procédurale colorée) sans asset réel */
  fallback: boolean
  /** Notes complémentaires (orientation, limitations…) */
  notes?: string
}
