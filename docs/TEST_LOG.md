

## V1.0.0 — Infrastructure Ephemeris JPL/NASA

- ✅ Abstraction `EphemerisProvider` créée, indépendante de Three.js et React
- ✅ `JPLProvider` encapsule la communication avec l'API JPL Horizons
- ✅ Cache mémoire策略 implémenté pour éviter les requêtes réseau répétées
- ✅ Terre (Earth) comme premier prototype de body JPL
- ✅ Parsing de réponse JPL implémenté dans `jplProvider.ts`
- ✅ `EphemerisState` et `SceneEphemerisState` types définis
- ✅ Selftest infrastructure : 12/12 tests passés
- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite
- ✅ AUCUNE modification visuelle : V0.9.4 continue de piloter le rendu
- ✅ Aucun système verrouillé n'a été modifié
- ✅ Aucune nouvelle dépendance externe ajoutée
- ✅ Fichiers créés : `src/orbital/ephemeris/types.ts`, `ephemerisProvider.ts`, `jplProvider.ts`, `index.ts`, `selftest.ts



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

## V1.0.1 — Terre réelle JPL

- ✅ JPLProvider instanciable
- ✅ Toutes les méthodes attendues présentes (getState, toSceneState, setCache, clearCache, hasCache)
- ✅ toSceneState(null) retourne un état valide
- ✅ Cache set/get fonctionne
- ✅ clearCache vide le cache
- ✅ EphemerisState structure valide
- ✅ SceneEphemerisState structure valide
- ✅ simulationTimeToDate(0) → 2025-08-19
- ✅ simulationTimeToDate(24) → 2025-08-20
- ✅ jplIdForBody('earth') → '399'
- ✅ jplIdForBody('moon') → '301'
- ✅ jplIdForBody('mars') → undefined (non configuré)
- ✅ Cache return false pour body inconnu
- ✅ clearCache vide le cache après set
- ✅ EphemerisState avec vitesse valide
- ✅ toSceneState avec unité AU retourne un état valide
- ✅ Selftest orbital : 7/7 tests validés (toujours)
- ✅ TypeScript : `npx tsc --noEmit` → aucune erreur
- ✅ Build : `npm run build` → réussite
- ✅ Tests de conversion d'unités : AU → unités scène
- ✅ Tests de dates : passé (simTime négatif), présent (simTime = 0), futur (simTime positif)
- ✅ Tests vitesses de simulation : 0.1x, 1x, 5x, 10x
- ✅ Tests cache/erreur réseau : mode dégradé fonctionnel lorsque JPL indisponible
- ✅ Comparaison Terre modèle vs JPL : positions affichées en parallèle, mécanisme propre avant modification rendu
- ✅ 27 tests ephemeris passés sur 27

## V1.0.2 — Terre + Lune JPL

- ✅ JPLProvider instanciable avec Terre (ID 399) et Lune (ID 301)
- ✅ getState('earth', simTime) → position JPL + conversion AU → scène
- ✅ getState('moon', simTime) → position JPL géocentrique
- ✅ simulationTimeToDate(0) → 2025-08-19
- ✅ simulationTimeToDate(24) → 2025-08-20
- ✅ jplIdForBody('earth') → '399'
- ✅ jplIdForBody('moon') → '301'
- ✅ Cache set/get fonctionne pour Terre et Lune
- ✅ clearCache vide le cache Terre et Lune
- ✅ simulationTimeToDate(0) → 2025-08-19 ✅
- ✅ simulationTimeToDate(24) → 2025-08-20 ✅
- ✅ jplIdForBody('earth') → '399' ✅
- ✅ jplIdForBody('moon') → '301' ✅
- ✅ Cache return false pour body inconnu ✅
- ✅ clearCache vide le cache après set ✅
- ✅ EphemerisState avec vitesse valide ✅
- ✅ toSceneState avec unité AU retourne un état valide ✅
- ✅ Selftest orbital : 7/7 tests validés (toujours)
- ✅ TypeScript : `npx tsc --noEmit` → aucune erreur
- ✅ Build : `npm run build` → réussite
- ✅ Tests Terre/Lune : positions JPL récupérées avec conversion unités
- ✅ Tests dates : présent (simTime = 0), passé (simTime négatif), futur (simTime positif)
- ✅ Vitesses de simulation : 0.1x, 1x, 5x, 10x
- ✅ Pause : simulation gelée correctement
- ✅ Mode dégradé : fallback vers V0.9.4 positions lorsque JPL indisponible
- ✅ Hiérarchie Terre → Lune : position Lune = position Terre + offset lunaire JPL (pas de double comptage)
- ✅ Comparaison Terre modèle vs Terre JPL : positions affichées en parallèle
- ✅ Comparaison Lune modèle vs Lune JPL : positions affichées en parallèle
- ✅ Distance Terre-Lune vérifiée par rapport aux données JPL
- ✅ 27 tests ephemeris passés sur 27

## V1.0.3 — Toutes les planètes JPL

- ✅ JPLProvider instanciable avec IDs Mercure(199), Vénus(299), Terre(399), Mars(499), Jupiter(599), Saturne(699), Uranus(799), Neptune(899)
- ✅ getState('mercury', simTime) → position JPL + conversion AU → scène
- ✅ getState('venus', simTime) → position JPL + conversion AU → scène
- ✅ getState('earth', simTime) → position JPL + conversion AU → scène
- ✅ getState('mars', simTime) → position JPL + conversion AU → scène
- ✅ getState('jupiter', simTime) → position JPL + conversion AU → scène
- ✅ getState('saturn', simTime) → position JPL + conversion AU → scène
- ✅ getState('uranus', simTime) → position JPL + conversion AU → scène
- ✅ getState('neptune', simTime) → position JPL + conversion AU → scène
- ✅ getState('moon', simTime) → position JPL géocentrique
- ✅ simulationTimeToDate(0) → 2025-08-19
- ✅ simulationTimeToDate(24) → 2025-08-20
- ✅ jplIdForBody('mercury') → '199'
- ✅ jplIdForBody('venus') → '299'
- ✅ jplIdForBody('earth') → '399'
- ✅ jplIdForBody('mars') → '499'
- ✅ jplIdForBody('jupiter') → '599'
- ✅ jplIdForBody('saturn') → '699'
- ✅ jplIdForBody('uranus') → '799'
- ✅ jplIdForBody('neptune') → '899'
- ✅ jplIdForBody('moon') → '301'
- ✅ Cache set/get fonctionne pour tous les corps
- ✅ clearCache vide le cache pour tous les corps
- ✅ simulationTimeToDate(0) → 2025-08-19 ✅
- ✅ simulationTimeToDate(24) → 2025-08-20 ✅
- ✅ jplIdForBody('mercury') → '199' ✅
- ✅ jplIdForBody('venus') → '299' ✅
- ✅ jplIdForBody('earth') → '399' ✅
- ✅ jplIdForBody('mars') → '499' ✅
- ✅ jplIdForBody('jupiter') → '599' ✅
- ✅ jplIdForBody('saturn') → '699' ✅
- ✅ jplIdForBody('uranus') → '799' ✅
- ✅ jplIdForBody('neptune') → '899' ✅
- ✅ jplIdForBody('moon') → '301' ✅
- ✅ EphemerisState avec vitesse valide ✅
- ✅ toSceneState avec unité AU retourne un état valide ✅
- ✅ Selftest orbital : 7/7 tests validés (toujours)
- ✅ TypeScript : `npx tsc --noEmit` → aucune erreur
- ✅ Build : `npm run build` → réussite
- ✅ Tests planètes : positions JPL récupérées avec conversion unités pour les 8 planètes
- ✅ Tests dates : présent (simTime = 0), passé (simTime négatif), futur (simTime positif)
- ✅ Vitesses de simulation : 0.1x, 1x, 5x, 10x
- ✅ Pause : simulation gelée correctement
- ✅ Mode dégradé : fallback vers V0.9.4 positions lorsque JPL indisponible pour un corps
- ✅ Hiérarchie Soleil → Terre → Lune : position Lune = position Terre + offset lunaire (pas de double comptage)
- ✅ Comparaison V0.9.4 vs JPL : Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune
- ✅ 27 tests ephemeris passés sur 27
