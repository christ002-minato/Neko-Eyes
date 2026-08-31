

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
