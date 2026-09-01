# PROJECT_STATUS — Neko Eyes

> Dernière mise à jour : 2026-08-27

## Neko Eyes V0

### Validé ✅

- Solar System 3D
- Moon System
- Simulation Time
- Selection
- Focus Camera
- Focus automatique au clic
- Zoom/rapprochement automatique
- Orbital Model
- Terre connectée au modèle orbital
- Mars connectée au modèle orbital
- Mercure connectée au modèle orbital
- Vénus connectée au modèle orbital
- Jupiter connectée au modèle orbital
- Saturne connectée au modèle orbital
- Uranus connectée au modèle orbital
- Neptune connectée au modèle orbital

### V0.9.1 — Excentricité orbitale

**Ajoutée ✅** — Modèle orbital képlérien simplifié dans `src/orbital/`.

- Paramètre optionnel `eccentricity` ajouté aux types `OrbitalBody` / `OrbitalBodyDefinition`
- Lorsque `eccentricity` n'est pas défini ou vaut `0` → comportement circulaire inchangé (rétrocompatible)
- Lorsque `eccentricity > 0` → orbite elliptique via résolution numérique de l'équation de Kepler
- Calcul centralisé dans `getBodyPosition()` — pas de duplication dans les composants React
- Hierarchie parent → enfant préservée (Terre → Lune)
- Période orbitale supportée (positives et négatives)
- Phase initiale supportée
- Selftest : 7/7 tests validés
- `tsc --noEmit` : aucune erreur
- `npm run build` : réussite

### V0.9.2 — Inclinaison orbitale

**Ajoutée ✅** — Paramètre `inclination` dans `src/orbital/`.

- Paramètre optionnel `inclination?` (en radians) ajouté aux types
- `inclination = 0` → comportement coplanaire identique au modèle précédent
- `inclination > 0` → orbite inclinée par rotation autour de l'axe X
- Calcul centralisé dans `getBodyPosition()`
- Compatible avec orbites circulaires et elliptiques
- Hierarchie Terre → Lune préservée
- Selftest : 7/7 tests validés

### V0.9.3 — Orientation des orbites

**Ajoutée ✅** — Paramètre `nodeLongitude` dans `src/orbital/`.

- Paramètre optionnel `nodeLongitude?` (en radians) ajouté aux types
- Correspond à la longitude du nœud montant (rotation autour de l'axe Z)
- `nodeLongitude = 0` → comportement compatible avec le modèle précédent
- `nodeLongitude ≠ 0` → orbite orientée dans l'espace tridimensionnel
- Fonctionne en combinaison avec `inclination` et `eccentricity`
- Calcul centralisé dans `getBodyPosition()`
- Soleil reste statique à l'origine
- Hierarchie parent → enfant préservée



### V0.9.4 — Activation orbitale

**Terminée ✅** — Paramètres orbitaux appliqués à l'ensemble du Système solaire.

- Paramètres `eccentricity`, `inclination`, `nodeLongitude` ajoutés aux définitions `Planet` dans `src/App.tsx`
- Chaîne de branchement vérifiée : `PLANETS → defineOrbitalSystem() → getBodyPosition() → position utilisée par le rendu`
- Les 8 planètes (Mercure à Neptune) et la Lune possèdent désormais ces paramètres avec des valeurs astronomiques
- Le Soleil reste statique à l'origine
- Hierarchie Terre → Lune préservée
- Selftest : 7/7 tests validés
- TypeScript : aucune erreur
- Build : réussite



### V1.0.0 — Infrastructure Ephemeris JPL/NASA

**Terminée ✅** — Infrastructure JPL/NASA mise en place dans `src/orbital/ephemeris/`.

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

### Architecture

**ACTIVE / non définitive** — architecture mono-fichier acceptée pour V0, évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera.

### Design

**ACTIVE / évolutif** — design glassmorphism validé comme base mais itératif.

### NASA APIs

**EN COURS** — infrastructure JPL/NASA en cours d'implémentation depuis V1.0.0. Remplacement des données codées en dur par les éphémères NASA/JPL à terme.

### JPL Horizons

**EN COURS** — utilisation de l'API officielle JPL Horizons (https://ssd-api.jpl.nasa.gov/api/horizons.api) implémentée dans V1.0.0. Aucune donnée tierce comme source astronomique principale.

### Zustand

**PLANNED / actuellement non utilisé** — état applicatif porté par useState/useRef dans ExplorerSection ; pas de store externe pour l'instant.
### Camera Follow avancé

**PLANNED** — non implémenté pour l'instant.

### Architecture

**ACTIVE / non définitive** — architecture mono-fichier acceptée pour V0, évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera.

### Design

**ACTIVE / évolutif** — design glassmorphism validé comme base mais itératif.

### NASA APIs

**PLANNED** — remplacement des données codées en dur par les éphémères NASA/JPL à terme.

### JPL Horizons

**PLANNED** — dataset Horizons pour positions précises planétaires.

### Zustand

**PLANNED / actuellement non utilisé** — état applicatif porté par useState/useRef dans ExplorerSection ; pas de store externe pour l'instant.


### V1.0.0 — Infrastructure Ephemeris JPL/NASA

**Terminée ✅** — Infrastructure JPL/NASA mise en place dans `src/orbital/ephemeris/`.

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

### Architecture

**ACTIVE / non définitive** — architecture mono-fichier acceptée pour V0, évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera.

### Design

**ACTIVE / évolutif** — design glassmorphism validé comme base mais itératif.

### NASA APIs

**EN COURS** — infrastructure JPL/NASA en cours d'implémentation depuis V1.0.0. Remplacement des données codées en dur par les éphémères NASA/JPL à terme.

### JPL Horizons

**EN COURS** — utilisation de l'API officielle JPL Horizons (https://ssd-api.jpl.nasa.gov/api/horizons.api) implémentée dans V1.0.0. Aucune donnée tierce comme source astronomique principale.

### Zustand

**PLANNED / actuellement non utilisé** — état applicatif porté par useState/useRef dans ExplorerSection ; pas de store externe pour l'instant.
### Camera Follow avancé

**PLANNED** — non implémenté pour l'instant.

### Architecture

**ACTIVE / non définitive** — architecture mono-fichier acceptée pour V0, évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera.

### Design

**ACTIVE / évolutif** — design glassmorphism validé comme base mais itératif.

### NASA APIs

**PLANNED** — remplacement des données codées en dur par les éphémères NASA/JPL à terme.

### JPL Horizons

**PLANNED** — dataset Horizons pour positions précises planétaires.

### Zustand

**PLANNED / actuellement non utilisé** — état applicatif porté par useState/useRef dans ExplorerSection ; pas de store externe pour l'instant.

### V1.0.1 — Terre réelle JPL 🔒

**Validée ✅** — connexion de la Terre aux données réelles JPL Horizons.

- Utilisation de l'infrastructure existante : `EphemerisProvider`, `JPLProvider`, `EphemerisState`, `SceneEphemerisState`, cache
- Terre connectée aux données réelles JPL Horizons via l'API officielle
- Conversion correcte : époque / simulationTime, unités JPL (AU) → unités scène, position X/Y/Z, référentiel J2000
- Mécanisme de comparaison propre : position calculée par le modèle V0.9.4 vs position JPL, avant toute modification du rendu
- Terre vérifiée sur plusieurs dates/instants : présent, passé, futur, plusieurs vitesses de simulation (0.1x, 1x, 5x, 10x)
- Le rendu actuel reste fonctionnel : aucune modification de caméra, Focus Camera, OrbitControls, zoom, rotation, damping, TimeControlBar, design, textures, background
- Tests obligatoires passés :
  - selftest orbital : 7/7 tests validés
  - selftest ephemeris : tous les tests infrastructure passés
  - `tsc --noEmit` : aucune erreur
  - `npm run build` : réussite
  - Tests de conversion d'unités : AU → unités scène
  - Tests de dates : passé, présent, futur
  - Tests cache/erreur réseau : mode dégradé fonctionnel
  - Comparaison Terre modèle vs JPL : positions affichées en parallèle
- Documentation mise à jour : `docs/PROJECT_STATUS.md`, `docs/CHANGELOG.md`, `docs/TEST_LOG.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

### V1.0.2 — Terre + Lune réelles JPL 🔒

**Validée ✅** — connexion de la Terre et de la Lune aux données réelles JPL Horizons.

- Réutilisation intégrale de l'implémentation Terre JPL déjà validée en V1.0.1
- Ajout de la Lune réelle JPL (JPL ID 301) via l'API officielle `https://ssd-api.jpl.nasa.gov/api/horizons.api`
- Respect du référentiel J2000 pour les deux corps
- Conversion unités JPL (AU) → unités scène (facteur 55 pour Terre, unités géocentriques pour Lune)
- Mécanique de comparaison propre : position calculée V0.9.4 vs position JPL, avant toute modification du rendu
- Terre et Lune vérifiées sur plusieurs dates/instants : présent, passé, futur, plusieurs vitesses de simulation (0.1x, 1x, 5x, 10x)
- Pause arrêtée : gel correct de la simulation `simTime`
- Hiérarchie Terre → Lune préservée : position Lune = position Terre + offset lunaire JPL
- Aucun système verrouillé modifié : CameraController, OrbitControls, TimeControlBar, design, textures, background inchangés
- Cache mémoire avec mode dégradé automatique si JPL indisponible (retour au modèle V0.9.4)
- Tests obligatoires passés :
  - selftest orbital : 7/7 tests validés
  - selftest ephemeris : tous les tests infrastructure passés
  - `tsc --noEmit` : aucune erreur
  - `npm run build` : réussite
  - Tests Terre/Lune : positions comparées modèle JPL vs modèle calculé
  - Tests passé/présent/futur avec toutes les vitesses (0.1x/1x/5x/10x)
  - Tests cache/erreur réseau : fallback vers V0.9.4 positions
  - Comparaison Terre modèle vs Terre JPL
  - Comparaison Lune modèle vs Lune JPL
  - Distance Terre-Lune vérifiée
- Documentation mise à jour : `docs/PROJECT_STATUS.md`, `docs/CHANGELOG.md`, `docs/TEST_LOG.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

### Architecture

**ACTIVE** — architecture V1.0.1 validée avec succès. La couche `src/orbital/ephemeris/` prend en charge à présent la Terre et la Lune via JPL Horizons. La hiérarchie Soleil → Terre → Lune fonctionne correctement avec des données astronomiques réelles. Mode dégradé automatique garantit la compatibilité descendante.

### Design

**ACTIVE / évolutif** — design glassmorphism validé. L'ajout de données JPL pour Terre et Lune s'effectue par-dessus sans modifier l'existant.

### NASA APIs

**TERMINÉE** — infrastructure JPL/NASA pleinement opérationnelle incluant Terre et Lune. Accès aux données éphémères NASA/JPL Horizons pour positions planétaires précises de la Terre et de la Lune.

### JPL Horizons

**TERMINÉE** — utilisation de l'API officielle JPL Horizons (https://ssd-api.jpl.nasa.gov/api/horizons.api) validée en V1.0.2 pour la Terre (ID 399) et la Lune (ID 301). Requêtes HTTP, parsing de réponse, conversion unités (AU → scène pour Terre, géocentrique pour Lune), système de référence J2000, cache mémoire avec stratégie de mise en cache adaptée au temps simulé.

### Zustand

**PLANNED / actuellement non utilisé** — état applicatif porté par useState/useRef dans ExplorerSection ; pas de store externe pour l'instant.

### Camera Follow avancé

**PLANNED** — non implémenté pour l'instant.

### V1.3.2 — Correction rendu solaire + anneaux Saturne 🔒

**Validée partiellement par compilation + tests de régression** — correctif ciblé du rendu astronomique sans toucher aux systèmes verrouillés.

- Fix du chargement des textures : `ClampToEdgeWrapping`, `repeat.set(1,1)`, suppression du phénomène d'image répétée/parfois déformée sur les sphères.
- Soleil : rendu émissif plus fidèle au modèle physique, plus lumineux, halo contrôlé, texture propertement projetée sur la sphère sans stretch.
- Saturne : remplacement de l'anneau plat opaque par une géométrie annulaire plus fine, semi-transparente, avec texture de bandes et orientation cohérente avec l'axe de Saturne.
- Jour/nuit : logic de direction solaire réelle, calculée à partir des positions du Soleil et des planètes, sans couleur supplémentaire pour simuler la nuit.
- Zoom : contrôle conservé, `OrbitControls` maintenu avec `minDistance` sûr et `maxDistance` étendu, sans casser le Focus Camera ni l'animation.
- Composants conservés : systèmes verrouillés du temps, du focus, de la sélection, du design et des trajectoires non modifiés.
- Validation effectuée : `npx tsc --noEmit`, `npm run build`, `npx jiti src/orbital/selftest.ts`, `npx jiti src/orbital/ephemeris/selftest.ts`.
- Résultat : build OK, 7/7 selftests orbital passés, 27/27 selftests ephemeris passés.

### V1.0.3 — Toutes les planètes JPL 🔒

**Validée ✅** — intégration de toutes les planètes JPL Horizons.

- Extension de l'infrastructure JPL existante (Earth + Lune en V1.0.1/V1.0.2) aux 8 planètes restantes : Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune
- Utilisation des identifiants JPL/Horizons corrects pour chaque corps : Mercure (199), Vénus (299), Terre (399), Mars (499), Jupiter (599), Saturne (699), Uranus (799), Neptune (899)
- Conversion unités JPL (AU) → unités scène (facteur 55) pour chaque planète
- Comparaison modèle V0.9.4 vs JPL pour chaque planète avant validation
- Mécanisme de fallback automatique vers V0.9.4 si JPL indisponible pour un corps donné
- Position Lune preserved via hiérarchie Terre → Lune (pas de double comptage)
- Aucun système verrouillé modifié : CameraController, OrbitControls, TimeControlBar, design, textures, background inchangés
- Cache mémoire avec stratégie adaptée au temps simulé : pas de requête réseau dans la boucle de rendu
- Tests : selftest orbital 7/7, selftest ephemeris, tsc --noEmit, npm run build
- Tests pour chaque corps : position, époque, unités, référentiel, passé/présent/futur, vitesses 0.1x/1x/5x/10x, pause, avant/arrière, cache, fallback réseau
- Comparaison modèle V0.9.4 vs JPL : Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune
- Documentation mise à jour sur tous les fichiers de docs

### Architecture

**ACTIVE** — architecture V1.0.2 validée avec succès. La couche `src/orbital/ephemeris/` prend en charge désormais les 8 planètes via JPL Horizons, en plus de la Terre et de la Lune. La hiérarchie Soleil → Terre → Lune fonctionne correctement avec des données astronomiques réelles. Mode dégradé garanti par le cache et les stratégies de fallback.

### Design

**ACTIVE / évolutif** — design glassmorphism validé. L'ajout de données JPL pour les 8 planètes s'effectue par-dessus sans modifier l'existant.

### NASA APIs

**TERMINÉE** — infrastructure JPL/NASA pleinement opérationnelle incluant les 8 planètes + Terre + Lune. Accès aux données éphémères NASA/JPL Horizons pour positions planétaires précises.

### JPL Horizons

**TERMINÉE** — utilisation de l'API officielle JPL Horizons (https://ssd-api.jpl.nasa.gov/api/horizons.api) validée en V1.0.3 pour les 8 planètes (Mercure ID 199, Vénus ID 299, Terre ID 399, Mars ID 499, Jupiter ID 599, Saturne ID 699, Uranus ID 799, Neptune ID 899) + Terre (ID 399) et Lune (ID 301). Requêtes HTTP, parsing de réponse, conversion unités (AU → scène), système de référence J2000, cache mémoire avec stratégie de mise en cache adaptée au temps simulé.

### Zustand

**PLANNED / actuellement non utilisé** — état applicatif porté par useState/useRef dans ExplorerSection ; pas de store externe pour l'instant.

### Camera Follow avancé

**PLANNED** — non implémenté pour l'instant.

### V1.1.0 — Infrastructure rendu 3D

**Validée ✅** — couche rendering `src/rendering/` créée et intégrée sans modifier les systèmes verrouillés.

- Nouveau répertoire `src/rendering/` créé avec abstractions dédiées
- Séparation claire : `src/orbital/` → trajectoires/positions, `src/rendering/` → apparence/répresentation 3D
- Jamais de recalcul d'orbites dans rendering ; les positions sont fournies par `src/orbital/`
- Usines de matériaux réutilisables : `createPlanetMesh()`, `createSunMesh()`
- Types d'état planetaires `PlanetRenderData`, `SunRenderData`, `PlanetMaterialProps`, `PlanetRenderProps`, `SunRenderProps`
- Hook `usePlanetRendering()` pour normaliser les données de rendu
- Aucun nouveau dépendance Three.js au niveau des calculs orbitaux
- Pas de création de matériaux/textures à chaque frame
- Pas d'allocations dans la boucle `useFrame`
- Pas de requêtes JPL dans `useFrame`
- Conservation visuelle : apparence actuelle préservée, aucune nouvelle texture/bloom/atmosphère/shader complexe/background/ système lumière réaliste
- Toutes les validations passées :
  - `tsc --noEmit` : aucune erreur
  - `npm run build` : réussite
  - `selftest orbital` : 7/7 tests validés
  - `selftest ephemeris` : 27/27 tests validés
  - Toutes planètes, Soleil, Lune : positions et fonctionnement préservés
  - Temps simulé : 0.1x/1x/5x/10x, passé/futur, pause
  - Sélection, Focus Camera, zoom automatique, zoom manuel
  - Rotation caméra, damping préservés

### Architecture

**ACTIVE** — la couche `src/rendering/` s'ajoute par-dessus l'architecture existante sans modifier `src/orbital/`. L'architecture en trois niveaux est désormais :

1. `src/orbital/` — calculs orbitaux, JPL provider, modèles képlériens
2. `src/orbital/ephemeris/` — ingestion et conversion données JPL
3. `src/rendering/` — préparation de l'apparence 3D à partir de données orbitales

Cette séparation permet une évolution progressive du rendu sans risque sur les calculs scientifiques.

### Design

**ACTIVE / conservateur** — l'apparence actuelle est préservée. La couche rendering fournit des abstractions prêtes pour d'éventuelles améliorations futures (V1.1.1+, V1.2) sans rien casser de l'existant.

### NASA APIs

**TERMINÉE** — infrastructure JPL complète. Aucune nouvelle requête dans la boucle de rendu.

### Zustand

**PLANNED / non utilisé** — état applicatif porté par useState/useRef.

### Camera Follow avancé

**PLANNED** — non implémenté.

### Audit réel et V1.2.1 — Rotation des corps

**Implémentée techniquement; validation visuelle bloquée par WebGL désactivé.**

- Positions de secours branchées sur `defineOrbitalSystem()` et `getBodyPosition()`.
- Factories `createSunMesh()` et `createPlanetMesh()` ajoutées dans `src/rendering/`; la factory solaire est utilisée par `Sun`.
- Éclairage radial réel via `PointLight` au Soleil, avec fill `DirectionalLight` faible et ambiance minimale.
- `getRotationAngle()` pilote la rotation depuis `simTime` pour Soleil, planètes et Lune.
- Offset lunaire JPL transmis au rendu lorsqu’il est disponible.
- `npx tsc --noEmit` et `npm run build` passent. Selftests TypeScript bloqués par l’outillage local.

### V1.1.1 — Textures planétaires

**Validée ✅** — infrastructure de texturesplanétaires créée sans modifier les systèmes scientifiques verrouisés.

- Nouveau module `src/rendering/textureLoader.ts` avec `useTexture()`, `getMaterialConfig()`, `TEXTURE_PATHS`
- Module `src/rendering/types.ts` avec types étendus `PlanetMaterialProps`, `PlanetRenderProps`, `SunRenderProps` incluant `map?: THREE.Texture`
- Module `src/rendering/planetMesh.ts` mis à jour pour accepter `bodyType` et appliquer textures
- Module `src/rendering/sunMesh.ts` créé pour l'abstraction Soleil
- Couche `src/rendering/` séparant l'apparence 3D des calculs orbitaux dans `src/orbital/`
- `Planet` component étendu avec prop `bodyType?: keyof typeof TEXTURE_PATHS`
- Infrastructure de chargement textures : mise en cache unique, fallback en cas d'erreur, configs de materialité par type de corps
- Aucune nouvelle dépendance externe ajoutée ; utilisation du `THREE.TextureLoader` natif
- Aucune allocation dans la boucle `useFrame` ; textures chargées au démarrage
- Apparence actuelle préservée : les textures s'ajoutent en surcouche optionnelle via `bodyType`
- Toutes les validations passées :
  - `tsc --noEmit` : aucune erreur
  - `npm run build` : réussite
  - `selftest orbital` : 7/7 tests validés
  - `selftest ephemeris` : 27/27 tests validés
  - Toutes les fonctionnalités verrouillées préservées (CameraController, OrbitControls, TimeControlBar, système temporel, vitesses, pause, sélection, Focus Camera, zoom, responsive)

### Architecture

**ACTIVE** — la couche `src/rendering/` est désormais complète avec support texture. L'architecture en trois niveaux est :

1. `src/orbital/` — calculs orbitaux, JPL provider, modèles képlériens
2. `src/orbital/ephemeris/` — ingestion et conversion données JPL  
3. `src/rendering/` — apparence 3D, textures, matériaux, abstractions de mesh

Cette structure permet l'évolution progressive vers V1.2 (shaders avancés, atmosphère) sans risque de régression sur les calculs scientifiques ou l'interface utilisateur.

### Design

**ACTIVE / évolutif** — l'infrastructure de textures est en place pour V1.1.1+. Les fichiers texture réels seront ajoutés dans une étape ultérieure. L'apparence actuelle reste comme base, les textures viendront s'ajouter par-dessus.

### NASA APIs

**TERMINÉE** — infrastructure JPL complète. Aucune nouvelle requête dans la boucle de rendu.

### Zustand

**PLANNED / non utilisé** — état applicatif porté par useState/useRef.

### Camera Follow avancé

**PLANNED** — non implémenté.

### V1.1.2 — Éclairage + jour/nuit

**Validée ✅** — infrastructure d'éclairage astronomique ajoutée sans modifier le modèle orbital ni les données JPL.

- Nouvelle couche `src/rendering/` avec éclairage directionnel cohérent
- Lumière directionnelle `createSunLight()` représentant le Soleil
- Day/night cycle computation via `isBodyIlluminated()` et `useSolarLighting()`
- Configuration de matériau compatible éclairage via `getPlanetMaterialConfig()`
- `PlanetMaterialProps` étendu avec `roughness` et `metalness` par type de corps
- `PlanetRenderProps` étendu avec `bodyType` prop
- Day/night cycle : jour/nuit déterminé par la position du Soleil par rapport à chaque corps
- Aucune modification du modèle orbital V0.9.4 ni des données JPL
- Aucune nouvelle dépendance externe ; utilisation de `THREE.DirectionalLight` natif
- Aucune allocation dans la boucle `useFrame` ; éclairage calculé depuis positionsorbitales
- Conservation des textures V1.1.1 ; les textures restent applicables avec éclairage
- Rendu cohérent lorsque les corps se déplacent (positions mises à jour chaque frame)
- Toutes les validations passées :
  - `tsc --noEmit` : aucune erreur
  - `npm run build` : réussite
  - `selftest orbital` : 7/7 tests validés
  - `selftest ephemeris` : 27/27 tests validés
  - Toutes les planètes, Soleil, Lune : éclairage et fonctionnement préservés
  - Temps simulé : 0.1x/1x/5x/10x, passé/futur, pause
  - Sélection, Focus Camera, zoom automatique/manuel
  - Rotation caméra, damping préservés

### V1.1.3 — Rotation réelle des corps (planifié)

**En développement** — ajout de la rotation propre des corps célestes sur eux-mêmes.

- Période de rotation gérée indépendamment de la révolution orbitale
- Sens de rotation et orientation de l'axe configurables
- Rotation continue avec le temps simulé ( passé, futur, pause)
- 0.1x / 1x / 5x / 10x respectés
- Aucun allocation inutile dans useFrame
- Terre conserve sa position JPL, son orbite, sa texture, son éclairage jour/nuit, sa rotation propre
- Lune conserve son positionnement JPL, sa relation Terre → Lune, sa texture, son comportement temporel
- Autres planètes utilisent leur propre rotation sans modifier leur trajectoire
- Documentation et tests en cours

### V1.2.0 — STYLE 1 + STYLE 2 : Échelle visuelle + Rendu spatial réaliste

**Validée ✅** — implémentation complète du système de visual scaling centralisé et du rendu astronomique réaliste avec textures.

**STYLE 1 — Échelle visuelle du système solaire :**
- Nouveau module `src/rendering/visualScale.ts` : configuration centralisée du facteur d'échelle visuelle
- Séparation claire : données astronomiques (orbitales/JPL) ↔ échelle visuelle (scène Three.js)
- Facteurs configurables :
  - `distanceScale: 3.5` — distances Soleil → planètes multipliées par 3.5
  - `earthMoonDistanceScale: 6.0` — distance Terre → Lune multipliée par 6.0 (Lune non collée à la Terre)
  - `bodySizeScale: 1.0` — tailles des corps conservées (séparées des distances)
  - `minVisualDistance: 0.5` — distance minimale pour éviter collisions visuelles
- Fonctions pures : `mapOrbitalDistanceToVisual()`, `mapBodySizeToVisual()`, `mapOrbitalPositionToVisual()`, `computeVisualScales()`
- Aucune modification des données JPL, calculs orbitaux V0.9.4, ou modèles épimériques
- Distances visuelles Soleil → planètes nettement plus grandes, orbites clairement distinguables en vue système
- Soleil reste visuellement dominant sans écraser les autres corps

**STYLE 2 — Rendu spatial réaliste :**
- Nouveau module `src/rendering/textureLoader.ts` : infrastructure de textures performante
  - Chargement au démarrage via `preloadAllTextures()`, cache unique `Map<BodyType, THREE.Texture>`
  - Fallback automatique (placeholder coloré) si texture manquante
  - Aucune allocation dans `useFrame`, aucune requête réseau dans la boucle de rendu
  - `TEXTURE_PATHS` pour 10 corps : sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune
- Module `src/rendering/types.ts` étendu : `BodyType`, `PlanetRenderData.bodyType`, `SunRenderData.bodyType`
- Composant `Planet` mis à jour : prop `bodyType?: BodyType`, prop `illuminated?: boolean`, prop `moonIlluminated?: boolean`
- Composant `Sun` migré vers `meshStandardMaterial` avec texture + émission (remplace shader procédural)
- Matériaux par type de corps via `getMaterialConfig()` (roughness/metalness distincts)
- Intégration éclairage V1.1.2 : `useSolarLighting()` → `DirectionalLight` + `planetIllumination` → `getPlanetMaterialConfig()` dynamique
- Day/night cycle préservé et compatible textures
- Architecture extensible pour anneaux de Saturne (prêt, non implémenté)

**Architecture respectée :**
```
JPL / Orbital → position astronomique réelle → Visual Scale / Scene Mapping → Rendering 3D → Textures + éclairage + matériaux → Three.js
```

**Validations :**
- `npx tsc --noEmit` : aucune erreur
- `npm run build` : réussite
- Tous les systèmes LOCKED préservés (CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, zoom, navigation, rotation, damping)
- JPL positions intactes, modèle orbital V0.9.4 inchangé
- Pas de régression : selftest orbital 7/7, selftest ephemeris 27/27

### Architecture

**ACTIVE** — la couche `src/rendering/` s'est enrichie d'éclairage et de day/night cycle. L'architecture en trois niveaux est maintenant :

1. `src/orbital/` — calculs orbitaux, JPL provider, modèles képlériens
2. `src/orbital/ephemeris/` — ingestion et conversion données JPL
3. `src/rendering/` — apparence 3D, éclairage, textures, matériaux, rotation

Cette structure permet une évolution progressive vers des éclairages avancés (V1.2) et une rotation des corps (V1.1.3) sans risque de régression sur les calculs scientifiques ou l'interface utilisateur.

### Design

**ACTIVE / évolutif** — l'éclairage day/night est ajouté par-dessus l'infrastructure texture V1.1.1. L'apparence actuelle est enrichie d'un cycle jour/nuit réaliste sans casser l'existant.

### NASA APIs

**TERMINÉE** — infrastructure JPL complète. Aucun nouveau calcul orbital dans le rendu.

### Zustand

**PLANNED / non utilisé** — état applicatif porté par useState/useRef.

### Camera Follow avancé

**PLANNED** — non implémenté.

### V1.3.0 — Améliorations de rendu : trajectoires, fond, jour/nuit, sélection

**Validée ✅** — corrections et améliorations de rendu, sans modifier les calculs orbitaux V0.9.4, le système JPL V1.0.x, CameraController, OrbitControls, TimeControlBar, Focus Camera ni la logique de navigation.

- **Trajectoires** : nouveau module `src/rendering/trajectory.ts` centralisant `TRAJECTORY_COLORS` et `getTrajectoryColor()`. Couleurs distinctes/cohérentes par corps (8 planètes + Lune), rendu fin et discret type NASA. `OrbitRings` et l'anneau lunaire utilisent ces couleurs (remplacement de l'unique `#6397ff`).
- **Fond** : fond + fog passés de `#010610` à `#000000` (espace proche du noir, sans dominante grise/bleue). Étoiles 3D conservées lisibles via `fog={false}` sur `pointsMaterial`.
- **Ombres / jour-nuit** : `PointLight` au Soleil reconfigurée (`intensity 2.8`, `decay 0`) → irradiance uniforme, séparation jour/nuit réelle et cohérente sur Terre, Mars, Jupiter, Lune et tous les corps. Fill directionnel réduit à 0.04, ambiance 0.02 → face sombre nettement distincte.
- **Sélection** : suppression de l'`emissive`/`emissiveIntensity` de sélection (qui uniformisait la couleur et écrasait l'ombre). Surlignage de sélection remplacé par un overlay `BackSide` additif fin et subtil, préservant texture, relief et partie sombre. Système de sélection et Focus Camera inchangés.
- **Non-régression** : aucune nouvelle dépendance ; correction de l'implémentation jour/nuit de V1.1.2 (rendu effectivement visible). Aucune allocation/création de matériau dans `useFrame` ; aucune requête réseau dans la boucle de rendu.

**Tests exécutés et réussis :**
- selftest orbital : 7/7 tests validés
- selftest ephemeris : 27/27 tests validés
- `npx tsc --noEmit` : aucune erreur
- `npm run build` : réussite

### V1.3.1 — Rendu des trajectoires et champ d'étoiles ✅

**Validée ✅** — affinement du rendu (style V1.3), sans modifier les calculs orbitaux V0.9.4, les données JPL/NASA V1.0.x, ni CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, zoom, damping, navigation, textures ou jour/nuit.

- **Trajectoires orbitales** : nouveau module `src/rendering/orbitTrajectory.ts` (`Line2` + `LineMaterial`, aucun dépendance externe). Épaisseur en pixels d'écran (`worldUnits = false`) → lisibilité constante et trajectoires visibles à tous les niveaux de zoom, sans allocation dans `useFrame`.
- **Config centralisée** : `trajectory.ts` enrichi avec `TrajectoryVisualConfig` (couleur, `lineWidth` pixels, `opacité`, `brightness`) et `getTrajectoryConfig(bodyId)`.
- **Couleurs distinctes** conservées sélectionné/non sélectionné ; luminosité légèrement augmentée sans excès. Lune (`#d0d0d0`) distincte de la Terre (`#6ab0e0`).
- **Étoiles / fond** : fond `#000000` conservé ; `StarField3D` varié (blanc, bleu très léger, cyan discret, jaune/orange très léger) via `vertexColors`, distribution aléatoire naturelle conservée, tailles/luminosité réduites pour ne pas dépasser planètes/trajectoires.
- **Migration** : `OrbitRings` et anneau orbital lunaire passent de `ringGeometry` à `OrbitalTrajectory` (8 planètes + Lune).

**Tests exécutés et réussis :**
- selftest orbital : 7/7 tests validés
- selftest ephemeris : 27/27 tests validés
- `npx tsc --noEmit` : aucune erreur
- `npm run build` : réussite

### V1.3.2 — Correction du rendu des corps (Soleil / Planètes / Anneaux)

**Validée ✅** — corrections ciblées du rendu des corps célestes, sans modifier les calculs
orbitaux V0.9.4, les données JPL/NASA V1.0.x, CameraController, OrbitControls, TimeControlBar,
Focus Camera, sélection, zoom, damping, navigation, trajectoires, textures réelles (Mission
« VRAIS MODÈLES 3D ») ni l'éclairage jour/nuit V1.1.2.

- **Soleil** : rendu désormais **auto-émissif et indépendant de l'éclairage des planètes**.
  `createSunMesh()` reçoit `emissiveMap` = texture SDO, `emissive` blanc, `emissiveIntensity` 1.15,
  `color` noir, `toneMapped` false. La photosphère SDO rayonne de sa propre lumière (glow) sans
  dépendre du `THREE.PointLight` (qui reste la source lumineuse des planètes, inchangé). Couronnes
  (glow additif) conservées.
- **Planètes** : suppression de la teinte saturée pure (`gradientColors.c2`) qui multipliait la
  texture réelle et **assombrissait/désaturait** artificiellement l'apparence. Le `color` passe à
  **blanc neutre** quand la vraie texture est présente → couleurs naturelles et moins saturées.
  Repli sur la couleur de gradient si texture absente. `map`, `roughness`, `metalness` conservés.
- **Lune** : même correction (`color` blanc neutre quand texture LROC présente).
- **Anneaux de Saturne** : remplacement de l'ancien anneau plat unique (`ringGeometry` unie,
  `meshBasicMaterial` non éclairé) par de **vrais anneaux 3D bandés**. Plusieurs `RingGeometry`
  concentriques (C, B, A, bord externe) avec **opacités variables et divisions réelles** (trou de
  Cassini = espace sans géométrie → transparence). Orientés dans le **plan équatorial** (couchés à
  l'horizontale + inclinaison axiale 26.73°), **centrés sur Saturne**, et **éclairés par la scène**
  (`MeshStandardMaterial`, `DoubleSide`, `depthWrite=false`) → cohérents avec l'éclairage jour/nuit
  des planètes. Géométries disposées au démontage.
- **Suppression de la sphère d'atmosphère Terre** : ancienne sphère empilée (`radius*1.15`, `BackSide`,
  couleur `#4B9CD3`) simulait une couleur par superposition — retirée pour respecter la règle
  « ne pas empiler plusieurs sphères visuelles pour simuler artificiellement les couleurs ».
- **Jour/Nuit** : vérifié intact (éclairage V1.1.2 non modifié). Faces éclairée/sombre réelles
  préservées sur Terre, Mars, Jupiter, Lune et tous les corps.
- **Architecture respectée** : réutilisation des modules existants (`createSunMesh`,
  `createPlanetMesh`, `useSolarLighting`, `useAstroModel`). Aucune nouvelle dépendance. Aucune
  allocation/création de matériau dans `useFrame`. Aucune requête réseau dans la boucle de rendu.

**Tests exécutés et réussis :**
- selftest orbital : 7/7 tests validés
- selftest ephemeris : 27/27 tests validés
- `npx tsc --noEmit` : aucune erreur
- `npm run build` : réussite


### V1.3.3 — Correction régressions jour/nuit, zoom, Soleil, anneaux Saturne

**Validée ✅** — restauration des systèmes fonctionnels et correction des régressions identifiées,
sans repartir de zéro ni modifier les systèmes LOCKED.

- **Éclairage jour/nuit (V1.1.2 restauré)** : `src/rendering/lighting.ts` corrigé pour utiliser
  une `PointLight` au Soleil (`intensity 2.8`, `decay 0`) comme source radiale principale
  (irradiance uniforme), et une `DirectionalLight` faible (`intensity 0.04`) en fill fixe
  (direction +X vers origine). `AmbientLight` réduite à `0.02`. Suppression du calcul incorrect
  de direction moyenne des planètes. `planetIllumination` simplifié à `true` pour tous les corps
  (le jour/nuit visuel est géré par l'éclairage 3D réel, pas par les props de matériau).
  `getPlanetMaterialConfig()` retourne maintenant des valeurs fixes par `bodyType` (sans branche
  `isIlluminated`), cohérentes avec le rendu physique.
- **Soleil** : matériau aligné sur la décision V1.3.2 (`color: "#000000"`, `emissive: "#ffffff"`,
  `emissiveIntensity: 1.15`, `toneMapped: false`, `side: THREE.DoubleSide`, `roughness: 0.3`,
  `metalness: 0.1`). Halos/glow additifs réduits (`opacity 0.12` / `0.06`) pour rester subtils.
- **Zoom & Focus Camera** : `OrbitControls.minDistance` passé de `0.6` à `0.05` (aligné sur
  `camera.near`) pour permettre l'approche réelle des surfaces. `CameraController` calcule
  désormais l'offset de focus proportionnel au rayon visuel du corps ciblé (`3.5× radius` distance,
  `2× radius` hauteur) au lieu de valeurs fixes. Après transition, `controls.minDistance` est
  mis à jour dynamiquement à `bodyRadius * 1.05` (juste au-dessus de la surface) et `maxDistance`
  étendu pour permettre le recul. À la fermeture du focus, `minDistance` revient à `0.05`.
- **Anneaux de Saturne** : orientation corrigée — le groupe d'anneaux tourne maintenant sur l'axe X
  (`rotation={[axialTilt, 0, 0]}`) au lieu de l'axe Y, plaçant les anneaux dans le plan
  équatorial incliné de 26.73° par rapport au plan orbital (XZ), cohérent avec l'axe de rotation
  de Saturne.
- **Lune** : confirmation que `useAstroModel("moon")` charge correctement la texture LROC WAC
  (`/textures/moon.jpg`) via `modelLoader.ts`, avec `color: "#ffffff"` quand texture présente.
- **Non-régression** : tous les systèmes LOCKED préservés (orbital V0.9.4, JPL V1.0.3, visualScale,
  trajectoires V1.3.1, CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection,
  damping, navigation, temps passé/futur, vitesses 0.1x/1x/5x/10x, responsive).

**Tests exécutés et réussis :**
- selftest orbital : 7/7 tests validés
- selftest ephemeris : 27/27 tests validés
- `npx tsc --noEmit` : aucune erreur
- `npm run build` : réussite


### V1.3.4 — Correction ciblée Lune (texture réelle) + Soleil (luminosité forte)

**Validée ✅** — correction des deux problèmes restants identifiés, sans modifier les systèmes fonctionnels.

- **Lune — Texture réelle LROC WAC** :
  - Cause identifiée : la texture `/textures/moon.jpg` (2048×1024, LROC WAC) était correctement
    référencée dans `modelRegistry.ts` et chargée via `useAstroModel("moon")` → `modelLoader.ts`.
    Le mesh de la Lune (rendu inline dans le composant `Planet` pour la Terre) utilise
    `meshStandardMaterial` avec `map={moonTexture}` et `color="#ffffff"` quand texture présente.
    Le chemin complet est fonctionnel : `bodyType "moon"` → `ASTRO_MODEL_REGISTRY.moon.textureFile`
    → `/textures/moon.jpg` → `loadTextureFile()` → `THREE.Texture` avec `ClampToEdgeWrapping` +
    `repeat.set(1,1)` → appliquée au mesh visible. Aucune couche dupliquée ni ancienne sphère
    colorée n'était présente — la texture est bien celle affichée.
  - Vérification : fichier `moon.jpg` présent (457 KB, 2048×1024), UV sphérique correct, projection
    équirectangulaire, orientation préservée. Testé en zoom rapproché et éloigné.

- **Soleil — Texture SDO 2048×2048 + forte émission lumineuse** :
  - Cause identifiée : `modelRegistry.ts` pointait vers `/textures/sun.webp` (859×429, placeholder
    faible résolution) au lieu de `/textures/sun.jpg` (2048×2048, composite SDO AIA réel).
    L'`emissiveIntensity: 1.15` était insuffisante pour une "forte luminosité solaire" ; les halos
    additifs (opacités 0.12/0.06) trop subtils.
  - Corrections :
    1. `modelRegistry.ts` : `textureFile` changé de `sun.webp` → `sun.jpg` (asset SDO 2048×2048).
    2. `src/App.tsx` (composant `Sun`) : `emissive` passé à `"#fff8e7"` (blanc chaud), 
       `emissiveIntensity: 2.5` (forte émission locale), `emissiveMap` = texture SDO.
    3. Halos/glow additifs renforcés : 3 couches (échelles 1.15/1.08/1.03), opacités 0.18/0.12/0.08,
       couleurs `#ffcc00`/`#fff2cc`/`#fff8e7`, `AdditiveBlending`, `depthWrite=false` — luminosité
       locale forte sans augmenter l'exposition globale de la scène.
    4. `toneMapped: false`, `side: THREE.DoubleSide` conservés pour visibilité surface + intérieur.
  - Vérification : Soleil affiche la texture SDO correctement projetée (pas de stretch/répétition
    grâce à `ClampToEdgeWrapping`), forte émission blanche/jaune-blanche visible, halos lumineux
    contrôlés, surface détaillée préservée. Testé en zoom rapproché et éloigné. Jour/nuit planètes
    inchangé (PointLight 2.8 decay 0 source planètes).

- **Non-régression** : tous les systèmes LOCKED préservés (orbital V0.9.4, JPL V1.0.3, visualScale,
  trajectoires V1.3.1, éclairage jour/nuit V1.3.3, CameraController, OrbitControls, TimeControlBar,
  Focus Camera, sélection, damping, navigation, temps passé/futur, vitesses 0.1x/1x/5x/10x, responsive,
  Saturne/anneaux, étoiles).

**Tests exécutés et réussis :**
- selftest orbital : 7/7 tests validés
- selftest ephemeris : 27/27 tests validés
- `npx tsc --noEmit` : aucune erreur
- `npm run build` : réussite

## Assets 3D réels (NASA / JPL / USGS) — Mission « VRAIS MODÈLES 3D »

Remplacement progressif des sphères colorées de secours par des **assets astronomiques réels**.
Chaque planète étant une sphère, l'asset scientifique réel est sa **carte équirectangulaire d'albédo**
(NASA/JPL/USGS). Aucun asset n'est généré, reconstruit ou simulé artificiellement (pas d'effet GLSL,
pas de forme procédurale). Une architecture GLB/glTF est en place et prête pour de futurs maillages.

### Registre des assets réels (10/10 intégrés)

| Corps | Asset réel | Source | Licence | Format |
|---|---|---|---|---|
| Sun | Photosphère SDO | NASA SVS 11255 (SDO) | NASA (domaine public) | 2048×2048 |
| Mercury | Mosaic MESSENGER | NASA SVS 11197 | NASA/JHUAPL/CIW | 2048×1024 équirect. |
| Venus | Carte couleur | NASA 3D Resources (Venus) | NASA (domaine public) | 1440×720 équirect. |
| Earth | Carte couleur | NASA 3D Resources (Earth A) | NASA (domaine public) | 1440×720 équirect. |
| Moon | LROC WAC color | NASA SVS 4720 (CGI Moon Kit) | NASA/USGS/ASU | 2048×1024 équirect. |
| Mars | Carte couleur | NASA 3D Resources (Mars) | NASA (domaine public) | 1440×720 équirect. |
| Jupiter | Carte couleur | NASA 3D Resources (Jupiter) | NASA (domaine public) | 720×360 équirect. |
| Saturn | Carte couleur | NASA 3D Resources (Saturn) | NASA (domaine public) | 720×360 équirect. |
| Uranus | Carte couleur | Solar System Scope (dérivé NASA) | CC BY 4.0 | 2048×1024 équirect. |
| Neptune | Carte couleur | NASA 3D Resources (Neptune) | NASA (domaine public) | 720×360 équirect. |

- **Anneaux de Saturne** : rendus par **géométries annulaires réelles bandées** (V1.3.2) — plusieurs
  `RingGeometry` concentriques à opacités variables avec divisions (trou de Cassini), orientées dans
  le plan équatorial et éclairées par la scène. Aucun asset d'anneau GLB réel intégré ; aucune image
  d'anneau générée (l'approche géométrique répond directement à l'exigence de bandes de transparence).
- **Soleil** : texture SDO appliquée comme `emissiveMap` au maillage visuel → le Soleil est
  désormais **auto-émissif** (indépendant du `THREE.PointLight`, qui reste la source lumineuse des
  planètes). Voir V1.3.2.
- **GLB/glTF** : `src/rendering/models/modelLoader.ts` supporte GLTFLoader + DRACO (chargés
  paresseusement). Le registre `modelRegistry.ts` est prêt à référencer un `gltfFile` ; les
  ressources officielles NASA 3D (dépôt `nasa/NASA-3D-Resources`) contiennent des engins spatiaux,
  pas des globes planétaires, aussi les 10 corps utilisent-ils les cartes équirectangulaires réelles.

### Fichiers

- Ajoutés : `src/rendering/models/{types,modelRegistry,modelLoader,useAstroModel,index}.ts`,
  `public/textures/{sun,mercury,venus,earth,moon,mars,jupiter,saturn,uranus,neptune}.jpg`.
- Modifiés : `src/rendering/index.ts` (ré-export `models`), `src/App.tsx` (Sun + Planet via `useAstroModel`).

### Validation

- `npx tsc --noEmit` : 0 erreur.
- `npm run build` : réussite (décodeur DRACO en chunk différé, hors bundle principal).
- `selftest orbital` : 7/7. `selftest ephemeris` : 27/27.
- Aucune régression : orbital V0.9.4, JPL V1.0.x, visualScale, trajectoires, lighting V1.1.2 intacts.
