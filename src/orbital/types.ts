/**
 * Position en unités scène, espace coordonné identique à la scène Three.js actuelle.
 */
export type Vec3 = [number, number, number]

/**
 * Corps orbital du modèle de calcul (aucune dépendance Three.js).
 *
 * conventions (identiques au V scène actuel) :
 * - `orbitalRadius` et les positions retournées sont en unités scène.
 * - `orbitalPeriod` et `rotationPeriod` sont en unités de temps simulé
 *   (1 unité sim = 1 heure simulée, voir Système Temporel V0.7).
 * - `phase` est l'angle au temps simulé = 0, en radians.
 * - Les orbites sont définies par leurs paramètres képlériens.
 * - `parent` chaines sont résolus récursivement (ex. : Moon → Earth → Sun),
 *   de sorte que la position d'un enfant est toujours absolue dans l'espace scène.
 * - `rotationPeriod` est des données descriptives pour la rotation ; non utilisé par getBodyPosition.
 * - `eccentricity` optionnel : 0 ou absent → orbite circulaire, valeur > 0 → orbite elliptique.
 * - `inclination` optionnel : en radians, 0 → coplanaire avec l'écliptique, > 0 → orbite inclinée.
 * - `nodeLongitude` optionnel : en radians, longitude du nœud montant
 *   (angle dans le plan de référence depuis l'axe X vers le point où l'orbite
 *   franchit le plan par-dessus, dans le sens prograde). Par défaut 0.
 * - `eccentricity` et `inclination` sont indépendants l'un de l'autre.
 */
export interface OrbitalBody {
  id: string
  orbitalRadius: number
  orbitalPeriod: number
  phase: number
  eccentricity?: number
  inclination?: number
  nodeLongitude?: number
  rotationPeriod?: number
  parent?: OrbitalBody
}

/**
 * Format d'auteur plat pour un corps ; parents sont câblés par defineOrbitalSystem.
 */
export interface OrbitalBodyDefinition {
  id: string
  orbitalRadius: number
  orbitalPeriod: number
  phase: number
  eccentricity?: number
  inclination?: number
  nodeLongitude?: number
  rotationPeriod?: number
  parentId?: string
}
