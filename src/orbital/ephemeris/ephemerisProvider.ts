import type { EphemerisState, SceneEphemerisState } from "./types.ts"

/**
 * Abstraction indépendante de Three.js et React pour récupérer
 * l'état épimérique d'un corps céleste.
 *
 * Le provider est censé être créé par une usine (factory) ou injecté
 * et ne connaît aucune dépendance framework.
 */
export interface EphemerisProvider {
  /**
   * Récupère l'état épimérique d'un corps à un instant donné.
   *
   * @param bodyId Identifiant du corps (ex. : "earth", "moon")
   * @param simulationTime Temps simulé actuel (unités de l'application Neko Eyes)
   * @returns État épimérique du corps, ou null si inconnu
   */
  getState(bodyId: string, simulationTime: number): EphemerisState | null

  /**
   * Convertit un état épimérique brut en état compatible avec la scène Three.js.
   *
   * La conversion dépend du référentiel, de l'unité et de la conversion
   * vers le système de coordonnées de Neko Eyes (units scène, origo au Soleil).
   *
   * @param state État épimérique brut depuis le provider
   * @returns État simplifié consommable par le modèle orbital Three.js
   */
  toSceneState(state: EphemerisState): SceneEphemerisState
}
