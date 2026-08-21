# DECISIONS — Neko Eyes

> **Décisions techniques confirmées par le code.** Aucune décision fictive.
> Dernière mise à jour : 2026-08-21.

## D1 — Stack React 19 + TypeScript + Vite

- **Décision** : scaffold conservé tel quel (React 19, Vite 8, TS 5.7 `strict`, alias `@` → `src`).
- **Raison** : base du projet, toolchain moderne et stable.
- **Statut** : active.

## D2 — Tailwind CSS v4 via plugin Vite

- **Décision** : styling utilitaire avec thème défini dans `src/index.css` (`@theme`), sans fichier de config Tailwind.
- **Raison** : approche canonique Tailwind v4 ; tokens centralisés (couleurs spatiales, polices).
- **Statut** : active.

## D3 — Three.js + React Three Fiber + Drei

- **Décision** : rendu 3D déclaratif en JSX (`<Canvas>`), `OrbitControls` de drei pour la navigation.
- **Raison** : intégration naturelle avec React et le cycle de rendu ; évite la gestion impérative de la scène.
- **Statut** : active.

## D4 — Architecture actuelle non définitive

- **Décision** : application mono-fichier (`src/App.tsx`) acceptée pour V0, considérée comme non définitive ; évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera.
- **Raison** : périmètre V0 maîtrisé ; refactoring prématuré = risque sur des systèmes LOCKED.
- **Statut** : active (à réévaluer à partir de V0.8).

## D5 — État React local actuel, pas de store externe

- **Décision** : état applicatif porté par `useState`/`useRef` dans `ExplorerSection`. Zustand n'est pas utilisé actuellement (statut PLANNED, voir `PROJECT_STATUS.md`) ; aucune migration décidée.
- **Raison** : un seul écran consommateur ; le temps simulé reste dans un `ref` muté par frame pour éviter les re-renders à 60 fps.
- **Statut** : active.

## D6 — Temps simulé centralisé existant

- **Décision** : une seule valeur `t` (ref) avancée dans `useFrame` par `delta × vitesse × direction` ; elle pilote positions, rotations, shader du Soleil et horloge UTC affichée (1 unité sim = 1 heure, époque = chargement de la page).
- **Raison** : cohérence garantie entre simulation visuelle et affichage ; pause = simple gel de `t`.
- **Statut** : active · 🔒 LOCKED (V0.7).

## D7 — Sélection avec focus automatique

- **Décision** : cliquer/toucher un objet (ou le choisir dans la liste) sélectionne l'objet ET lance la transition caméra, la simulation continuant de tourner.
- **Raison** : reproduit le comportement de NASA Eyes ; hitboxes invisibles élargies pour le tactile.
- **Statut** : active · 🔒 LOCKED (V0.5).

## D8 — Focus Camera par interpolation smoothstep sur cible vivante

- **Décision** : `CameraController` interpole caméra + cible OrbitControls vers la position recalculée chaque frame pendant la transition ; distance d'approche dérivée du rayon du corps.
- **Raison** : l'objet orbite pendant le vol caméra — viser une position figée raterait la cible.
- **Statut** : active · 🔒 LOCKED (V0.5).

## D9 — Hiérarchie Terre → Lune

- **Décision** : la Lune est positionnée relativement à la Terre (`getBodyPosition("moon")` = position Terre + offset orbital lunaire), et non comme un corps indépendant.
- **Raison** : reflète la relation gravitationnelle réelle ; la Lune suit automatiquement la Terre, y compris pendant les transitions caméra.
- **Statut** : active · 🔒 LOCKED (V0.6).

## D10 — Données astronomiques simplifiées codées en dur

- **Décision** : orbites circulaires coplanaires, périodes et rayons arbitraires, valeurs descriptives statiques dans `PLANETS`.
- **Raison** : suffisant pour V0 ; le remplacement par les éphémérides NASA/JPL est planifié (le panneau de position affiche « JPL ephemeris pending »).
- **Statut** : active, destinée à être remplacée (V0.8 Orbital Model puis NASA datasets / JPL Horizons).

## D11 — Soleil en shader GLSL procédural

- **Décision** : surface animée par bruit multi-octave (vertex/fragment shaders), pilotée par le temps simulé.
- **Raison** : rendu convaincant sans asset texture ; se met en pause/recule avec l'horloge simulée.
- **Statut** : active (texture réaliste planifiée).

## D12 — Design actuel non définitif

- **Décision** : le design V0 (thème spatial glassmorphism, header/hero/footer, panneaux) est validé comme base mais reste itératif.
- **Raison** : l'arrivée de nouvelles fonctionnalités (orbital model, textures, asteroids) pourra nécessiter des ajustements UI.
- **Statut** : active / iterative.

## D13 — Couche orbitale séparée du rendu (`src/orbital/`)

- **Décision** : le modèle orbital de calcul vit dans `src/orbital/` (types `OrbitalBody`/`OrbitalBodyDefinition`, `getBodyPosition(body, simulationTime)`, `defineOrbitalSystem`), sans aucune dépendance Three.js/React, et n'est pas connecté au rendu en V0.8.1. Conventions identiques au modèle v0 : unités scène, 1 unité sim = 1 h (source temporelle `simTime` existante), orbites circulaires coplanaires (x = cos(a)·r, z = sin(a)·r), `phase` en radians, hiérarchie parent → enfant résolue récursivement (généralise D9). Validation par selftest sans rendu (`node src/orbital/selftest.ts`) avant toute connexion.
- **Raison** : prépare la connexion NASA/JPL et la migration des corps existants (V0.8.x) sans toucher aux systèmes LOCKED ; le calcul devient testable indépendamment du rendu.
- **Statut** : active (V0.8.1 — couche validée ; Terre connectée en V0.8.2, Mars en V0.8.3, autres corps à suivre).

## D14 — Suivi caméra continu après focus

- **Décision** : après la transition de Focus Camera (D8), `CameraController` maintient caméra + cible OrbitControls sur la position monde recalculée chaque frame de l'objet focus, par translation rigide (même delta appliqué aux deux) — la simulation n'est jamais stoppée et la vitesse orbitale est inchangée. La Lune est suivie dans sa position monde hiérarchique Terre → Lune (D9). Un nouvel objet sélectionné relance une transition propre depuis la pose courante ; la fermeture du panneau (sortie explicite) rend la caméra libre sans toucher à `OrbitControls`.
- **Raison** : reproduit NASA Eyes — l'objet reste centré pendant qu'il poursuit son orbite ; la translation rigide préserve rotation/zoom/damping utilisateur.
- **Statut** : active (V0.8.3).

## D15 — Focus automatique au clic (ajout récent)

- **Décision** : lorsqu'un objet est sélectionné (clic ou PlanetSelector), le Focus Camera se déclenche automatiquement via `useEffect` sur `selectedPlanet`, sans nécessiter de bouton supplémentaire — bien que le bouton Focus manuel dans `ObjectInfoPanel` reste fonctionnel en parallèle.
- **Raison** : fluidifier l'expérience utilisateur — pas besoin de cliquer deux fois (sélection + bouton Focus) pour voir l'objet cadré.
- **Statut** : active (correction V0.8.3 en cours).

## D16 — Aucun GSAP, nouvelle architecture caméra, ou dépendance ajoutée

- **Décision** : aucune utilisation de GSAP, pas de nouvelle architecture de caméra sphérique, pas de nouvelle dépendance installée dans cette étape.
- **Raison** : stabilité du V0 ; éviter les risques sur systèmes LOCKED.
- **Statut** : active.