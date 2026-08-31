import { useEffect, useState } from "react"
import * as THREE from "three"
import type { BodyType } from "../textureLoader.ts"
import { getAstroAsset } from "./modelRegistry.ts"
import { loadAstroAsset } from "./modelLoader.ts"

/**
 * Hook React de chargement d'un asset astronomique réel pour un corps.
 *
 * - Charge l'asset une seule fois (cache partagé via modelLoader).
 * - Retourne la texture (asset "texture") ou l'Object3D (asset "gltf").
 * - En cas d'erreur, `texture`/`object` restent null : le composant retombe
 *   sur le rendu de secours (sphère colorée) sans rien casser.
 *
 * Aucun chargement n'a lieu dans useFrame : le hook se déclenche une fois
 * au montage (et si l'id change).
 */
export function useAstroModel(id: BodyType) {
  const asset = getAstroAsset(id)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [object, setObject] = useState<THREE.Object3D | null>(null)
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")

  useEffect(() => {
    let cancelled = false
    setStatus("loading")

    loadAstroAsset(asset)
      .then((res) => {
        if (cancelled) return
        if (res.kind === "texture") setTexture(res.texture)
        else setObject(res.object)
        setStatus("loaded")
      })
      .catch(() => {
        if (cancelled) return
        setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [asset])

  return { asset, texture, object, status }
}
