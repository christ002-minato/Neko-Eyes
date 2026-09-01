import type { BodyType } from "../textureLoader.ts"
import type { AstroModelAsset } from "./types.ts"

/**
 * Registre des modèles astronomiques réels.
 *
 * Source unique de vérité associant chaque corps du système solaire à son
 * asset réel documenté. Tous les assets ici référencés sont des données
 * scientifiques réelles (NASA/JPL/USGS) : cartes équirectangulaires d'albédo
 * ou modèles 3D GLB/glTF. Aucun asset n'est généré, reconstruit ou simulé
 * artificiellement (pas d'effet GLSL, pas de forme procédurale).
 *
 * Convention de nommage des fichiers : `public/textures/{bodyId}.jpg`.
 *
 * Pour ajouter un vrai modèle 3D GLB/glTF :
 *   1. placer le fichier dans `public/models/`
 *   2. renseigner `assetType: "gltf"`, `gltfFile`, `scale`, `orientation`
 *   3. la chaîne de chargement et de rendu s'adapte sans autre modification.
 */
export const ASTRO_MODEL_REGISTRY: Record<BodyType, AstroModelAsset> = {
  sun: {
    id: "sun",
    label: "The Sun",
    assetType: "texture",
    source: "NASA SVS — Solar Dynamics Observatory (SDO), asset 11255",
    sourceUrl: "https://svs.gsfc.nasa.gov/11255",
    license: "NASA (domaine public — politique d'utilisation des médias NASA)",
    format: "JPEG 2048×2048, composite SDO AIA",
    textures: ["albedo (AIA composite)"],
    textureFile: "/textures/sun3.jpg",
    fallback: false,
    notes:
      "Le Soleil conserve son THREE.Light (PointLight) comme source lumineuse " +
      "principale ; cette texture n'est que le rendu visuel de la photosphère.",
  },
  mercury: {
    id: "mercury",
    label: "Mercury",
    assetType: "texture",
    source:
      "NASA SVS — MESSENGER global mosaic (asset 11197 / 14110), Image1_rawpng.png",
    sourceUrl: "https://svs.gsfc.nasa.gov/11197",
    license: "NASA/JHUAPL/CIW (domaine public — données MESSENGER)",
    format: "PNG → JPEG équirectangulaire 2048×1024",
    textures: ["albedo (couleur globale MESSENGER)"],
    textureFile: "/textures/mercury.jpg",
    fallback: false,
    notes: "Carte globale équirectangulaire MESSENGER (projection ~2:1).",
  },
  venus: {
    id: "venus",
    label: "Venus",
    assetType: "texture",
    source: "NASA 3D Resources — Images and Textures / Venus",
    sourceUrl:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures/Venus",
    license: "NASA (domaine public)",
    format: "JPEG équirectangulaire 1440×720",
    textures: ["albedo (couleur globale Venus)"],
    textureFile: "/textures/venus.jpg",
    fallback: false,
  },
  earth: {
    id: "earth",
    label: "Earth",
    assetType: "texture",
    source: "NASA 3D Resources — Images and Textures / Earth (A)",
    sourceUrl:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures/Earth%20(A)",
    license: "NASA (domaine public)",
    format: "JPEG équirectangulaire 1440×720",
    textures: ["albedo (couleur globale Terre)"],
    textureFile: "/textures/earth.jpg",
    fallback: false,
  },
  moon: {
    id: "moon",
    label: "The Moon",
    assetType: "texture",
    source: "NASA SVS — CGI Moon Kit, LROC WAC color map (asset 4720)",
    sourceUrl: "https://svs.gsfc.nasa.gov/4720",
    license: "NASA/USGS/ASU (domaine public — données LRO)",
    format: "JPEG équirectangulaire 2048×1024",
    textures: ["albedo (couleur LROC WAC)"],
    textureFile: "/textures/moon.jpg",
    fallback: false,
    notes:
      "Carte équirectangulaire LROC WAC (lunar color). La CGI Moon Kit fournit " +
      "également une carte de déplacement (non utilisée pour préserver la " +
      "non-régression du maillage sphère).",
  },
  mars: {
    id: "mars",
    label: "Mars",
    assetType: "texture",
    source: "NASA 3D Resources — Images and Textures / Mars",
    sourceUrl:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures/Mars",
    license: "NASA (domaine public)",
    format: "JPEG équirectangulaire 1440×720",
    textures: ["albedo (couleur globale Mars)"],
    textureFile: "/textures/mars.jpg",
    fallback: false,
  },
  jupiter: {
    id: "jupiter",
    label: "Jupiter",
    assetType: "texture",
    source: "NASA 3D Resources — Images and Textures / Jupiter",
    sourceUrl:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures/Jupiter",
    license: "NASA (domaine public)",
    format: "JPEG équirectangulaire 720×360",
    textures: ["albedo (couleur globale Jupiter)"],
    textureFile: "/textures/jupiter.jpg",
    fallback: false,
  },
  saturn: {
    id: "saturn",
    label: "Saturn",
    assetType: "texture",
    source: "NASA 3D Resources — Images and Textures / Saturn",
    sourceUrl:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures/Saturn",
    license: "NASA (domaine public)",
    format: "JPEG équirectangulaire 720×360",
    textures: ["albedo (couleur globale Saturne)"],
    textureFile: "/textures/saturn.jpg",
    fallback: false,
    notes:
      "Anneaux conservés via le système d'anneaux procéduraux existant " +
      "(secours documenté) — aucun asset d'anneau GLB réel n'a été intégré.",
  },
  uranus: {
    id: "uranus",
    label: "Uranus",
    assetType: "texture",
    source:
      "Solar System Scope — Uranus texture (dérivée des données NASA Voyager/Hubble)",
    sourceUrl: "https://www.solarsystemscope.com/textures",
    license: "CC BY 4.0 (attribution) — données de base NASA Voyager/Hubble",
    format: "JPEG équirectangulaire 2048×1024",
    textures: ["albedo (couleur globale Uranus)"],
    textureFile: "/textures/uranus.jpg",
    fallback: false,
    notes:
      "Aucune carte équirectangulaire Uranus officielle NASA clé-en-main n'a été " +
      "identifiée ; cet asset est dérivé de données NASA (Voyager/Hubble) et " +
      "clairement licencié CC BY 4.0.",
  },
  neptune: {
    id: "neptune",
    label: "Neptune",
    assetType: "texture",
    source: "NASA 3D Resources — Images and Textures / Neptune",
    sourceUrl:
      "https://github.com/nasa/NASA-3D-Resources/tree/master/Images%20and%20Textures/Neptune",
    license: "NASA (domaine public)",
    format: "JPEG équirectangulaire 720×360",
    textures: ["albedo (couleur globale Neptune)"],
    textureFile: "/textures/neptune.jpg",
    fallback: false,
  },
}

export function getAstroAsset(id: BodyType): AstroModelAsset {
  return ASTRO_MODEL_REGISTRY[id]
}

export function isRealAsset(id: BodyType): boolean {
  return !ASTRO_MODEL_REGISTRY[id].fallback
}

export function listAstroAssets(): AstroModelAsset[] {
  return Object.values(ASTRO_MODEL_REGISTRY)
}

export function listRealAssets(): AstroModelAsset[] {
  return listAstroAssets().filter((a) => !a.fallback)
}

export function listFallbackAssets(): AstroModelAsset[] {
  return listAstroAssets().filter((a) => a.fallback)
}
