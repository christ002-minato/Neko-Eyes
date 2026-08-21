# TEST_LOG — Neko Eyes

> Journal des tests réellement effectués — seuls les résultats connus sont consignés.
> Aucune invention de résultats.

## 2026-08-21 — Simulation du suivi caméra (algorithme de CameraController, sans rendu)

- ✅ 6 620 frames suivies, 19 groupes de propriétés
- ✅ Tests de freeze, jitter, saut ou perte de cible en cours

## Étapes orbitales

### V0.8.1 Orbital Model

- ✅ selftest orbital : 7/7 tests passés (Soleil, Terre, Lune, hiérarchie Terre→Lune, périodicité, phase, distance Lune/Terre)
- ✅ TypeScript : `npx tsc --noEmit` → aucune erreur
- ✅ Build : `npm run build` → réussite

### V0.8.2 Terre

- ✅ connexion Terre au modèle orbital via `parentId: 'sun'`
- ✅ parité avec l'ancien calcul validée (position, période, mouvement)
- ✅ TypeScript : aucune erreur
- ✅ Build : réussite

### V0.8.3 Mars

- ✅ connexion Mars au modèle orbital via `parentId: 'sun'`
- ✅ Focus automatique + zoom (useEffect sur selectedPlanet)
- ✅ bouton Focus manuel ObjectInfoPanel conservé
- ✅ TypeScript : aucune erreur
- ✅ Build : réussite

### Focus Camera auto-déclenché

- ✅ useEffect sur selectedPlanet décline handleFocus automatiquement
- ✅ !isFocusing garde empêche double-trigger avec bouton manuel
- ✅ CameraController et OrbitControls inchangés
- ✅ TypeScript et build passent

## Tests navigateur (à réaliser)

- Terre en orbite → focus fluide, caméra centrée, objet continue son mouvement
- Mars en orbite → même comportement
- Lune autour de Terre → hiérarchie Terre→Lune préservée pendant focus
- Soleil → focus fluide
- rotation caméra pendant le suivi → préservée
- zoom pendant le suivi → préservé
- damping → préservé
- changement Terre → Mars → Terre → Lune → passage fluide
- sortie du focus → caméra rede libre immédiatement
- passé/futur → simulation continue
- 0.1x / 1x / 5x / 10x → respecté
- pause/reprise → fonctionnel

---

**Aucun test n'est inventé ici — seuls les résultats connus sont consignés.**