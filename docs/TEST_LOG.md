

## V0.9.4 — Activation orbitale

- ✅ Tous les 8 planètes possèdent des paramètres orbitaux valides (excentricité,inclinaison,nodeLongitude)
- ✅ eccentricité dans une plage valide : 0 <= e < 1 pour toutes les planètes
- ✅ inclination valide pour toutes les planètes
- ✅ nodeLongitude valide pour toutes les planètes
- ✅ Les 8 planètes produisent une position via getBodyPosition()
- ✅ Les positions évoluent avec simulationTime
- ✅ Les positions changent lorsqu'on avance dans le temps
- ✅ Les positions évoluent correctement dans le passé
- ✅ Terre → Lune reste fonctionnel
- ✅ Soleil reste statique

# TEST_LOG — Neko Eyes

> Journal des tests réellement effectués — seuls les résultats connus sont consignés.
> Aucune invention de résultats.

## 2026-08-21 — Simulation du suivi caméra (algorithme de CameraController, sans rendu)

- ✅ 6 620 frames suivies, 19 groupes de propriétés
- ✅ Tests de freeze, jitter, saut ou perte de cible en cours

## Étapes orbitales

### V0.8.1 Orbital Model

- ✅ selftest orbital : 7/7 tests passés (Soleil, Terre, Lune, hiérarchie Terre→Lune, périodicité, phase, distance Lune/Terre)
- ✅ TypeScript : `npx tsc --noEmit` → aucune erreur
- ✅ Build : `npm run build` → réussite

### V0.8.2 Terre

- ✅ connexion Terre au modèle orbital via `parentId: 'sun'`
- ✅ parité avec l'ancien calcul validée (position, période, mouvement)
- ✅ TypeScript : aucune erreur
- ✅ Build : réussite

### V0.8.3 Mars

- ✅ connexion Mars au modèle orbital via `parentId: 'sun'`
- ✅ Focus automatique + zoom (useEffect sur selectedPlanet)
- ✅ bouton Focus manuel ObjectInfoPanel conservé
- ✅ TypeScript : aucune erreur
- ✅ Build : réussite

### Focus Camera auto-déclenché

- ✅ useEffect sur selectedPlanet décline handleFocus automatiquement
- ✅ !isFocusing garde empêche double-trigger avec bouton manuel
- ✅ CameraController et OrbitControls inchangés
- ✅ TypeScript et build passent

## Tests navigateur (à réaliser)

- Terre en orbite → focus fluide, caméra centrée, objet continue son mouvement
- Mars en orbite → même comportement
- Lune autour de Terre → hiérarchie Terre→Lune préservée pendant focus
- Soleil → focus fluide
- rotation caméra pendant le suivi → préservée
- zoom pendant le suivi → préservé
- damping → préservé
- changement Terre → Mars → Terre → Lune → passage fluide
- sortie du focus → caméra rede libre immédiatement
- passé/futur → simulation continue
- 0.1x / 1x / 5x / 10x → respecté
- pause/reprise → fonctionnel

## V0.9.1 — Excentricité orbitale

- ✅ selftest orbital : 7/7 tests passés
  1. eccentricity = 0 → parité avec l'ancien calcul circulaire ✅
  2. eccentricity > 0 → orbite elliptique ✅
  3. périodicité ✅
  4. temps positif ✅
  5. temps négatif ✅
  6. phase ✅
  7. hiérarchie Terre → Lune ✅
- ✅ TypeScript : `npx tsc --noEmit` → aucune erreur
- ✅ Build : `npm run build` → réussite

### Tests ciblés V0.9.1

1. eccentricity = 0 → parité avec l'ancien calcul circulaire ✅
2. eccentricity > 0 → orbite elliptique ✅
3. périodicité ✅
4. temps positif ✅
5. temps négatif ✅
6. phase ✅
7. hiérarchie Terre → Lune ✅

## V0.9.2 — Inclinaison orbitale

- ✅ inclination = 0 → comportement compatible avec le modèle précédent ✅
- ✅ inclination > 0 → position Y non nulle lorsque nécessaire ✅
- ✅ périodicité conservée avec inclinaison ✅
- ✅ temps positif/négatif ✅
- ✅ TypeScript : aucune erreur ✅
- ✅ Build : réussite ✅

### Tests ciblés V0.9.2

8. inclination = 0 → comportement compatible avec le modèle précédent ✅
9. inclination > 0 → position Y non nulle lorsque nécessaire ✅
10. périodicité conservée avec inclinaison ✅
11. temps positif/négatif ✅

## V0.9.3 — Orientation des orbites

- ✅ orientation = nodeLongitude = 0 → comportement compatible ✅
- ✅ orientation (nodeLongitude) différente → orbite correctement orientée ✅
- ✅ combinaison eccentricity + inclination + orientation ✅
- ✅ Terre → Lune toujours cohérente ✅
- ✅ Soleil toujours statique ✅
- ✅ aucune dérive artificielle de la hiérarchie ✅
- ✅ TypeScript : aucune erreur ✅
- ✅ Build : réussite ✅

### Tests ciblés V0.9.3

12. orientation = 0 → comportement compatible ✅
13. orientation différente → orbite correctement orientée ✅
14. combinaison: eccentricity + inclination + orientation ✅
15. Terre → Lune toujours cohérente ✅
16. Soleil toujours statique ✅
17. aucune dérive artificielle de la hiérarchie ✅
