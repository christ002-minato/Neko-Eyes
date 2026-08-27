import * as THREE from "three"

/**
 * Texture Loader — Infrastructure de chargement et mise en cache des textures planétaires.
 *
 * Responsabilités :
 * - Chargement des textures au démarrage (pas dans useFrame)
 * - Mise en cache unique pour réutilisation
 * - Fallback en cas d'erreur de chargement
 * - Aucune allocation dans la boucle de rendu
 * - Aucune requête réseau dans useFrame
 *
 * Convention : les textures sont identifiées par un bodyType (clé de TEXTURE_PATHS).
 */

export type BodyType =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"

export const TEXTURE_PATHS: Record<BodyType, string> = {
  sun: "/textures/sun.jpg",
  mercury: "/textures/mercury.jpg",
  venus: "/textures/venus.jpg",
  earth: "/textures/earth.jpg",
  moon: "/textures/moon.jpg",
  mars: "/textures/mars.jpg",
  jupiter: "/textures/jupiter.jpg",
  saturn: "/textures/saturn.jpg",
  uranus: "/textures/uranus.jpg",
  neptune: "/textures/neptune.jpg",
} as const

const textureCache = new Map<BodyType, THREE.Texture>()
const loadingPromises = new Map<BodyType, Promise<THREE.Texture>>()

const loader = new THREE.TextureLoader()

function createPlaceholderTexture(color: string): THREE.Texture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const PLACEHOLDER_COLORS: Record<BodyType, string> = {
  sun: "#FFD700",
  mercury: "#b0a090",
  venus: "#FFC649",
  earth: "#4B9CD3",
  moon: "#C0C0C0",
  mars: "#C1440E",
  jupiter: "#C88B3A",
  saturn: "#FAD5A5",
  uranus: "#7DE8E8",
  neptune: "#4B70DD",
}

export function loadTexture(bodyType: BodyType): Promise<THREE.Texture> {
  if (textureCache.has(bodyType)) {
    return Promise.resolve(textureCache.get(bodyType)!)
  }

  if (loadingPromises.has(bodyType)) {
    return loadingPromises.get(bodyType)!
  }

  const promise = (async () => {
    try {
      const path = TEXTURE_PATHS[bodyType]
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          path,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.RepeatWrapping
            tex.minFilter = THREE.LinearMipmapLinearFilter
            tex.magFilter = THREE.LinearFilter
            tex.generateMipmaps = true
            resolve(tex)
          },
          undefined,
          (err) => reject(err)
        )
      })
      textureCache.set(bodyType, texture)
      return texture
    } catch (error) {
      console.warn(`Failed to load texture for ${bodyType}, using placeholder:`, error)
      const placeholder = createPlaceholderTexture(PLACEHOLDER_COLORS[bodyType])
      textureCache.set(bodyType, placeholder)
      return placeholder
    } finally {
      loadingPromises.delete(bodyType)
    }
  })()

  loadingPromises.set(bodyType, promise)
  return promise
}

export function getTexture(bodyType: BodyType): THREE.Texture | undefined {
  return textureCache.get(bodyType)
}

export function hasTexture(bodyType: BodyType): boolean {
  return textureCache.has(bodyType)
}

export function preloadAllTextures(): Promise<Map<BodyType, THREE.Texture>> {
  const promises = Object.keys(TEXTURE_PATHS).map((key) => loadTexture(key as BodyType))
  return Promise.all(promises).then((textures) => {
    const map = new Map<BodyType, THREE.Texture>()
    ;(Object.keys(TEXTURE_PATHS) as BodyType[]).forEach((key, i) => {
      map.set(key, textures[i])
    })
    return map
  })
}

export function getMaterialConfig(bodyType: BodyType): { roughness: number; metalness: number } {
  const configs: Record<BodyType, { roughness: number; metalness: number }> = {
    sun: { roughness: 0.3, metalness: 0.1 },
    mercury: { roughness: 0.8, metalness: 0.1 },
    venus: { roughness: 0.5, metalness: 0.0 },
    earth: { roughness: 0.5, metalness: 0.1 },
    moon: { roughness: 0.8, metalness: 0.0 },
    mars: { roughness: 0.8, metalness: 0.0 },
    jupiter: { roughness: 0.6, metalness: 0.2 },
    saturn: { roughness: 0.7, metalness: 0.1 },
    uranus: { roughness: 0.5, metalness: 0.0 },
    neptune: { roughness: 0.5, metalness: 0.0 },
  }
  return configs[bodyType] ?? { roughness: 0.7, metalness: 0.1 }
}

export function clearTextureCache(): void {
  for (const texture of textureCache.values()) {
    texture.dispose()
  }
  textureCache.clear()
  loadingPromises.clear()
}