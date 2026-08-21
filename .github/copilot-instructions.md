# Copilot Instructions — Neko Eyes

> **Source de vérité** : lire `docs/PROJECT_STATUS.md` avant toute tâche.

## Règles permanentes

1. **Lire `docs/PROJECT_STATUS.md`** avant toute tâche — il définit l'état validé.
2. **Consulter `docs/ARCHITECTURE.md`** uniquement pour les parties concernées par la modification.
3. **Ne pas refaire inutilement** les fonctionnalités déjà LOCKED (V0, orbital model, sélection, Focus + zoom, Moon System, design, TimeControlBar, textures, background).
4. **Ne pas faire de refactoring global** sans demande explicite — les corrections ciblées uniquement.
5. **Effectuer uniquement les tests pertinents** à la modification (selftest, tsc, build).
6. **Mettre à jour la documentation** après une étape validée (CHANGELOG, PROJECT_STATUS, etc.).
7. **Ne jamais présenter une fonctionnalité PLANNED** comme implémentée.
8. **Respecter les parties LOCKED** — V0, orbital model (Terre/Mars), Focus + zoom, Moon System, etc.
9. **Préserver les comportements existants** lors des corrections ciblées — ne pas casser ce qui fonctionne.

## Interdits

- Ne pas présenter de fonctionnalité PLANNED comme implémentée.
- Ne pas toucher au système temporel, TimeControlBar, 0.1x/1x/5x/10x, passé/futur, pause/reprise.
- Ne pas modifier Moon System, sélection, Focus + zoom, design, responsive, background, textures.
- Ne pas ajouter de nouvelle dépendance sans accord explicite.