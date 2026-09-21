import * as THREE from "three"
import type { PlanetRenderData } from "./types.ts"

export function createPlanetMesh(
  data: PlanetRenderData,
  materialProps: THREE.MeshStandardMaterialParameters,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> {
  const cleanProps: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(materialProps)) {
    if (value !== undefined) {
      cleanProps[key] = value
    }
  }

  const geometry = new THREE.SphereGeometry(data.radius, 32, 32)
  const material = new THREE.MeshStandardMaterial(
    cleanProps as THREE.MeshStandardMaterialParameters,
  )
  return new THREE.Mesh(geometry, material)
}