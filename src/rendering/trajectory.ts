/**
 * Trajectory colors — Config centralisée des trajectoires orbitales.
 *
 * Chaque corps du Système solaire possède une trajectoire avec :
 *  - une couleur distincte et cohérente (inspirée des rendus NASA) ;
 *  - une épaisseur (pixels d'écran) et une opacité propres, volontairement
 *    discrètes mais clairement visibles à tous les niveaux de zoom ;
 *  - la couleur est conservée que le corps soit sélectionné ou non.
 *
 * La trajectoire de la Lune possède une couleur propre la distinguant de
 * celle de la Terre.
 *
 * Ce module est purement visuel : il ne modifie ni les calculs orbitaux
 * (V0.9.4) ni les données JPL (V1.0.x).
 */

export interface TrajectoryVisualConfig {
  color: string
  /** Épaisseur de ligne en pixels d'écran (rendering Line2). */
  lineWidth: number
  /** Opacité (0..1). */
  opacity: number
  /** Ratio de luminosité (multiplié par l'opacité). */
  brightness: number
}

export const TRAJECTORY_COLORS: Record<string, string> = {
  mercury: "#c0b0a4",
  venus: "#eac97d",
  earth: "#6ab0e0",
  mars: "#e07a4d",
  jupiter: "#d8a86f",
  saturn: "#e8d4a6",
  uranus: "#a4e6ea",
  neptune: "#8493d6",
  moon: "#d0d0d0",
}

/** Couleur de trajectoire de secours (corps sans entrée explicite). */
export const DEFAULT_TRAJECTORY_COLOR = "#9aa8be"

const DEFAULT_LINE_WIDTH = 2
const DEFAULT_OPACITY = 0.8
const DEFAULT_BRIGHTNESS = 1

export const TRAJECTORY_VISUAL: Record<string, Partial<TrajectoryVisualConfig>> = {
  moon: { lineWidth: 2, opacity: 0.75 },
  mercury: { lineWidth: 2, opacity: 0.7 },
  venus: { lineWidth: 2, opacity: 0.7 },
  earth: { lineWidth: 2.2, opacity: 0.85 },
  mars: { lineWidth: 2, opacity: 0.75 },
  jupiter: { lineWidth: 2.2, opacity: 0.8 },
  saturn: { lineWidth: 2.2, opacity: 0.8 },
  uranus: { lineWidth: 2, opacity: 0.7 },
  neptune: { lineWidth: 2, opacity: 0.7 },
}

export function getTrajectoryColor(bodyId: string): string {
  return TRAJECTORY_COLORS[bodyId] ?? DEFAULT_TRAJECTORY_COLOR
}

export function getTrajectoryConfig(bodyId: string): TrajectoryVisualConfig {
  const base = TRAJECTORY_VISUAL[bodyId] ?? {}
  return {
    color: getTrajectoryColor(bodyId),
    lineWidth: base.lineWidth ?? DEFAULT_LINE_WIDTH,
    opacity: base.opacity ?? DEFAULT_OPACITY,
    brightness: base.brightness ?? DEFAULT_BRIGHTNESS,
  }
}
