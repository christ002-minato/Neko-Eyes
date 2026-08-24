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
