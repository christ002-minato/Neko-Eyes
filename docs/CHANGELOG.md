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

---

**Aucune fonctionnalités PLANNED n'est présentée comme implémentée.**