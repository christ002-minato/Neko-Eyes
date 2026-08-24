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
