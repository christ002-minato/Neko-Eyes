import * as THREE from "three"
import type { AstroModelAsset } from "./types.ts"
import { ASTRO_MODEL_REGISTRY } from "./modelRegistry.ts"

/**
 * Chargeur d'assets astronomiques réels.
 *
 * Responsabilités (conformes aux exigences de performance) :
 * - Chargement unique par asset (cache de Promises), réutilisé partout.
 * - Aucun chargement dans useFrame ; aucun fetch réseau par frame.
 * - Aucune création répétée de géométrie/matériau.
 * - Support GLB/glTF (GLTFLoader + DRACO) et cartes équirectangulaires.
 *
 * En cas d'échec de chargement, la Promise rejette : le composant retombe
 * alors sur le rendu de secours (sphère colorée), sans jamais casser le
 * système existant.
 */

export type LoadedAstroAsset =
  | { kind: "texture"; texture: THREE.Texture }
  | { kind: "gltf"; object: THREE.Object3D }

const textureCache = new Map<string, THREE.Texture>()
const promiseCache = new Map<string, Promise<LoadedAstroAsset>>()

// GLTFLoader + DRACOLoader sont chargés paresseusement (dynamic import) afin de
// ne pas alourdir le bundle principal tant qu'aucun modèle GLB/glTF réel n'est
// intégré. Le décodeur DRACO n'est récupéré (une seule fois) que si un GLB
// compressé est effectivement chargé — jamais dans la boucle de rendu.

async function loadGltf(url: string): Promise<THREE.Object3D> {
  const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/loaders/DRACOLoader.js"),
  ])
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")
  const loader = new GLTFLoader()
  loader.setDRACOLoader(dracoLoader)
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve(gltf.scene),
      undefined,
      reject,
    )
  })
}

function loadTextureFile(url: string): Promise<THREE.Texture> {
  const cached = textureCache.get(url)
  if (cached) return Promise.resolve(cached)

  const loader = new THREE.TextureLoader()
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.wrapS = THREE.ClampToEdgeWrapping
        tex.wrapT = THREE.ClampToEdgeWrapping
        tex.repeat.set(1, 1)
        tex.offset.set(0, 0)
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = true
        tex.anisotropy = 8
        textureCache.set(url, tex)
        resolve(tex)
      },
      undefined,
      reject,
    )
  })
}

export function loadAstroAsset(asset: AstroModelAsset): Promise<LoadedAstroAsset> {
  const cached = promiseCache.get(asset.id)
  if (cached) return cached

  const promise = (async (): Promise<LoadedAstroAsset> => {
    try {
      if (asset.assetType === "gltf" && asset.gltfFile) {
        const object = await loadGltf(asset.gltfFile)
        if (asset.scale !== undefined) object.scale.setScalar(asset.scale)
        if (asset.orientation) {
          object.rotation.set(
            asset.orientation.x,
            asset.orientation.y,
            asset.orientation.z,
          )
        }
        return { kind: "gltf", object }
      }

      const url = asset.textureFile ?? `/textures/${asset.id}.jpg`
      const texture = await loadTextureFile(url)
      return { kind: "texture", texture }
    } catch (err) {
      console.warn(
        `[modelLoader] Échec de chargement de l'asset réel pour "${asset.id}":`,
        err,
      )
      throw err
    }
  })()

  promiseCache.set(asset.id, promise)
  return promise
}

export function preloadAllAstroAssets(): Promise<LoadedAstroAsset[]> {
  const assets = Object.values(ASTRO_MODEL_REGISTRY)
  return Promise.all(
    assets.map((a) => loadAstroAsset(a).catch(() => null)),
  ).then((results) => results.filter(Boolean) as LoadedAstroAsset[])
}

export function clearAstroAssetCache(): void {
  for (const tex of textureCache.values()) tex.dispose()
  textureCache.clear()
  promiseCache.clear()
}
