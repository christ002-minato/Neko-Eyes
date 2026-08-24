# PROJECT_STATUS — Neko Eyes

> Dernière mise à jour : 2026-08-24

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
