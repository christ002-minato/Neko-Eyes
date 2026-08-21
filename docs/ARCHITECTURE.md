# ARCHITECTURE — Neko Eyes

> Ne pas présenter cette architecture comme l'architecture interne confirmée de NASA Eyes.
> C'est la documentation de l'architecture réelle présente dans ce projet V0/V0.8.

## Architecture actuelle

### `src/App.tsx` — fortement centralisé

- Tous les composants et l'état principal résident dans un seul fichier `src/App.tsx`.
- C'est l'état actuel accepté pour V0, considéré comme non définitif (voir DECISIONS.md D4).
- Évolution progressive vers des responsabilités séparées seulement quand le projet le justifiera.

### `src/orbital/` — modèle orbital indépendant

- Nouveau module `src/orbital/` contenant le modèle orbital.
- **Indépendant de React/Three.js** — types, calculs de position, câblage hiérarchique ne connaissent aucune dépendence Three.js.
- `getBodyPosition(body, simulationTime)` — renvoie la position mondiale d'un corps en unités scène.
- Définitions plates (`OrbitalBodyDefinition`) câblées vers graphe hiérarchique (`OrbitalBody`) via `defineOrbitalSystem()`.
- La hiérarchie parent → enfant permet notamment **Terre → Lune** : la position de la Lune = position Terre + offset orbital lunaire.

### Système caméra

- **CameraController** — reste celui de la **V0** stable (`d534dd3`).
- **OrbitControls** — wrapper Drei, damping, zoom, rotation préservés.
- **Aucun Camera Follow avancé** n'est actuellement implémenté.
- Focus + zoom automatique : lorsqu'un objet est sélectionné, `handleFocus()` lance une transition smoothstep vers la position mondiale de l'objet avec offset `[+15, 10, +15]`.

### Séparation claire

```
Architecture actuelle          ≠  Architecture cible
(src/App.tsx centralisé)      (progressive, non définitive)
```

L'architecture cible reste progressive et non définitive — évolutions au fil des versions.

## Architecture cible (future)

Non définitive — pourra évoluer vers :
- responsabilités séparées (explorer, orbital, ui, etc.);
- Zustand pour l'état applicatif;
- connexion NASA/JPL Horizons;
- Camera Follow avancé;
- etc.