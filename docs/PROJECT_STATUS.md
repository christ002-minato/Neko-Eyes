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
