# PROJECT_STATUS — Neko Eyes

> Dernière mise à jour : 2026-08-21

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

### Camera Follow avancé

**PLANNED** — non implémenté pour l'instant.

### Architecture

**ACTIVE / non définitive** — architecture mono-fichier acceptée pour V0, évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera.

### Design

**ACTIVE / évolutif** — design glassmorphism validé comme base mais itératif.

### Textures réalistes

**PLANNED** — planifié pour une étape ultérieure.

### NASA APIs

**PLANNED** — remplacement des données codées en dur par les éphémères NASA/JPL à terme.

### JPL Horizons

**PLANNED** — dataset Horizons pour positions précises planétaires.

### Zustand

**PLANNED / actuellement non utilisé** — état applicatif porté par useState/useRef dans ExplorerSection ; pas de store externe pour l'instant.

### Architecture actuelle non définitive

**ACTIVE** — application mono-fichier (`src/App.tsx`) acceptée pour V0, considérée comme non définitive ; évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera. Pas de refactoring global maintenant.