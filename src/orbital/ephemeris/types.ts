/**
 * État de corps épimérique retourné par un provider.
 * Indépendant de Three.js et React.
 */
export interface EphemerisState {
  /** Position en unités JPL (généralement km ou unités astronomiques) */
  position: [number, number, number]
  /** Vitesse optionnelle en unités JPL */
  velocity?: [number, number, number]
  /** Unité de mesure de la position */
  unit?: string
  /** Référentiel de référence (ex. : 'J2000', 'ECLIPTIC') */
  referenceFrame?: string
  /** Époque d'origine du temps (timestamp ou description) */
  epoch?: string
  /** Identifiant du corps */
  bodyId: string
}

/**
 * État simplifié pour consommation par le modèle orbital V0.9.4.
 * Converti depuis l'état JPL complet.
 */
export interface SceneEphemerisState {
  /** Position en unités scène Three.js */
  position: [number, number, number]
  /** Identifiant du corps */
  bodyId: string
}
