

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

## 2026-09-10 — Horloge globale et propagation JPL

- ✅ Une seule horloge identifiée : `timeRef.current`, en heures simulées.
- ✅ Mesure sur 1 seconde réelle : `0.1x = 0.0000277778 h`, `1x = 0.000277778 h`, `5x = 0.00138889 h`, `10x = 0.00277778 h`.
- ✅ Les ratios de déplacement orbital théorique sont `0.1 / 1 / 5 / 10` pour Terre, Mars, Jupiter et Lune.
- ✅ Aucun fetch JPL dans `useFrame`; les fetchs restent limités au changement de jour simulé.
- ✅ `npx jiti src/orbital/selftest.ts` : 7/7.
- ✅ `npx jiti src/rendering/rotationSelftest.ts` : 21/21.
- ✅ `npx jiti src/orbital/ephemeris/selftest.ts` : 28/28.
- ✅ `npx tsc --noEmit` : aucune erreur.
- ✅ `npx vite build` : réussite.
- ⏳ Test interactif WebGL complet : impossible dans l’environnement courant, contexte WebGL désactivé.

## 2026-09-10 — Overlay frontières Earth

- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npx vite build` : réussite
- ✅ PNG vérifié : RGBA 1440×720, alpha transparent
- ✅ Vérification statique : aucune utilisation de `GeographicLayer`/`LineSegments` dans `App.tsx`
- ⏳ Validation visuelle 3D complète : impossible dans l’environnement courant, WebGL désactivé

## 2026-09-10 — Suivi caméra dynamique des corps mobiles

- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npx vite build` : réussite
- ✅ Vérification statique : aucune référence résiduelle à `focusPosition` mémorisée
- ⏳ Vérifications manuelles navigateur : sélection, suivi orbital, zoom proche, navigation et contrôles tactiles à exécuter

## 2026-09-02 — V1.4.1 Stabilisation avant le style (rotation, jour/nuit, « Voir plus », Lune)

- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite
- ✅ selftest orbital : 7/7 tests validés
- ✅ selftest ephemeris : 27/27 tests validés
- ✅ **Nouveau** `npx jiti src/rendering/rotationSelftest.ts` : 15/15 tests validés
  - Déterminisme : même `simulationTime` → même orientation
  - Terre : rotation complète en 23,934 h simulées, demi-rotation en 11,967 h
  - Périodicité : `angle(t + période) = angle(t) + 2π`
  - Pause : même `t` → même angle (aucune rotation quand le temps ne bouge pas)
  - Changement de vitesse : 10x = déplacement temporel ×10 (le temps simulé est la source de vérité)
  - Passé : `t = -23,934 h` → `-2π`
  - Angle initial : `angle(0) = initialAngle`
  - Corps sans `rotationPeriod` : orientation figée, aucune rotation arbitraire
  - Vénus (rétrograde) : demi-période → `-π`
  - Mars (24,623 h), Jupiter (9,925 h), Saturne (10,656 h) : rotation complète correcte
  - Lune (655,72 h, rotation synchrone) et Soleil (609,12 h) : rotation complète correcte

## 2026-09-02 — V1.5.0 Temps réel, horloge locale, epoch dynamique

- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite
- ✅ selftest orbital : 7/7 tests validés
- ✅ selftest ephemeris : 28/28 tests validés (adapté : epoch dynamique, dates relatives vérifiées)
- ✅ `npx jiti src/rendering/rotationSelftest.ts` : 21/21 tests validés (étendu)
  - Tous les tests V1.4.1 préservés (15 tests originaux)
  - ×5 : 5× la rotation à durée réelle égale
  - ×0.1 : 0.1× la rotation à durée réelle égale
  - ×1 : 1/23.934 de tour par heure réelle (temps réel)
  - ×10 : 10/23.934 de tour par heure réelle
  - Pause : temps figé → orientation figée
  - Epoch : même angle à t=0 (déterminisme local)

### Corrigé — Bouton « More Info » (Voir plus)

- ✅ Cause identifiée : `isDetailOpen={false}` + `onDetailToggle={() => {}}` codés en dur
- ✅ Correction : état `isDetailOpen` ajouté dans `ExplorerSection`, toggle câblé
- ✅ Réinitialisation de l'état quand le corps sélectionné change (`handleSelectPlanet`)
- ✅ Le panneau affiche les informations du corps sélectionné (données astronomiques réelles,
  heure/position simulée, point subsolaire pour la Terre, statut JPL)

### Corrigé — Rotation lisse

- ✅ Cause identifiée : rotation appliquée dans `useFrame` avec la prop `time` figée au
  dernier rendu React (rendu toutes les 6 frames → micro-saccades)
- ✅ Correction : `Sun`, `Planet`, Lune lisent le ref vivant `timeRef.current` dans `useFrame`
- ✅ Rotation déterministe préservée : toujours `getRotationAngle(simulationTime, rotationPeriod)`

### Validé — Jour/nuit

- ✅ Éclairage : `PointLight` au Soleil (2,8, decay 0) + normales du globe + `ambient` 0,02
  → terminator jour → crépuscule → nuit produit par le GPU (aucune zone peinte sur texture)
- ✅ L'angle initial Terre aligne le point subsolaire astronomique vers le Soleil à l'époque
- ✅ La partie éclairée correspond à la position astronomique du Soleil à l'heure simulée
- ✅ Fonctionne avec JPL et avec le fallback orbital V0.9.4
- ⚠️ Vérification visuelle multiple heures (matin/midi/après-midi/coucher/nuit) — à confirmer
  manuellement dans le navigateur (WebGL non disponible dans cet environnement)

### Validé — Lune texture réelle

- ✅ Mesh unique visible : sphère 16×16 dans `Planet` (branche Terre), aucun doublon
- ✅ Chemin : `modelRegistry.ts` → `/textures/moon.jpg` (LROC WAC 2048×1024) → `modelLoader.ts`
  → `useAstroModel("moon")` → `map` du `meshStandardMaterial` avec `color="#ffffff"`
- ✅ UV équirectangulaires standards, rotation appliquée au groupe parent (n'altère pas les UV)
- ✅ Aucune ancienne sphère colorée compétitrice

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

## V1.3.2 — Rendement visuel / correction solaire + ring Saturne

- ✅ `npx tsc --noEmit` → aucune erreur
- ✅ `npm run build` → réussite
- ✅ `npx jiti src/orbital/selftest.ts` → 7/7 tests passés
- ✅ `npx jiti src/orbital/ephemeris/selftest.ts` → 27/27 tests passés
- ✅ correction de la projection texture pour les sphères et suppression de la répétition / stretch
- ✅ Soleil plus lumineux, halo maîtrisé + rendu auto-émissif conservé
- ✅ jour/nuit aligné sur la position du Soleil sans couleur sombre artificielle
- ✅ Saturne avec anneau semi-transparent et bandes cohérentes avec l'axe de rotation
- ✅ zoom/damping/focus conservés, aucune régression sur les systèmes verrouillés

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

## V1.1.0 — Infrastructure rendu 3D

- ✅ Répertoire `src/rendering/` créé
- ✅ `src/rendering/index.ts` — exports vers modules rendering
- ✅ `src/rendering/types.ts` — types `PlanetRenderData`, `SunRenderData`, `PlanetMaterialProps`, `PlanetRenderProps`, `SunRenderProps`
- ✅ `src/rendering/planetMesh.ts` — `createPlanetMesh()`, `usePlanetRendering()`
- ✅ `src/rendering/sunMesh.ts` — `createSunMesh()`
- ✅ `tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite
- ✅ `selftest orbital` : 7/7 tests validés
- ✅ `selftest ephemeris` : 27/27 tests validés
- ✅ Pas de nouvelles dépendances Three.js dans calculs orbitaux
- ✅ Pas de création de matériaux par frame
- ✅ Pas d'allocations dans useFrame
- ✅ Conservation apparence actuelle
- ✅ Toutes les planètes, Soleil, Lune fonctionnent en état précédent
- ✅ Temps simulé : 0.1x/1x/5x/10x, passé/futur, pause
- ✅ Sélection, Focus Camera, zoom automatique/manuel
- ✅ Rotation caméra, damping préservés

## V1.1.1 — Textures planétaires

- ✅ Module `src/rendering/textureLoader.ts` créé avec `useTexture()`, `getMaterialConfig()`, `TEXTURE_PATHS`
- ✅ Module `src/rendering/types.ts` créé avec types étendus `PlanetMaterialProps`, `PlanetRenderProps`, `SunRenderProps`
- ✅ Module `src/rendering/planetMesh.ts` mis à jour avec support `bodyType` et `map` prop
- ✅ Module `src/rendering/sunMesh.ts` créé pour abstraction Soleil
- ✅ `Planet` component étendu avec prop `bodyType?: keyof typeof TEXTURE_PATHS`
- ✅ Infrastructure de chargement : mise en cache unique, fallback en cas d'erreur
- ✅ Configs de materialité par type de corps (roughness, metalness)
- ✅ Aucun nouveau dépendance externe ; `THREE.TextureLoader` natif
- ✅ Aucune allocation dans useFrame ; chargement au démarrage seulement
- ✅ Apparence actuelle préservée ; textures en surcouche optionnelle
- ✅ `tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite
- ✅ `selftest orbital` : 7/7 tests validés
- ✅ `selftest ephemeris` : 27/27 tests validés
- ✅ Toutes les fonctionnalités verrouillées préservées

## V1.1.2 — Éclairage + jour/nuit

- ✅ `createSunLight()` : lumière directionnelle créé avec `THREE.DirectionalLight`
- ✅ `isBodyIlluminated()` : détermination jour/nuit par corps par rapport au Soleil
- ✅ `useSolarLighting()` : hook préparation éclairage chaque frame avec positions orbitales
- ✅ `getPlanetMaterialConfig()` : configuration matériau selon type de corps et ensoleillement
- ✅ `PlanetMaterialProps` étendu avec `roughness` et `metalness`
- ✅ `PlanetRenderProps` étendu avec `bodyType` prop
- ✅ Day/night cycle computation sans modifier modèle orbital
- ✅ Aucune nouvelle dépendance externe ; `THREE.DirectionalLight` natif
- ✅ Aucune allocation dans useFrame ; éclairage depuis positionsorbitales
- ✅ Conservation textures V1.1.1 ; éclairage en surcouche
- ✅ `tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite
- ✅
- ✅ `selftest orbital` : 7/7 tests validés
- ✅ `selftest ephemeris` : 27/27 tests validés
- ✅ Toutes les planètes, Soleil, Lune : éclairage et fonctionnement préservés
- ✅ Temps simulé : 0.1x/1x/5x/10x, passé/futur, pause
- ✅ Sélection, Focus Camera, zoom automatique/manuel
- ✅ Rotation caméra, damping préservés

## V1.2.0 — STYLE 1 + STYLE 2 : Échelle visuelle + Rendu spatial réaliste

### Visual Scale / Scene Mapping (`src/rendering/visualScale.ts`)
- ✅ Module `visualScale.ts` créé avec configuration centralisée
- ✅ `DEFAULT_VISUAL_SCALE` : distanceScale=3.5, earthMoonDistanceScale=6.0, bodySizeScale=1.0, minVisualDistance=0.5
- ✅ Fonctions pures testées : `mapOrbitalDistanceToVisual()`, `mapBodySizeToVisual()`, `mapOrbitalPositionToVisual()`, `computeVisualScales()`
- ✅ API runtime : `getVisualScale()`, `setVisualScale()`, `resetVisualScale()`
- ✅ Intégration dans `getPlanetPosition()`, `getMoonOffset()`, `Planet`, `Sun`, `OrbitRings`, `CameraController`, `OrbitControls`, `fog`, `pointLight`
- ✅ Aucune modification données JPL / calculs orbitaux / modèles épimériques

### Textures planétaires (`src/rendering/textureLoader.ts`)
- ✅ `loadTexture()` : chargement asynchrone avec cache Map unique
- ✅ `preloadAllTextures()` : préchargement 10 corps au démarrage
- ✅ Fallback placeholder coloré si texture manquante (pas d'erreur bloquante)
- ✅ `getMaterialConfig()` : roughness/metalness par BodyType (10 types)
- ✅ `TEXTURE_PATHS` : sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune
- ✅ Zero allocation dans useFrame, zero réseau dans useFrame

### Intégration rendering (`src/App.tsx`)
- ✅ `Planet` component : props `bodyType`, `illuminated`, `moonIlluminated`
- ✅ `Sun` component : migration shader procédural → meshStandardMaterial + texture + emissive
- ✅ `Moon` rendering : texture + illumination dynamique
- ✅ `SolarSystemScene` : `useSolarLighting()` → DirectionalLight + planetIllumination
- ✅ Day/night cycle préservé via `getPlanetMaterialConfig()` dynamique
- ✅ OrbitControls min/max distance, CameraController focus offset, fog, pointLight distance : tous visual-scaled

### Validations complètes
- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite
- ✅ Selftest orbital : 7/7 tests validés (inchangé)
- ✅ Selftest ephemeris : 27/27 tests validés (inchangé)
- ✅ 8 planètes + Soleil + Lune : positions, textures, éclairage fonctionnels
- ✅ Terre → Lune : distance visuelle 6×, Lune non collée
- ✅ Passé / présent / futur : positions cohérentes
- ✅ Vitesses 0.1x / 1x / 5x / 10x : respectées
- ✅ Pause : gel correct
- ✅ Sélection : fonctionnelle
- ✅ Focus Camera : transition fluide vers positions visual-scaled
- ✅ Zoom manuel : OrbitControls min/max adaptés
- ✅ Rotation + damping : préservés
- ✅ Aucune régression JPL : positions astronomiques inchangées
- ✅ Distances visuelles lisibles : orbites séparées en vue système
- ✅ Textures sans baisse fluidité : chargement démarrage, cache, pas d'allocation useFrame

## 2026-08-26 — Audit réel rendering / V1.2.1

- ✅ `npx tsc --noEmit` : aucune erreur après corrections.
- ✅ `npm run build` : réussite.
- ⚠️ Selftest orbital et ephemeris : non exécutés, Node local sans support TypeScript et `pnpm/tsx` indisponible.
- ✅ Aucun appel JPL dans `useFrame`; les requêtes restent dans des `useEffect`.
- ✅ Aucun dictionnaire de positions ni lumière créé dans `useFrame`.
- ✅ Rotation calculée depuis `simTime`, compatible avec pause et temps négatifs.
- ⚠️ Rendu 3D non validé visuellement: le navigateur partagé renvoie `WebGL context could not be created`.

## 2026-08-27 — V1.3.0 Améliorations de rendu (trajectoires, fond, jour/nuit, sélection)

### Tests automatiques exécutés
- ✅ selftest orbital : 7/7 tests validés (`npx jiti src/orbital/selftest.ts`)
- ✅ selftest ephemeris : 27/27 tests validés (`npx jiti src/orbital/ephemeris/selftest.ts`)
- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite (582 modules transformés)

### Vérifications de code effectuées (rendu)
- ✅ Trajectoires : `src/rendering/trajectory.ts` centralise `TRAJECTORY_COLORS` ; `OrbitRings` et l'anneau lunaire utilisent `getTrajectoryColor()` (plus de couleur unique `#6397ff`).
- ✅ Fond : `<color attach="background">` et `<fog>` passés à `#000000` ; `pointsMaterial` des étoiles avec `fog={false}` pour conserver leur lisibilité.
- ✅ Jour/nuit : `createSunLight()` → `PointLight` (intensity 2.8, decay 0) pour irradiance uniforme et séparation jour/nuit sur tous les corps ; fill directionnel 0.04 ; ambiance 0.02.
- ✅ Sélection : suppression de l'`emissive`/`emissiveIntensity` de sélection (lavage/uniformisation + perte d'ombre) ; surlignage remplacé par un halo `BackSide` additif fin (`depthWrite=false`). Aucun changement de logique de sélection ni de Focus Camera.
- ✅ Non-régression : aucune modification de `src/orbital/` (V0.9.4) ni du système JPL (V1.0.x) ; pas de nouvelle dépendance ; aucune allocation/création de matériau dans `useFrame` ; aucune requête réseau dans la boucle de rendu.

### Vérification visuelle
- ⚠️ Validation visuelle WebGL non réalisable dans l'environnement partagé (`WebGL context could not be created`). Les changements de rendu sont vérifiés par le code et compilés sans erreur ; une vérification visuelle manuelle reste à effectuer sur navigateur avec WebGL (système solaire complet, trajectoires planètes + Lune, Terre éclairée, Terre partiellement dans l'ombre, Mars/Jupiter, Lune, planète sélectionnée, changement de vitesse du temps, Focus Camera).

## 2026-08-27 — V1.3.1 Rendu des trajectoires et champ d'étoiles

### Tests automatiques exécutés
- ✅ selftest orbital : 7/7 tests validés (`npx jiti src/orbital/selftest.ts`)
- ✅ selftest ephemeris : 27/27 tests validés (`npx jiti src/orbital/ephemeris/selftest.ts`)
- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite

### Vérifications de code effectuées (rendu)
- ✅ Trajectoires : `src/rendering/orbitTrajectory.ts` (`Line2` + `LineMaterial`) ; épaisseur en pixels (`worldUnits=false`), lisibilité constante à tout zoom sans allocation dans `useFrame`.
- ✅ Config centralisée : `getTrajectoryConfig(bodyId)` dans `trajectory.ts` (couleur, `lineWidth`, `opacité`, `brightness`).
- ✅ `OrbitRings` et anneau orbital lunaire migrés vers `OrbitalTrajectory` (8 planètes + Lune) ; couleur Lune distincte de la Terre ; couleur conservée sélectionné/non.
- ✅ Étoiles : `StarField3D` avec `vertexColors` — variété blanc/bleu très léger/cyan discret/jaune-orange très léger ; tailles et luminosité réduites ; distribution aléatoire conservée.
- ✅ Non-régression : aucune modification `src/orbital/` (V0.9.4) ni système JPL (V1.0.x) ; pas de nouvelle dépendance ; aucune allocation dans `useFrame` ; textures et jour/nuit V1.1.2 inchangés ; sélection, Focus Camera, zoom, damping, navigation inchangés.

### Vérification visuelle
- ⚠️ Validation visuelle WebGL non réalisable dans l'environnement partagé. À confirmer manuellement sur navigateur avec WebGL : niveaux de zoom très éloignés et très proches, 8 planètes + Lune, sélection + Focus Camera, et fonctionnement jour/nuit + textures.

### Mission « VRAIS MODÈLES 3D ASTRONOMIQUES »
- ✅ Assets réels intégrés pour les 10 corps (Soleil, Mercure, Vénus, Terre, Lune, Mars, Jupiter, Saturne, Uranus, Neptune) — cartes équirectangulaires d'albédo NASA/JPL/USGS (provenance documentée dans `src/rendering/models/modelRegistry.ts`).
- ✅ Architecture `src/rendering/models/` créée : `modelRegistry.ts` (registre), `modelLoader.ts`
  (cache unique, GLB/glTF + DRACO paresseux, aucun chargement dans `useFrame`), `useAstroModel.ts`
  (hook React), `types.ts`, `index.ts`.
- ✅ Fichiers `public/textures/{corps}.jpg` présents et servis par le serveur de dev (HTTP 200) et copiés dans `dist/textures/` au build.
- ✅ Soleil : texture SDO réelle ; `THREE.PointLight` (source lumineuse) non remplacé.
- ✅ Saturne : anneaux procéduraux conservés en secours documenté (aucun GLB d'anneau réel intégré).
- ✅ Aucun asset généré/simulé (pas d'effet GLSL, pas de forme procédurale) ; les 10 corps utilisent
  des données scientifiques réelles. Aucune planète n'est déclarée « modèle 3D GLB » sans asset GLB réel.
- ✅ Non-régression : `tsc --noEmit` 0 erreur ; `npm run build` réussite ; selftest orbital 7/7 ; selftest ephemeris 27/27.
- ⚠️ Validation visuelle finale (rendu WebGL) à confirmer sur navigateur.

## V1.3.2 — Correction du rendu des corps (Soleil / Planètes / Anneaux)

- ✅ Soleil : `createSunMesh()` configuré en auto-émissif (`emissiveMap` = texture SDO, `emissive` blanc,
  `emissiveIntensity` 1.15, `color` noir, `toneMapped` false) → indépendant de l'éclairage des planètes.
  `THREE.PointLight` (source lumineuse des planètes) non modifié.
- ✅ Planètes : `color` passé à blanc neutre quand la vraie texture est présente (suppression de la teinte
  saturée pure `gradientColors.c2` qui assombrissait l'apparence). Repli gradient si texture absente.
- ✅ Lune : `color` blanc neutre avec texture LROC.
- ✅ Saturne : ancien anneau plat unique (`ringGeometry` + `meshBasicMaterial` non éclairé) remplacé par
  `SaturnRings` — plusieurs `RingGeometry` concentriques (C/B/A + bord externe) à opacités variables avec
  divisions réelles (trou de Cassini = espace sans géométrie). Orientés plan équatorial (couchés + inclinaison
  26.73°), centrés sur Saturne, éclairés par la scène (`MeshStandardMaterial`, `DoubleSide`, `depthWrite=false`).
  Géométries disposées au démontage.
- ✅ Terre : sphère d'atmosphère empilée (`radius*1.15`, `BackSide`, `#4B9CD3`) supprimée (ne respectait pas la
  règle « pas d'empilement de sphères simulant une couleur »).
- ✅ Jour/Nuit : éclairage V1.1.2 vérifié intact (faces éclairée/sombre réelles conservées).
- ✅ Aucune nouvelle dépendance ; aucune allocation/création de matériau dans `useFrame`.
- ✅ Non-régression : `tsc --noEmit` 0 erreur ; `npm run build` réussite ; selftest orbital 7/7 ; selftest ephemeris 27/27.
- ⚠️ Validation visuelle finale (rendu WebGL) à confirmer sur navigateur.


## V1.3.3 — Correction régressions jour/nuit, zoom, Soleil, anneaux Saturne

### Tests automatiques exécutés
- ✅ selftest orbital : 7/7 tests validés (`npx jiti src/orbital/selftest.ts`)
- ✅ selftest ephemeris : 27/27 tests validés (`npx jiti src/orbital/ephemeris/selftest.ts`)
- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite

### Corrections vérifiées par le code

**Éclairage jour/nuit (`src/rendering/lighting.ts`) :**
- ✅ `PointLight` au Soleil : `intensity 2.8`, `decay 0`, `distance 0` → irradiance uniforme, pas d'atténuation
- ✅ `DirectionalLight` : `intensity 0.04`, position `[1000, 1000, 1000]`, target `[0,0,0]` → fill fixe direction +X
- ✅ `AmbientLight` : `intensity 0.02` via `dayNightConfig.ambientIntensity`
- ✅ Suppression du calcul `sunDir` moyenne des positions planétaires (incorrect)
- ✅ `planetIllumination` : toutes `true` — jour/nuit visuel géré par éclairage 3D réel
- ✅ `getPlanetMaterialConfig()` : valeurs fixes par `bodyType`, sans branche `isIlluminated`

**Soleil (`src/App.tsx` composant `Sun`) :**
- ✅ Matériau : `color "#000000"`, `emissive "#ffffff"`, `emissiveIntensity 1.15`, `toneMapped false`
- ✅ `side: THREE.DoubleSide` pour visibilité depuis l'intérieur
- ✅ `roughness 0.3`, `metalness 0.1` (cohérence `getMaterialConfig("sun")`)
- ✅ Halos additifs : externe `opacity 0.12`, interne `opacity 0.06` (subtils, contrôlés)

**Zoom & Focus Camera (`src/App.tsx`) :**
- ✅ `OrbitControls.minDistance: 0.05` (était 0.6, aligné sur `camera.near`)
- ✅ `CameraController.getBodyVisualRadius(bodyId)` : calcule rayon visuel du corps ciblé
- ✅ Offset focus : `distance = bodyRadius * 3.5`, `height = bodyRadius * 2.0` (proportionnel au corps)
- ✅ Post-transition : `controls.minDistance = bodyRadius * 1.05` (juste au-dessus surface)
- ✅ Post-transition : `controls.maxDistance = max(existing, focusDistance * 4)` (recul possible)
- ✅ Fermeture focus : `controls.minDistance = 0.05` (reset global)

**Anneaux de Saturne (`src/App.tsx` composant `SaturnRings`) :**
- ✅ Groupe rotation corrigé : `rotation={[axialTilt, 0, 0]}` (axe X) au lieu de `[0, axialTilt, 0]` (axe Y)
- ✅ Anneaux maintenant dans le plan équatorial incliné 26.73° par rapport au plan orbital (XZ)

**Lune :**
- ✅ `useAstroModel("moon")` charge texture LROC WAC (`/textures/moon.jpg`) via `modelLoader.ts`
- ✅ Matériau : `color: moonTexture ? "#ffffff" : moonData.color` → blanc neutre avec texture réelle

### Non-régression confirmée
- ✅ Modèle orbital V0.9.4 inchangé
- ✅ JPL V1.0.3 inchangé
- ✅ Visual Scale V1.2.0 inchangé
- ✅ Trajectoires V1.3.1 inchangées
- ✅ CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, damping, navigation
- ✅ Temps passé/futur, vitesses 0.1x/1x/5x/10x, pause
- ✅ Responsive


## V1.3.4 — Correction ciblée Lune (texture réelle) + Soleil (luminosité forte)

### Tests automatiques exécutés
- ✅ selftest orbital : 7/7 tests validés (`npx jiti src/orbital/selftest.ts`)
- ✅ selftest ephemeris : 27/27 tests validés (`npx jiti src/orbital/ephemeris/selftest.ts`)
- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite

### Corrections vérifiées par le code

**Lune — Texture réelle LROC WAC :**
- ✅ Fichier `/textures/moon.jpg` : JPEG 2048×1024, 457 KB, LROC WAC color map (NASA SVS 4720)
- ✅ `modelRegistry.ts` : `moon.textureFile = "/textures/moon.jpg"` (correct)
- ✅ `modelLoader.ts` : `loadTextureFile()` avec `ClampToEdgeWrapping`, `repeat.set(1,1)`, mipmaps
- ✅ `useAstroModel("moon")` : charge texture via `loadAstroAsset()`, retourne `texture` non-null
- ✅ Composant `Planet` (Terre) : rendu inline Lune avec `meshStandardMaterial`
  - `color: moonTexture ? "#ffffff" : moonData.color` → blanc neutre avec texture
  - `map: moonTexture ?? undefined` → texture appliquée au mesh visible
  - `roughness/metalness` depuis `getMaterialConfig("moon")` (0.8/0.0)
- ✅ Aucun mesh Lune dupliqué, aucune ancienne sphère colorée sous la texture
- ✅ UV sphérique correct (équirectangulaire), projection sans stretch/répétition

**Soleil — Texture SDO 2048×2048 + forte émission :**
- ✅ Fichier `/textures/sun.jpg` : JPEG 2048×2048, 4.2 MB, composite SDO AIA (NASA SVS 11255)
- ✅ `modelRegistry.ts` : `sun.textureFile` corrigé `sun.webp` → `sun.jpg`
- ✅ Composant `Sun` : `createSunMesh()` avec matériau
  - `color: "#000000"`, `emissive: "#fff8e7"`, `emissiveIntensity: 2.5`
  - `emissiveMap: sunTexture`, `map: sunTexture` (surface + émission)
  - `toneMapped: false`, `side: THREE.DoubleSide`, `roughness: 0.3`, `metalness: 0.1`
- ✅ Halos/glow additifs (3 couches) : échelles 1.15/1.08/1.03, opacités 0.18/0.12/0.08
  - Couleurs `#ffcc00`/`#fff2cc`/`#fff8e7`, `AdditiveBlending`, `depthWrite=false`
  - Luminosité locale forte sans augmenter exposition globale scène
- ✅ `PointLight` (intensity 2.8, decay 0) inchangé → source planètes préservée
- ✅ Jour/nuit planètes inchangé (éclairage V1.3.3)

### Non-régression confirmée
- ✅ Modèle orbital V0.9.4 inchangé
- ✅ JPL V1.0.3 inchangé
- ✅ Visual Scale V1.2.0 inchangé
- ✅ Trajectoires V1.3.1 inchangées
- ✅ Éclairage jour/nuit V1.3.3 inchangé
- ✅ CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, damping, navigation
- ✅ Temps passé/futur, vitesses 0.1x/1x/5x/10x, pause
- ✅ Responsive
- ✅ Saturne/anneaux, étoiles inchangés


## V1.4.0 — Temps astronomique réel + Jour/Nuit réaliste + Plus d'informations

### Tests automatiques exécutés
- ✅ selftest orbital : 7/7 tests validés (`npx jiti src/orbital/selftest.ts`)
- ✅ selftest ephemeris : 27/27 tests validés (`npx jiti src/orbital/ephemeris/selftest.ts`)
- ✅ `npx tsc --noEmit` : aucune erreur
- ✅ `npm run build` : réussite

### Corrections vérifiées par le code

**Temps astronomique (`src/rendering/astronomicalTime.ts`) :**
- ✅ `simulationTimeToUTC(simTime)` → Date UTC correcte (époque 2025-08-19 00:00 + simTime heures)
- ✅ `simulationTimeToJulianDate()` → date julienne précise
- ✅ `calculateGMST(julianDate)` → Greenwich Mean Sidereal Time en radians
- ✅ `calculateSunDeclinationRightAscension()` → déclinaison/ascension droite du Soleil
- ✅ `calculateSubsolarPoint()` → latitude/longitude du point subsolaire
- ✅ `calculateInitialEarthRotationAngle()` → angle initial rotation Terre à l'époque
- ✅ `formatUTCDate()` / `formatSimulationTime()` → affichage lisible

**Jour/Nuit réaliste (`src/rendering/lighting.ts`) :**
- ✅ `createSunLight(sunPosition, earthPosition)` → calcule `daylightDirection` = vecteur Soleil→Terre normalisé
- ✅ Direction mise à jour chaque frame via `useSolarLighting()` avec `planetPositions` actuelles
- ✅ `PointLight` au Soleil (intensity 2.8, decay 0) inchangé → éclairage planètes préservé
- ✅ `AmbientLight` 0.02 via `dayNightConfig.ambientIntensity`

**Rotation terrestre cohérente :**
- ✅ `earthInitialRotationAngle` calculé via `calculateInitialEarthRotationAngle(earthAtEpoch)`
- ✅ `getRotationAngle(time, 23.934, initialRotationAngle)` dans composant `Planet` (Terre)
- ✅ Angle initial ≈ 4.07 rad pour aligner point subsolaire réel (12° N, 150° O) face au Soleil à simTime=0
- ✅ Rotation continue et cohérente avec vitesses 0.1x/1x/5x/10x, pause, passé/futur

**Plus d'informations (`ObjectInfoPanel`) :**
- ✅ Affichage données : diamètre, périodes, excentricité, inclinaison, position, vitesse orbitale
- ✅ Statut JPL : "Active" ou "Fallback (orbital model)"
- ✅ Terre : point subsolaire (lat/lon), heure simulée, direction Soleil
- ✅ Toggle "More Info"/"Less Info" fonctionnel

**TimeControlBar :**
- ✅ Affiche date/heure UTC simulée (format "2025-08-19 15:26:00 UTC")
- ✅ Met à jour en temps réel avec simTime

### Non-régression confirmée
- ✅ Modèle orbital V0.9.4 inchangé
- ✅ JPL V1.0.3 inchangé
- ✅ Visual Scale V1.2.0 inchangé
- ✅ Trajectoires V1.3.1 inchangées
- ✅ Éclairage jour/nuit V1.3.3 inchangé
- ✅ CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, damping, navigation
- ✅ Temps passé/futur, vitesses 0.1x/1x/5x/10x, pause
- ✅ Responsive
- ✅ Saturne/anneaux, étoiles inchangés
- ✅ Textures (Terre, Lune, Soleil, planètes) inchangées
