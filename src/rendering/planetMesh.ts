import * as THREE from "three"
import type { PlanetRenderData } from "./types.ts"

export function createPlanetMesh(
  data: PlanetRenderData,
  materialProps: THREE.MeshStandardMaterialParameters,
): THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> {
  const geometry = new THREE.SphereGeometry(data.radius, 32, 32)
  const material = new THREE.MeshStandardMaterial(materialProps)
  return new THREE.Mesh(geometry, material)
}