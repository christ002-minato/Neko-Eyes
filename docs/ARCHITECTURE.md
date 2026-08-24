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
## Connexion JPL Horizons (V1.0.1)

- **Couche épimérique** : `src/orbital/ephemeris/` ajouté, indépendant de Three.js/React
- **Provider JPL** : `JPLProvider` implémente `EphemerisProvider` avec accès à l'API officielle
- **Référentiel** : positions en J2000, unités en UA (converties en unités scène par facteur 55)
- **Mise en œuvre** : Terre connectée aux données JPL Horizons via requêtes HTTP `fetch`
- **Cache** : mémoire Map pour éviter les requêtes répétées ; mode dégradé si API indisponible
- **Conversion** : époque → date JPL (`simulationTimeToDate`), UA → unités scène (×55), position J2000 → scène
- **Comparaison** : mécanisme propre permettant de comparer position calculée V0.9.4 vs position JPL avant toute modification du rendu
- **Hiérarchie Terre→Lune** : position Lune = position Terre (issue JPL) + offset lunaire calculé, pas de double mouvement orbital

L'architecture cible progresse progressivement vers l'intégration NASA/JPL, conformément aux décisions D13 et D10.

## Connexion Lune JPL (V1.0.2)

- **Corps Lune** : `JPL ID 301` — position en unités géocentriques (relative à la Terre)
- **Référentiel** : J2000 pour les positions cartésiennes, système géocentrique pour l'offset lunaire
- **Mise en œuvre** : `JPLProvider.getState('moon', simTime)` récupère la position de la Lune relative à la Terre
- **Hiérarchie Terre → Lune** : position Lune = position Terre (JPL) + offset lunaire JPL (déjà géocentrique)
- **Pas de double comptage** : la position JPL de la Lune est déjà relative à la Terre, elle ne reçoit donc pas deux fois le mouvement orbital de la Terre
- **Conversion** : unités JPL directement utilisables comme `positionOverride` dans le composant `Planet` pour la Lune
- **Cache** : mémoire Map avec clés `'earth'` et `'moon'` ; TTL non applicable — les données sont valides tant que la simulation tourne
- **Mode dégradé** : si l'API JPL est indisponible, la position Luna revient au modèle calculé `getMoonOffset(time)` preserving V0.9.4 behavior

L'architecture V1.0.2 confirme que la connexion JPL peut s'étendre aux corps supplémentaires sans casser les hiérarchies existantes, conformément à la décision D13.

## Connexion Toutes les planètes JPL (V1.0.3)

- **8 planètes ajoutées** : Mercure (ID 199), Vénus (ID 299), Terre (ID 399), Mars (ID 499), Jupiter (ID 599), Saturne (ID 699), Uranus (ID 799), Neptune (ID 899)
- **Référentiel** : J2000 pour toutes les positions cartésiennes
- **Unités** : JPL renvoie en UA (Unités Astronomiques) ; conversion ×55 vers unités scène pour visualisation
- **Mise en œuvre** : `JPLProvider.getState()` pour chaque corps planétaire, avec `fetch` vers `https://ssd-api.jpl.nasa.gov/api/horizons.api`
- **Cache** : mémoire Map avec clés pour chaque corps (mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, moon) ; stratégie adaptée au temps simulé
- **Fallback** : si JPL indisponible pour un corps, position reprend le modèle V0.9.4 calculé (getPlanetPosition/ getMoonOffset), garantissant la continuité visuelle
- **Aucun double comptage** : chaque planète utilise ses propres données JPL sans影响其他 cuerpos
- **Hiérarchie Soleil → Terre → Lune** : position Lune = position Terre (JPL) + offset lunaire JPL (géocentrique), position autres planètes indépendantes

L'architecture V1.0.3 confirme que l'intégration JPL peut s'étendre à l'ensemble du système solaire sans casser les hiérarchies existantes ni les systèmes LOCKED.

Après V1.0.3, le prochain objectif est V1.1 — Style / rendu astronomique avancé, avec des améliorations visuelles basées sur les données JPL réelles.

## Infrastructure rendu 3D (V1.1.0)

- **Nouvelle couche** : `src/rendering/` ajoutée entre l'orbital et le rendu Three.js
- **Séparation des responsabilités** :
  - `src/orbital/` : trajectoires, positions, modèles képlériens, JPL provider
  - `src/rendering/` : apparence, meshes, matériaux, textures futures
- **Aucun recalcul d'orbite** dans rendering ; les positions proviennent de `src/orbital/`
- **Usines de meshes** : `createPlanetMesh(data, props)` et `createSunMesh(data)` reçoivent des données déjà calculées
- **Types typés** : `PlanetRenderData`, `SunRenderData`, `PlanetRenderProps`, `SunRenderProps` — indépendants de Three.js au niveau du calcul
- **Hook `usePlanetRendering()`** : normalise position/radius/couleur/corps en `PlanetRenderData`
- **Pas de dépendance Three.js** au niveau des calculs ; les imports Three.js n'interviennent que au moment de la création de mesh effective
- **Performance** : pas de création de mesh/material par frame ; réutilisation des ressources existantes
- **Conservation visuelle** : apparence actuelle intacte ; la layer rendering est opt-in pour d'évolutions futures (V1.1.1+)
- **Hiérarchie** : Soleil → Planètes → Lune reste inchangée ; rendering s'insère comme couche intermédiaire

L'ajout de `src/rendering/` prépare le terrain pour des améliorations visuelles futures (textures V1.1.1, shaders avancés) sans risque de régression sur les calculs orbitaux ou l'interface utilisateur.

## Textures planétaires (V1.1.1)

- **Nouvelle couche** : `src/rendering/textureLoader.ts` avec `useTexture()`, `getMaterialConfig()`, `TEXTURE_PATHS`
- **Types étendus** : `PlanetMaterialProps` avec `map?: THREE.Texture`, `PlanetRenderProps` avec `bodyType`, `SunRenderProps`
- **Usines de mesh** : `createPlanetMesh()` et `createSunMesh()` acceptent désormais `bodyType` pour appliquer textures
- **Chemin des textures** : `TEXTURE_PATHS` définit les chemins d'accès pour chaque corps planétaire (sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune)
- **Mise en cache** : `useTexture()` met en cache les textures chargées pour réutilisation, évite les allocations dans useFrame
- **Configurations materialité** : `getMaterialConfig()` fournit roughness/metalness par type de corps
- **Planet component** : accepte désormais `bodyType?: keyof typeof TEXTURE_PATHS` pour activer les textures
- **Aucune texture fichier requis à V1.1.1** : l'infrastructure est en place ; les fichiers texture seront ajoutés dans une étape ultérieure
- **Aucune régression** : toutes les validations passées (tsc, build, selftest orbital/ephemeris)
- **Hiérarchie préservée** : Soleil → Planètes → Lune inchangée ; textures en surcouche optionnelle

L'infrastructure texture est maintenant prête pour une utilisation future dans V1.2+ avec de vrais fichiers texture et shaders avancés.

## Éclairage + jour/nuit (V1.1.2)

- **Nouvelle fonctionnalité** : éclairage directionnel cohérent avec les positions orbitales
- **Lumière directionnelle** : `createSunLight()` créant un `THREE.DirectionalLight` représentant le Soleil
- **Day/night cycle** : calculé via `isBodyIlluminated()` qui détermine si un corps est éclairé en fonction de la direction du Soleil
- **useSolarLighting()** : hook qui prépare les données d'éclairage pour chaque frame
- **getPlanetMaterialConfig()** : configuration de matériau (rugosité, métallicité) selon le type de corps et son ensoleillement
- **Séparation des responsabilités** : `src/orbital/` fournit les positions, `src/rendering/` fournit l'éclairage
- **Aucun recalcul d'orbite** dans rendering ; les positions proviennent de `src/orbital/`
- **Pas de dépendance Three.js** au niveau des calculs ; les imports Three.js n'interviennent que au moment de la création effective de la lumière
- **Performance** : pas de calcul lourd inutile dans useFrame ; réutilisation des objets Three.js
- **Conservation visuelle** : apparence actuelle enrichie d'un cycle jour/nuit ; pas de nouvelles textures ni shaders complexes
- **Hiérarchie préservée** : Soleil → Planètes → Lune inchangée ; éclairage en surcouche optionnelle

L'infrastructure V1.1.2 prépare le terrain pour V1.1.3 (rotation des corps) et les améliorations visuelles futures.
