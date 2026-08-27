import * as THREE from "three"
import type { SunRenderData } from "./types.ts"

export function createSunMesh(
  data: SunRenderData,
  materialProps: THREE.MeshStandardMaterialParameters,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> {
  const geometry = new THREE.SphereGeometry(data.radius, 64, 64)
  const material = new THREE.MeshStandardMaterial(materialProps)
  return new THREE.Mesh(geometry, material)
}