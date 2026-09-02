/**
 * Module temporel partagé — source unique de vérité pour l'époque de simulation.
 *
 * L'époque (= simTime 0) est capturée une seule fois au chargement du module
 * (≈ démarrage de l'application). Cette valeur est partagée par tous les
 * consommateurs (astronomicalTime, JPLProvider, UI) pour garantir la cohérence :
 *
 *   - à ×1, l'horloge simulée affiche l'heure locale réelle de l'utilisateur
 *   - aucune conversion heure↔seconde n'est nécessaire dans les formules
 *     (simulationTime est en heures, rotationPeriod en heures, orbitalPeriod en heures)
 *   - simTime 0 = instant du démarrage de l'app
 *
 * Convention : toutes les durées du système sont en HEURES.
 * L'intégration temporelle dans useFrame convertit les secondes réelles en heures :
 *   simTime += delta_real_seconds × speed / 3600
 * Ainsi, à ×1, 1 seconde réelle = 1/3600 h = 1 seconde simulée.
 */
export const SIMULATION_EPOCH_MS: number = Date.now()

/**
 * Convertit le temps simulé (heures) en date UTC.
 * simTime 0 = SIMULATION_EPOCH_MS (instant de démarrage).
 */
export function simulationTimeToDateMs(simulationTime: number): Date {
  return new Date(SIMULATION_EPOCH_MS + simulationTime * 3600000)
}

/**
 * Renvoie la date UTC au format YYYY-MM-DD (pour JPL Horizons, granularité jour).
 */
export function simulationTimeToDateStr(simulationTime: number): string {
  const d = simulationTimeToDateMs(simulationTime)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Renvoie un identifiant de jour unique (nombre entier) pour la date simulée.
 * Utile comme clé de dépendance React pour throttler les requêtes réseau
 * (une seule requête JPL par jour simulé, pas par frame).
 */
export function simulationTimeToDayId(simulationTime: number): number {
  return Math.floor((SIMULATION_EPOCH_MS + simulationTime * 3600000) / 86400000)
}

/**
 * Formate une date UTC en chaîne locale (fuseau horaire du navigateur).
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * Formate une date UTC en chaîne UTC (pour affichage astronomique).
 */
export function formatUTCTime(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}
