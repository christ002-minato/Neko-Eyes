import { Line2 } from "three/examples/jsm/lines/Line2.js"
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js"

/**
 * Orbit trajectories — Rendu des trajectoires orbitales en lignes.
 *
 * Construit pour chaque corps une trajectoire circulaire dessinée avec
 * `Line2` + `LineMaterial` (three.js fourni, aucune dépendance externe).
 * L'épaisseur de ligne est en pixels d'écran (`worldUnits = false`), ce qui
 * garantit une lisibilité constante quel que soit le niveau de zoom : les
 * trajectoires restent visibles et nettes même quand la caméra s'éloigne
 * fortement, et gardent la même épaisseur relative au corps sélectionné ou non.
 *
 * La géométrie et le matériau sont créés une seule fois (pas d'allocation
 * dans `useFrame`). Le `LineMaterial.onBeforeRender` met à jour
 * automatiquement la résolution pour un rendu écran correct.
 *
 * Ce module est purement visuel : il ne modifie ni les calculs orbitaux
 * (V0.9.4) ni les positions JPL (V1.0.x).
 */

export interface OrbitTrajectoryOptions {
  /** Rayon de la trajectoire (unités scène) — cercle dans le plan XZ. */
  radius: number
  /** Couleur de la trajectoire (hex). */
  color: string
  /** Épaisseur de ligne en pixels d'écran. */
  lineWidth: number
  /** Opacité (0..1). */
  opacity: number
  /** Nombre de segments du cercle (lisibilité à fort zoom). */
  segments?: number
}

export interface OrbitTrajectory {
  line: Line2
  material: LineMaterial
}

export function createOrbitTrajectory(options: OrbitTrajectoryOptions): OrbitTrajectory {
  const segments = options.segments ?? 640
  const positions = new Float32Array((segments + 1) * 3)
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    positions[i * 3 + 0] = options.radius * Math.cos(angle)
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = options.radius * Math.sin(angle)
  }

  const geometry = new LineGeometry()
  geometry.setPositions(positions)

  const material = new LineMaterial({
    color: options.color,
    opacity: options.opacity,
    worldUnits: false,
    depthWrite: false,
    transparent: true,
  })
  // `linewidth` n'est pas déclaré dans les types @types/three mais existe
  // à l'exécution (getter/setter sur `uniforms.linewidth`).
  ;(material as unknown as { linewidth: number }).linewidth = options.lineWidth

  const line = new Line2(geometry, material)
  return { line, material }
}

export function disposeOrbitTrajectory(trajectory: OrbitTrajectory): void {
  trajectory.material.dispose()
  trajectory.line.geometry.dispose()
}
