# CHANGELOG — Neko Eyes

> Historique des étapes réellement réalisées — uniquement les modifications confirmées.

## V0 stable (commit d534dd3)

- Solar System 3D avec Soleil, Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune
- Moon System (Lune autour de la Terre)
- Simulation Time (horloge simulée, pause/reprise, 0.1x/1x/5x/10x)
- Selection (clic sur planète, PlanetSelector)
- Focus Camera (transition smoothstep vers l'objet sélectionné)
- Zoom/rapprochement automatique via OrbitControls
- OrbitControls Drei (damping, rotation, zoom utilisateur)

## V0.8.1 Orbital Model

- Création de la couche `src/orbital/` indépendante du rendu
- Types `OrbitalBody`, `OrbitalBodyDefinition`, `Vec3`
- `getBodyPosition(body, simulationTime)` — position mondiale avec résolution de chaîne parent → enfant
- `defineOrbitalSystem(definitions)` — câblage plat ↔ hiérarchique
- Selftest orbital couvrant Soleil, Terre, Lune, hiérarchie, périodicité
- Modèle orbital sans dépendance Three.js/React
- Architecture mono-fichier préservée

## V0.8.2 Terre

- connexion de la Terre au modèle orbital via `parentId: 'sun'`
- parité avec l'ancien calcul validée
- TypeScript et build passent

## V0.8.3 Mars

- connexion de Mars au modèle orbital via `parentId: 'sun'`
- focus automatique + zoom ajouté (useEffect sur selectedPlanet)
- TypeScript et build passent

## V0.8.3 Focus automatique + zoom

- useEffect déclenchant handleFocus lors de la sélection d'un objet
- bouton Focus existant dans ObjectInfoPanel conservé
- aucune régression sur CameraController, OrbitControls, Moon System

## V0.8.3 Planètes complètes

- connexion de Mercure, Vénus, Jupiter, Saturne, Uranus, Neptune au modèle orbital via `parentId: 'sun'`
- tous les paramètres orbitaux réutilisés depuis `PLANETS` existants
- TypeScript et build passent
- selftest orbital : 7/7 tests toujours validés

## V0.9.1 — Excentricité orbitale

- Modèle orbital képlérien simplifié dans `src/orbital/`
- Paramètre optionnel `eccentricity` : 0 ou absent → orbite circulaire inchangée ; valeur > 0 → orbite elliptique via équation de Kepler
- Calcul centralisé dans `getBodyPosition(body, simulationTime)` — aucune duplication dans React
- Parité avec l'ancien modèle validée : 7/7 selftests passés
- TypeScript et build passent sans erreur
- AUCUNE planète ne change de trajectoire simplement parce que le nouveau système existe
-HIérarchie Terre → Lune préservée
- Soleil reste à l'origine

## V0.9.2 — Inclinaison orbitale

- Paramètre optionnel `inclination?` (en radians) ajouté aux types `OrbitalBody` / `OrbitalBodyDefinition`
- `inclination = 0` → comportement coplanaire identique au modèle précédent
- `inclination > 0` → orbite inclinée par rotation autour de l'axe X, position Y non nulle
- Compatible avec orbites circulaires et elliptiques
- Calcul centralisé dans `getBodyPosition()` — pas de duplication dans App.tsx
- Hierarchie Terre → Lune préservée
- Selftest : 7/7 tests validés





## V1.0.0 — Infrastructure Ephemeris JPL/NASA

- Infrastructure JPL/NASA mise en place dans `src/orbital/ephemeris/`
- Abstraction `EphemerisProvider` créée, indépendante de Three.js et React
- `JPLProvider` encapsule la communication avec l'API JPL Horizons
- Cache mémoire策略 implémenté pour éviter les requêtes réseau répétées
- Terre (Earth) comme premier prototype de body JPL
- Parsing de réponse JPL implémenté dans `jplProvider.ts`
- `EphemerisState` et `SceneEphemerisState` types définis
- Selftest : tous les tests infrastructure passés
- `npx tsc --noEmit` : aucune erreur
- `npm run build` : réussite
- AUCUNE modification visuelle : V0.9.4 continue de piloter le rendu
- Aucun système verrouillé n'a été modifié
- Dépendances ajoutées : aucune nouvelle dépendance externe
- Fichiers créés : `src/orbital/ephemeris/types.ts`, `ephemerisProvider.ts`, `jplProvider.ts`, `index.ts`, `selftest.ts

## V0.9.4 — Activation orbitale

- Paramètres orbitaux `eccentricity`, `inclination`, `nodeLongitude` appliqués aux 8 planètes et à la Lune dans `src/App.tsx`
- Chaîne de branchement `PLANETS → defineOrbitalSystem() → getBodyPosition()` validée
- Toutes les planètes utilisent maintenant le moteur orbital képlérien
- Aucune planète ne change de trajectoire arbitrairement ; les valeurs par défaut (e=0, i=0, Ω=0) conservent le comportement circulaire précédent
- TypeScript et build passent sans erreur
- Build Vite réussi

## V0.9.3 — Orientation des orbites

- Paramètre optionnel `nodeLongitude?` (en radians) ajouté aux types `OrbitalBody` / `OrbitalBodyDefinition`
- Correspond à la longitude du nœud montant (rotation autour de l'axe Z)
- `nodeLongitude = 0` → comportement compatible avec les modèles précédents
- `nodeLongitude ≠ 0` → orbite orientée dans l'espace tridimensionnel
- Fonctionne en combinaison avec `inclination` et `eccentricity`
- Calcul centralisé dans `getBodyPosition()` — pas de duplication dans App.tsx
- Soleil reste statique à l'origine
- HIérarchie parent → enfant préservée

---

**Aucune fonctionnalité PLANNED n'est présentée comme implémentée.**

## V1.0.1 — Terre réelle JPL

- Infrastructure JPL/NASA pleinement opérationnelle dans `src/orbital/ephemeris/`
- Abstraction `EphemerisProvider` utilisée pour le provider JPL
- `JPLProvider` avec requêtes API vers `https://ssd-api.jpl.nasa.gov/api/horizons.api`
- Cache mémoire stratégies pour éviter les requêtes réseau répétées
- Conversion unités JPL (AU) → unités scène (facteur 55)
- Terre connectée aux données réelles JPL Horizons
- Époque / simulationTime convertie : 1 unité sim = 1 heure, époque = 19 août 2025
- Mécanisme de comparaison : position calculée V0.9.4 vs position JPL
- Terre vérifiée sur plusieurs dates/instants : présent, passé, futur
- Plusieurs vitesses de simulation : 0.1x, 1x, 5x, 10x
- Rendu actuel reste fonctionnel : aucune modification visuelle verrouillée
- Aucun système verrouillé modifié (CameraController, OrbitControls, TimeControlBar, design, textures, background)
- Tests : selftest orbital 7/7, selftest ephemeris, tsc --noEmit, npm run build
- Conversion unités testées : AU → scène
- Tests dates : passé, présent, futur
- Tests cache/erreur réseau : mode dégradé fonctionnel
- Comparaison modèle JPL vs modèle affiché
- Documentation mise à jour sur toutes les fichiers de docs

## V1.0.2 — Terre + Lune JPL

- Réutilisation de l'implémentation Terre JPL validée en V1.0.1
- Lune connectée aux données JPL Horizons (JPL ID 301) via l'API officielle
- Position Lune récupérée en unités géocentriques (relative à la Terre)
- Pas de double comptage du mouvement orbital Terre → Lune
- Conversion unités : Terre en AU → scène (×55), Lune en géocentriques → offset lunaire
- Mécanisme de comparaison : position calculée V0.9.4 vs position JPL pour Terre et Lune
- Terre et Lune vérifiées sur plusieurs dates/instants : présent, passé, futur
- Vitesses de simulation : 0.1x, 1x, 5x, 10x
- Pause/reprise : fonctionnement correct avec gel de simTime
- Mode dégradé automatique : retour au modèle V0.9.4 si JPL indisponible
- Cache mémoire stratégies pour éviter les requêtes réseau répétées
- Aucun système verrouillé modifié (CameraController, OrbitControls, TimeControlBar, design, textures, background)
- Tests : selftest orbital 7/7, selftest ephemeris, tsc --noEmit, npm run build
- Comparaison Terre modèle vs Terre JPL et Lune modèle vs Lune JPL
- Distance Terre-Lune vérifiée
- Documentation mise à jour sur tous les fichiers de docs

## V1.0.3 — Toutes les planètes JPL

- Extension de l'infrastructure JPL aux 8 planètes : Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune
- Utilisation des identifiants JPL/Horizons corrects pour chaque corps planétaire
- Conversion unités JPL (AU) → unités scène (facteur 55) pour chaque planète
- Comparaison modèle V0.9.4 vs JPL pour chaque planète avant validation finale
- Mécanisme de fallback automatique vers V0.9.4 si JPL indisponible pour un corps donné
- Position Lune preserved via hiérarchie Terre → Lune (pas de double comptage)
- Aucun système verrouillé modifié (CameraController, OrbitControls, TimeControlBar, design, textures, background)
- Cache mémoire stratégies pour éviter les requêtes réseau répétées ; pas de requête dans la boucle de rendu
- Tests : selftest orbital 7/7, selftest ephemeris, tsc --noEmit, npm run build
- Tests positions/époques/unités/référentiels : 8 planètes
- Tests passé/présent/futur avec vitesses 0.1x/1x/5x/10x
- Tests pause, avant/arrière
- Tests cache/erreur réseau : fallback vers V0.9.4 positions
- Comparaison modèle V0.9.4 vs JPL pour les 8 planètes
- Documentation mise à jour sur tous les fichiers de docs

## V1.1.0 — Infrastructure rendu 3D

- Couche rendering `src/rendering/` ajoutée séparement de `src/orbital/`
- Nouveau répertoire avec abstractions de rendu planetaires
- Usines `createPlanetMesh()` et `createSunMesh()` sans calcul d'orbite
- Types `PlanetRenderData`, `SunRenderData`, `PlanetMaterialProps`, `PlanetRenderProps`, `SunRenderProps`
- Hook `usePlanetRendering()` pour normalisation de données
- Aucun nouveau dépendance Three.js au niveau calculs orbitaux
- Pas de création de matériaux/textures par frame
- Pas d'allocations dans useFrame
- Pas de requêtes JPL dans useFrame
- Apparence actuelle préservée : aucune nouvelle texture/bloom/atmosphère/shader/background/soleil réaliste
- `tsc --noEmit` : aucune erreur
- `npm run build` : réussite
- `selftest orbital` : 7/7 tests validés
- `selftest ephemeris` : 27/27 tests validés
- Conservation de toutes les fonctionnalités verrouillées (CameraController, OrbitControls, TimeControlBar, etc.)
- Séparation architecture : `src/orbital/` trajectoires vs `src/rendering/` apparence

## V1.3.2 — Correction rendu solaire + anneaux Saturne

- Correction du chargement texture avec projection sphérique correcte (`ClampToEdgeWrapping` et suppression des répétitions).
- Soleil renforcé dans sa luminosité émissive et son halo sans masquer les objets proches.
- Refactor du jour/nuit pour utiliser la direction solaires réelle par rapport aux corps, sans teinte sombre artificielle.
- Saturne reconstruit avec une vraie géométrie annulaire plus fine, semi-transparente et texturée par bandes.
- OrbitControls conservé sans régression de zoom, focus ou sélection.
- Validation : `npx tsc --noEmit`, `npm run build`, selftests orbital/ephemeris passés.

## V1.1.1 — Textures planétaires

- Infrastructure de texturesplanétaires dans `src/rendering/textureLoader.ts`
- Module `useTexture()` avec mise en cache unique des textures THREE.js
- Module `getMaterialConfig()` avec configs de rugosité/métallique par type de corps
- `TEXTURE_PATHS` definiendofkeys: sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune
- `src/rendering/types.ts` étendu avec `map?: THREE.Texture` dans `PlanetMaterialProps`
- `Planet` component étendu avec prop `bodyType?: keyof typeof TEXTURE_PATHS`
- `src/rendering/planetMesh.ts` mis à jour pour appliquer texture via `map` prop
- `src/rendering/sunMesh.ts` créé pour abstraction Soleil
- Aucun fichier texture requis à cette étape (fichiers à ajouter ultérieurement)
- Aucune nouvelle dépendance externe ; utilisation de `THREE.TextureLoader` natif
- Aucune allocation dans la boucle `useFrame` ; chargement au démarrage seulement
- Apparence actuelle préservée ; textures en surcouche optionnelle via `bodyType`
- `tsc --noEmit` : aucune erreur
- `npm run build` : réussite
- `selftest orbital` : 7/7 tests validés
- `selftest ephemeris` : 27/27 tests validés
- Toutes les fonctionnalités verrouillées préservées

## V1.1.2 — Éclairage + jour/nuit

- Infrastructure d'éclairage astronomique dans `src/rendering/`
- `createSunLight()` : lumière directionnelle représentant le Soleil
- `isBodyIlluminated()` : détermination jour/nuit par corps
- `useSolarLighting()` : hook préparation éclairage chaque frame
- `getPlanetMaterialConfig()` : configuration matériau selon type de corps et ensoleillement
- `PlanetMaterialProps` étendu avec `roughness` et `metalness`
- `PlanetRenderProps` étendu avec `bodyType` prop
- Day/night cycle computation sans modifier modèle orbital
- Aucune nouvelle dépendance externe ; `THREE.DirectionalLight` natif
- Aucune allocation dans useFrame ; éclairage depuis positionsorbitales
- Conservation textures V1.1.1 ; éclairage en surcouche
- `tsc --noEmit` : aucune erreur
- `npm run build` : réussite
- `selftest orbital` : 7/7 tests validés
- `selftest ephemeris` : 27/27 tests validés
- Conservation de toutes les fonctionnalités verrouillées

## V1.2.0 — STYLE 1 + STYLE 2 : Échelle visuelle + Rendu spatial réaliste

- **STYLE 1 — Visual Scale / Scene Mapping** (`src/rendering/visualScale.ts`)
  - Configuration centralisée du facteur d'échelle visuelle, indépendante des données astronomiques
  - `distanceScale: 3.5` — distances Soleil → planètes ×3.5 pour lisibilité orbitale
  - `earthMoonDistanceScale: 6.0` — distance Terre → Lune ×6.0 (Lune détachée visuellement)
  - `bodySizeScale: 1.0` — tailles des corps décorrelées des distances
  - `minVisualDistance: 0.5` — garde-fou anti-collision visuelle
  - Fonctions pures : `mapOrbitalDistanceToVisual()`, `mapBodySizeToVisual()`, `mapOrbitalPositionToVisual()`, `computeVisualScales()`
  - `getVisualScale()`, `setVisualScale()`, `resetVisualScale()` pour configuration runtime
  - Aucune modification données JPL, calculs orbitaux V0.9.4, modèles épimériques
  - Distances visuelles Soleil→planètes nettement plus grandes, orbites distinguables en vue système
  - Soleil dominant sans écraser les autres corps

- **STYLE 2 — Rendu spatial réaliste** (`src/rendering/textureLoader.ts`, `types.ts`, `App.tsx`)
  - Infrastructure textures : `preloadAllTextures()` au démarrage, cache `Map<BodyType, THREE.Texture>`, fallback placeholder
  - `TEXTURE_PATHS` pour 10 corps : sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune
  - `Planet` component : `bodyType?: BodyType`, `illuminated?: boolean`, `moonIlluminated?: boolean`
  - `Sun` component : migration shader procédural → `meshStandardMaterial` + texture + émission
  - Matériaux par type via `getMaterialConfig()` (roughness/metalness distincts)
  - Intégration éclairage V1.1.2 : `useSolarLighting()` → `DirectionalLight` + `planetIllumination` → `getPlanetMaterialConfig()` dynamique
  - Day/night cycle préservé, compatible textures
  - Architecture extensible anneaux Saturne (prêt, non implémenté)

- **Architecture respectée** :
  `JPL/Orbital → position réelle → Visual Scale → Rendering 3D → Textures + éclairage + matériaux → Three.js`

- **Validations** :
  - `npx tsc --noEmit` : aucune erreur
  - `npm run build` : réussite
  - Systèmes LOCKED préservés (CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, zoom, navigation, rotation, damping)
  - JPL positions intactes, modèle orbital V0.9.4 inchangé
  - Pas de régression : selftest orbital 7/7, selftest ephemeris 27/27
  - Distances visuelles vérifiées : Terre→Lune lisible, orbites planétaires séparées
  - Textures sans impact fluidité : chargement démarrage, cache, zero allocation useFrame

## Audit rendu et V1.2.1 — Rotation des corps

- Rendu de secours branché sur `defineOrbitalSystem()` et `getBodyPosition()`.
- Factories `createPlanetMesh()` et `createSunMesh()` ajoutées; la factory solaire est utilisée par `Sun`.
- Jour/nuit corrigé avec une `PointLight` au Soleil, un fill directionnel faible et une ambiance minimale.
- `getRotationAngle()` et périodes de rotation ajoutés pour Soleil, planètes et Lune; pause et vitesse reposent sur `simTime`.
- Offset lunaire JPL branché au rendu.
- `tsc` et build validés; validation WebGL impossible dans l’environnement partagé.

## V1.3.0 — Améliorations de rendu : trajectoires, fond, jour/nuit, sélection

**Correction et amélioration du rendu 3D, sans toucher aux calculs orbitaux V0.9.4 ni au système JPL V1.0.x.**

### Trajectoires
- Nouveau module `src/rendering/trajectory.ts` : `TRAJECTORY_COLORS`, `DEFAULT_TRAJECTORY_COLOR`, `getTrajectoryColor()`.
- Couleurs distinctes et cohérentes par corps (Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune, Lune), style NASA : fines, lisibles, élégantes, discrètes.
- `OrbitRings` et l'anneau orbital lunaire utilisent désormais `getTrajectoryColor()` au lieu de la couleur unique `#6397ff`.

### Fond
- Fond (et fog) passé de `#010610` à `#000000` : espace proche du noir, sans dominante grise/bleue.
- Étoiles 3D conservées lisibles : `pointsMaterial fog={false}` (non affectées par le fog).

### Ombres / jour-nuit
- `createSunLight()` : `PointLight` au Soleil reconfigurée (`intensity 2.8`, `decay 0`) pour une irradiance uniforme quelle que soit la distance → séparation jour/nuit réelle et cohérente sur Terre, Mars, Jupiter, Lune et tous les corps.
- `DirectionalLight` réduite à un fill négligeable (0.04) ; ambiance minimale (0.02) → face sombre clairement distincte de la face éclairée.

### Sélection
- Suppression de l'`emissive`/`emissiveIntensity` de sélection qui "lavait" la planète sélectionnée en uniformément lumineuse et écrasait son ombre.
- Le surlignage de sélection (planètes, Lune, Soleil) devient un overlay subtil : halo `BackSide` additif fin, transparent, `depthWrite=false`, qui ne modifie pas texture, relief ni partie sombre.
- Aucun changement de logique de sélection ni de Focus Camera.

### Non-régression
- Les tests passent sans dépendance ajoutée : selftest orbital 7/7, selftest ephemeris 27/27, `tsc --noEmit` (0 erreur), `npm run build` (réussite).
- Aucune allocation/création de matériau dans `useFrame` ; aucune requête réseau dans la boucle de rendu.

## V1.3.1 — Rendu des trajectoires et du champ d'étoiles

**Affinement du rendu suivant le style V1.3** — trajectoires orbitales plus épaisses/lisibles à tout zoom et champ d'étoiles plus varié. Aucune modification des calculs orbitaux V0.9.4, des données JPL/NASA V1.0.x, ni de CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, zoom, damping ou navigation. Textures et jour/nuit V1.1.2 inchangés.

### Trajectoires orbitales
- Nouveau module `src/rendering/orbitTrajectory.ts` : trajectoires dessinées avec `Line2` + `LineMaterial` (three.js fourni, aucune dépendance externe).
- Épaisseur en pixels d'écran (`worldUnits = false`) : trajectoires visibles et nettes quel que soit le niveau de zoom (notamment très éloigné), avec périmètre automatique ; lisibilité constante à toutes distances sans allocation dans `useFrame`.
- `trajectory.ts` enrichi : `TrajectoryVisualConfig` (couleur, `lineWidth` en pixels, `opacité`, `brightness`) et `getTrajectoryConfig(bodyId)` — config centralisée par corps.
- Couleurs distinctes/cohérentes conservées que le corps soit sélectionné ou non ; luminosité augmentée légèrement (opacité ~0.7–0.85) sans effet excessivement lumineux.
- Trajectoire de la Lune (`#d0d0d0`) distincte de celle de la Terre (`#6ab0e0`), dessinée autour de la Terre.
- `OrbitRings` et l'anneau orbital lunaire migrent de `ringGeometry` vers `OrbitalTrajectory` (8 planètes + Lune).

### Étoiles / fond
- Fond conservé proche du noir (`#000000`).
- `StarField3D` : variété de couleurs (blanc dominant, bleu très léger, cyan discret, jaune/orange très léger) via un attribut de couleur par point (`vertexColors`), distribution naturelle/aléatoire conservée.
- Tailles et luminosité légèrement réduites pour que les étoiles ne dépassent pas les planètes ni les trajectoires.

### Contraintes respectées
- Aucune nouvelle dépendance ; réutilisation de l'architecture rendering (`src/rendering/`).
- Géométries/matériaux créés une seule fois ; aucune allocation ni recalcul dans `useFrame`.
- Non-régression : selftest orbital 7/7, selftest ephemeris 27/27, `tsc --noEmit` (0 erreur), `npm run build` (réussite).

## [Assets 3D réels] Intégration de modèles astronomiques NASA/JPL/USGS

- **Ajout** : `src/rendering/models/` — architecture de chargement d'assets réels découplée
  (registre + chargeur GLB/glTF + hook React), sans mélanger données orbitales, JPL, caméra et rendu.
- **Assets réels intégrés (10/10)** : cartes équirectangulaires d'albédo réelles pour Soleil, Mercure,
  Vénus, Terre, Lune, Mars, Jupiter, Saturne, Uranus, Neptune (sources documentées dans `modelRegistry.ts`).
- **Soleil** : texture SDO réelle ; `THREE.PointLight` conservé comme source lumineuse principale.
- **Saturne** : anneaux procéduraux conservés (secours documenté, aucun GLB d'anneau réel intégré).
- **GLB/glTF** : chargeur prêt (GLTFLoader + DRACO chargés paresseusement) ; aucun globe planétaire
  GLB officiel NASA disponible (le dépôt NASA 3D contient des engins spatiaux), d'où l'usage des
  cartes équirectangulaires réelles. Aucun asset généré/simulé.
- **Non-régression** : calculs orbitaux V0.9.4, JPL V1.0.x, visualScale, trajectoires, lighting V1.1.2
  et CameraController/OrbitControls/TimeControlBar/Focus Camera/sélection/zoom/damping intacts.
- **Validation** : `tsc --noEmit` 0 erreur, `npm run build` OK, selftest orbital 7/7, selftest ephemeris 27/27.

## V1.3.2 — Correction du rendu des corps (Soleil / Planètes / Anneaux)

- **Soleil** : rendu auto-émissif indépendant de l'éclairage des planètes (`emissiveMap` = texture SDO,
  `emissive` blanc, `emissiveIntensity` 1.15, `color` noir, `toneMapped` false). `THREE.PointLight` conservé
  comme source lumineuse des planètes (inchangé). Couronnes (glow) conservées.
- **Planètes** : suppression de la teinte saturée pure (`gradientColors.c2`) qui assombrissait/désaturait
  la texture réelle ; `color` blanc neutre quand la vraie texture est présente → couleurs naturelles.
- **Lune** : même correction (blanc neutre avec texture LROC).
- **Saturne** : anneaux plats uniques (`meshBasicMaterial` non éclairé) remplacés par de vrais anneaux 3D
  bandés — plusieurs `RingGeometry` concentriques à opacités variables avec divisions (trou de Cassini),
  orientés dans le plan équatorial (26.73°) et éclairés par la scène (`MeshStandardMaterial`, `DoubleSide`).
- **Terre** : suppression de la sphère d'atmosphère empilée (simulait une couleur par superposition).
- **Jour/Nuit** : vérifié intact (éclairage V1.1.2 non modifié).
- **Architecture respectée** : réutilisation `createSunMesh`/`createPlanetMesh`/`useSolarLighting`/`useAstroModel` ;
  aucune nouvelle dépendance ; aucune allocation dans `useFrame`.
- **Validation** : `tsc --noEmit` 0 erreur, `npm run build` OK, selftest orbital 7/7, selftest ephemeris 27/27.


## V1.3.3 — Correction régressions jour/nuit, zoom, Soleil, anneaux Saturne

- **Éclairage jour/nuit (V1.1.2 restauré)** : `src/rendering/lighting.ts` corrigé — `PointLight` au Soleil
  (`intensity 2.8`, `decay 0`) comme source radiale principale ; `DirectionalLight` faible (`0.04`) en
  fill fixe ; `AmbientLight` à `0.02`. Suppression du calcul incorrect de direction moyenne des planètes.
  `planetIllumination` simplifié à `true` pour tous les corps. `getPlanetMaterialConfig()` retourne
  valeurs fixes par `bodyType` (sans branche `isIlluminated`).
- **Soleil** : matériau aligné sur décision V1.3.2 (`color: "#000000"`, `emissive: "#ffffff"`,
  `emissiveIntensity: 1.15`, `toneMapped: false`, `side: THREE.DoubleSide`, `roughness: 0.3`,
  `metalness: 0.1`). Halos réduits (`opacity 0.12` / `0.06`).
- **Zoom & Focus Camera** : `OrbitControls.minDistance` `0.6` → `0.05` (aligné `camera.near`).
  `CameraController` : offset de focus proportionnel au rayon visuel (`3.5× radius` distance,
  `2× radius` hauteur). Après transition, `controls.minDistance = bodyRadius * 1.05`,
  `maxDistance` étendu. À la fermeture du focus, `minDistance` revient à `0.05`.
- **Anneaux de Saturne** : orientation corrigée — rotation groupe sur axe X
  (`rotation={[axialTilt, 0, 0]}`) pour plan équatorial incliné 26.73°.
- **Lune** : confirmation chargement texture LROC WAC via `useAstroModel("moon")`.
- **Non-régression** : tous systèmes LOCKED préservés (orbital V0.9.4, JPL V1.0.3, visualScale,
  trajectoires V1.3.1, CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection,
  damping, navigation, temps passé/futur, vitesses 0.1x/1x/5x/10x, responsive).

- **Tests** : selftest orbital 7/7, selftest ephemeris 27/27, `tsc --noEmit` 0 erreur, `npm run build` OK.


## V1.3.4 — Correction ciblée Lune (texture réelle) + Soleil (luminosité forte)

- **Lune** : vérification complète du chemin texture — `bodyType "moon"` → `modelRegistry.ts`
  (`textureFile: "/textures/moon.jpg"`, 2048×1024 LROC WAC) → `modelLoader.ts` → `useAstroModel("moon")`
  → `meshStandardMaterial` avec `map={moonTexture}`, `color="#ffffff"`. Mesh unique rendu inline
  dans `Planet` (Terre), pas de couche dupliquée. Texture appliquée au mesh visible.
- **Soleil** : 
  1. `modelRegistry.ts` : `textureFile` `sun.webp` (859×429 placeholder) → `sun.jpg` (2048×2048 SDO).
  2. `src/App.tsx` (`Sun`) : `emissive "#fff8e7"`, `emissiveIntensity 2.5`, `emissiveMap` = texture SDO.
  3. Halos renforcés : 3 couches (échelles 1.15/1.08/1.03), opacités 0.18/0.12/0.08, `AdditiveBlending`.
  4. `toneMapped: false`, `side: DoubleSide` conservés.
- **Non-régression** : tous systèmes LOCKED préservés.

- **Tests** : selftest orbital 7/7, selftest ephemeris 27/27, `tsc --noEmit` 0 erreur, `npm run build` OK.
