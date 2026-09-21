import * as THREE from "three"
import type { SunRenderData } from "./types.ts"

export function createSunMesh(
  data: SunRenderData,
  materialProps: THREE.MeshStandardMaterialParameters,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> {
  const cleanProps: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(materialProps)) {
    if (value !== undefined) {
      cleanProps[key] = value
    }
  }

  const geometry = new THREE.SphereGeometry(data.radius, 64, 64)
  const material = new THREE.MeshStandardMaterial(
    cleanProps as THREE.MeshStandardMaterialParameters,
  )
  return new THREE.Mesh(geometry, material)
}