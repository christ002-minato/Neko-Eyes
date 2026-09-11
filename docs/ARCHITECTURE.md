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
- **Camera Follow dynamique** : le corps sélectionné est suivi par translation conjointe de la caméra et de `OrbitControls.target` selon son delta de position monde.
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

## Correction du rendu solaire + anneaux Saturne (V1.3.2)

- `src/rendering/textureLoader.ts` applique maintenant `ClampToEdgeWrapping` pour éviter la répétition/étirement sur les sphères texturées.
- `src/App.tsx` garde un Soleil auto-émissif plus lumineux avec halo contrôlé (`meshBasicMaterial` additif) sans masquer les objets proches.
- `src/rendering/lighting.ts` calcule le jour/nuit à partir de la direction du Soleil vers chaque corps, plutôt que sur une direction fixe arbitraire.
- `SaturnRings` dans `src/App.tsx` utilise une géométrie annulaire réelle, semi-transparente, avec bandes texturées et angle de rotation cohérent avec l'axe de Saturne.
- `OrbitControls` reste conservé avec une plage de zoom compatible, sans casser Focus Camera, sélection ni damping.
- Les systèmes verrouillés (`src/orbital/`, JPL, camera, focus, time control, trajectories) restent intacts.

## Correction régressions jour/nuit, zoom, Soleil, anneaux Saturne (V1.3.3)

### Éclairage jour/nuit — `src/rendering/lighting.ts` (restauration V1.1.2 + V1.3.0)

- **Source radiale principale** : `PointLight` au Soleil (`intensity 2.8`, `decay 0`, `distance 0`) → irradiance uniforme sur tous les corps, séparation jour/nuit physiquement correcte (face éclairée tournée vers le Soleil).
- **Fill directionnel** : `DirectionalLight` faible (`intensity 0.04`) positionné loin (`[1000, 1000, 1000]`) ciblant l'origine → direction fixe +X, ne perturbe pas l'ombrage radial.
- **Ambiance** : `AmbientLight` minimale (`0.02`) → face sombre distincte sans être noire pure.
- **Suppression** : calcul erroné de `sunDir` comme moyenne des positions planétaires ; logique `planetIllumination` par corps (remplacée par `true` constant).
- **Matériaux** : `getPlanetMaterialConfig(bodyType)` retourne valeurs fixes par type (roughness/metalness), sans variation jour/nuit — l'ombrage est géré par l'éclairage 3D.

### Soleil — `src/App.tsx` (alignement décision V1.3.2)

- `MeshStandardMaterial` : `color "#000000"`, `emissive "#ffffff"`, `emissiveIntensity 1.15`, `toneMapped false`, `side DoubleSide`, `roughness 0.3`, `metalness 0.1`.
- Texture SDO en `map` (surface) et `emissiveMap` (émission).
- Couronnes (halos additifs) : opacités réduites (`0.12` externe, `0.06` interne) pour subtilité.

### Zoom & Focus Camera — `src/App.tsx`

- `OrbitControls.minDistance = 0.05` (était `0.6`, aligné sur `camera.near = 0.05`).
- `CameraController` :
  - `getBodyVisualRadius(bodyId)` : rayon visuel du corps ciblé via `mapBodySizeToVisual()`.
  - Position cible focus : `distance = bodyRadius * 3.5`, `height = bodyRadius * 2.0` (proportionnel).
  - Post-transition : `controls.minDistance = bodyRadius * 1.05` (surface + marge) ; `maxDistance` étendu.
  - Fermeture focus : reset `minDistance = 0.05`.

### Anneaux de Saturne — `src/App.tsx` (`SaturnRings`)

- Orientation corrigée : groupe rotation `rotation={[axialTilt, 0, 0]}` (axe X) au lieu de `[0, axialTilt, 0]` (axe Y).
- Anneaux maintenant dans le plan équatorial incliné de 26.73° par rapport au plan orbital (XZ), cohérent avec l'axe de rotation de Saturne.

### Lune

- `useAstroModel("moon")` charge texture LROC WAC (`/textures/moon.jpg`) via `modelLoader.ts`.
- Matériau : `color "#ffffff"` quand texture présente → couleurs naturelles.

### Non-régression

Tous les systèmes LOCKED préservés : orbital V0.9.4, JPL V1.0.3, visualScale V1.2.0, trajectoires V1.3.1, CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, damping, navigation, temps passé/futur, vitesses 0.1x/1x/5x/10x, responsive.

## Correction ciblée Lune + Soleil (V1.3.4)

### Lune — Texture réelle LROC WAC

**Diagnostic complet du chemin texture :**
1. `bodyType "moon"` → `ASTRO_MODEL_REGISTRY.moon` dans `modelRegistry.ts`
2. `textureFile: "/textures/moon.jpg"` → fichier JPEG 2048×1024 (457 KB), LROC WAC color map
3. `useAstroModel("moon")` → `loadAstroAsset()` → `loadTextureFile("/textures/moon.jpg")`
4. `THREE.TextureLoader` : `ClampToEdgeWrapping`, `repeat.set(1,1)`, `generateMipmaps=true`, `anisotropy=8`
5. Composant `Planet` (Terre) : rendu inline Lune dans JSX
   - `const { texture: moonTexture } = useAstroModel("moon")`
   - `<meshStandardMaterial color={moonTexture ? "#ffffff" : moonData.color} map={moonTexture} ... />`
6. Mesh unique : `sphereGeometry` (16, 16) + `meshStandardMaterial` — aucune couche dupliquée, aucune sphère colorée sous-jacente

**Résultat** : Texture LROC WAC correctement projetée sur sphère, UV équirectangulaire, visible à tous niveaux de zoom.

### Soleil — Texture SDO 2048×2048 + forte émission lumineuse

**Diagnostic complet :**
1. **Problème texture** : `modelRegistry.ts` pointait vers `sun.webp` (859×429, placeholder) au lieu de `sun.jpg` (2048×2048, SDO AIA composite)
2. **Problème luminosité** : `emissiveIntensity: 1.15` insuffisante ; halos trop subtils (opacités 0.12/0.06)

**Corrections appliquées :**
1. `modelRegistry.ts` : `sun.textureFile = "/textures/sun.jpg"` (asset SDO réel)
2. `src/App.tsx` composant `Sun` — matériau `createSunMesh()` :
   - `emissive: "#fff8e7"` (blanc chaud), `emissiveIntensity: 2.5`, `emissiveMap: sunTexture`
   - `map: sunTexture` (surface texturée), `toneMapped: false`, `side: THREE.DoubleSide`
3. Halos/glow additifs renforcés (3 couches concentriques) :
   - Échelle 1.15 : `#ffcc00`, opacity 0.18
   - Échelle 1.08 : `#fff2cc`, opacity 0.12
   - Échelle 1.03 : `#fff8e7`, opacity 0.08
   - Tous : `AdditiveBlending`, `depthWrite=false`, `BackSide` — luminosité locale, pas d'exposition globale
4. `PointLight` (intensity 2.8, decay 0) inchangé — source lumineuse planètes préservée

**Résultat** : Soleil affiche texture SDO correctement projetée (pas de stretch grâce à `ClampToEdgeWrapping`), forte émission blanche/jaune-blanche, halos lumineux contrôlés, surface détaillée préservée. Visible en zoom rapproché et éloigné. Jour/nuit planètes inchangé.

### Non-régression

Tous systèmes LOCKED préservés : orbital V0.9.4, JPL V1.0.3, visualScale V1.2.0, trajectoires V1.3.1, éclairage jour/nuit V1.3.3, CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, damping, navigation, temps passé/futur, vitesses 0.1x/1x/5x/10x, responsive, Saturne/anneaux, étoiles.

## Visual Scale / Scene Mapping + Rendu spatial réaliste (V1.2.0)

### Visual Scale — `src/rendering/visualScale.ts`

Nouveau module centralisant la conversion entre données astronomiques (orbitales/JPL) et unités scène Three.js.

**Responsabilités :**
- Facteur d'échelle visuelle configurable et centralisé (pas dispersé dans App.tsx)
- Séparation stricte : tailles des corps (`bodySizeScale`) ≠ distances orbitales (`distanceScale`, `earthMoonDistanceScale`)
- Indépendant des calculs orbitaux et données JPL — aucune modification de `src/orbital/`

**Configuration par défaut :**
```typescript
const DEFAULT_VISUAL_SCALE: VisualScaleConfig = {
  distanceScale: 3.5,           // Soleil → planètes ×3.5
  earthMoonDistanceScale: 6.0,  // Terre → Lune ×6.0 (Lune détachée)
  bodySizeScale: 1.0,           // Tailles conservées
  minVisualDistance: 0.5,       // Garde-fou collision visuelle
}
```

**API :**
- `mapOrbitalDistanceToVisual(orbitalDistance, isEarthMoonDistance?)` — distance orbitale → visuelle
- `mapBodySizeToVisual(orbitalRadius)` — rayon corps → visuel
- `mapOrbitalPositionToVisual(orbitalPosition, isEarthMoonOffset?)` — Vec3 orbitale → visuelle
- `computeVisualScales(definitions)` — calcul groupé pour initialisation
- `getVisualScale()`, `setVisualScale()`, `resetVisualScale()` — configuration runtime

**Intégration :** `getPlanetPosition()`, `getMoonOffset()`, `Planet`, `Sun`, `OrbitRings`, `CameraController`, `OrbitControls`, `fog`, `pointLight` — tous utilisent le visual scaling.

### Textures planétaires — `src/rendering/textureLoader.ts`

Infrastructure de chargement performante :
- `preloadAllTextures()` au démarrage — 10 corps (sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune)
- Cache `Map<BodyType, THREE.Texture>` — réutilisation, pas d'allocation useFrame
- Fallback placeholder coloré si fichier manquant — pas d'erreur bloquante
- `getMaterialConfig(BodyType)` — roughness/metalness par type de corps
- `TEXTURE_PATHS` — mapping déclaratif chemins textures

### Matériaux & Éclairage — Intégration V1.1.2

- `Planet` component : props `bodyType?: BodyType`, `illuminated?: boolean`, `moonIlluminated?: boolean`
- `Sun` component : migration shader procédural → `meshStandardMaterial` + texture + `emissive`/`emissiveIntensity`
- `useSolarLighting()` dans `SolarSystemScene` → `DirectionalLight` + `planetIllumination` (calculé chaque frame)
- `getPlanetMaterialConfig(bodyType, isIlluminated)` → roughness/metalness dynamiques selon jour/nuit
- Day/night cycle préservé et compatible textures

### Architecture respectée

```
JPL / Orbital (src/orbital/, src/orbital/ephemeris/)
       ↓
position astronomique réelle (inchangée)
       ↓
Visual Scale / Scene Mapping (src/rendering/visualScale.ts)
       ↓
Rendering 3D (src/rendering/ : textures, matériaux, éclairage)
       ↓
Three.js (scene, meshes, lights)
```

**Contraintes respectées :**
- Aucune modification données JPL, `JPLProvider`, `EphemerisProvider`, `getBodyPosition()`, calculs orbitaux V0.9.4
- Aucun recalcul position astronomique dans rendering
- Aucun système LOCKED modifié (CameraController, OrbitControls, TimeControlBar, Focus Camera, sélection, zoom, navigation)
- Performance : zéro allocation useFrame, zéro réseau useFrame, textures chargées au démarrage
- Extensibilité : architecture prête pour anneaux Saturne (bodyType + ring geometry séparée)

### Design

**ACTIVE / évolutif** — le visual scaling et les textures transforment l'apparence géométrique en rendu astronomique crédible sans casser l'existant. Le Soleil a un rendu lumineux distinct (emissive), les planètes conservent leurs différences visuelles via textures propres.

## Audit et corrections rendering — 2026-08-26

Le code réel utilise désormais `defineOrbitalSystem()` puis `getBodyPosition()` pour les positions de secours. Les données JPL restent des overrides fournis par `useEffect`, et `src/rendering/` ne calcule aucune orbite.

`createPlanetMesh()` et `createSunMesh()` sont les factories de présentation; `Sun` utilise effectivement `createSunMesh()`. Le jour/nuit réel est produit par une `PointLight` au Soleil, car une seule `DirectionalLight` ne peut pas représenter une source radiale pour toutes les planètes. Une `DirectionalLight` de faible intensité est conservée comme fill.

La rotation propre est indépendante de l’orbite: `getRotationAngle(simTime, rotationPeriod)` vit dans `src/rendering/rotation.ts`. Elle remplace l’ancienne rotation basée sur `delta`, qui continuait pendant la pause.

## Améliorations de rendu V1.3.0 (trajectoires, fond, jour/nuit, sélection)

Ajout au-dessus de l'architecture existante, sans modification de `src/orbital/` ni du système JPL.

### Trajectoires — `src/rendering/trajectory.ts`

- Couleurs de trajectoire centralisées : `TRAJECTORY_COLORS` (une couleur par corps) + `getTrajectoryColor(bodyId)`.
- `OrbitRings` (anneaux planétaires) et l'anneau orbital lunaire utilisent `getTrajectoryColor()` au lieu d'une couleur unique codée en dur.
- C'est une configuration purement visuelle, réutilisable, indépendante des calculs orbitaux.

### Fond

- Fond (`<color attach="background">`) et `fog` : `#000000`.
- Étoiles 3D : `pointsMaterial` avec `fog={false}` pour rester lisibles sur fond noir.

### Éclairage jour/nuit — `src/rendering/lighting.ts`

- `createSunLight()` : `PointLight` au Soleil (`intensity 2.8`, `decay 0`) → pas d'atténuation en distance, irradiance uniforme → face éclairée nettement distincte de la face sombre sur tous les corps.
- `DirectionalLight` : fill négligeable (0.04). `ambientIntensity` : 0.02.
- La géométrie radiale de la `PointLight` produit une séparation jour/nuit physiquement orientée vers le Soleil quel que soit l'orbite.

### Sélection — overlay subtil (dans `src/App.tsx`)

- Suppression de l'`emissive`/`emissiveIntensity` de sélection sur les matériaux de planète et de Lune (provoquait une uniformisation lumineuse et écrasait l'ombre).
- Surlignage de sélection remplacé par un halo `meshBasicMaterial` `BackSide` additif fin, `depthWrite=false`, autour du corps (planètes, Lune, Soleil).
- La texture, le relief et la partie sombre du corps sélectionné sont préservés. La logique de sélection et Focus Camera est inchangée.

## Rendu des trajectoires et champ d'étoiles V1.3.1

Ajouté au-dessus de l'architecture existante, sans modification de `src/orbital/`, du système JPL, des textures ni du jour/nuit.

### Trajectoires orbitales — `src/rendering/orbitTrajectory.ts`

- Trajectoires dessinées avec `Line2` + `LineMaterial` (three.js fourni via `three/examples/jsm/lines/`, aucune dépendance externe).
- Cercle construit dans le plan XZ (cos → x, sin → z), `segments` paramétrable (768 par défaut).
- `worldUnits = false` : épaisseur en pixels d'écran → lisibilité constante à tous les niveaux de zoom (notamment très éloignés) ; `LineMaterial.onBeforeRender` gère automatiquement la résolution écran.
- Géométrie et matériau créés une seule fois (via `useMemo`) puis disposés à l'unmount (`disposeOrbitTrajectory`) — aucune allocation dans `useFrame`.
- `trajectory.ts` enrichi : `TrajectoryVisualConfig` (couleur, `lineWidth`, `opacité`, `brightness`) et `getTrajectoryConfig(bodyId)` — configuration purement visuelle, une couleur par corps conservée sélectionné ou non.

### Intégration composant — `src/App.tsx`

- `OrbitalTrajectory({ radius, bodyId })` : crée/attache la ligne via `<primitive object={line} />`.
- `OrbitRings` rend les 8 planètes avec `OrbitalTrajectory` (remplace `ringGeometry`).
- L'anneau orbital lunaire (dans le composant Terre) utilise `OrbitalTrajectory` avec `bodyId="moon"` → couleur distincte de la Terre.

### Champ d'étoiles — `StarField3D` (`src/App.tsx`)

- Ajout d'un attribut de couleur par point (`Float32Array`, `vertexColors`) avec palette : blanc (dominant), bleu très léger, cyan discret, jaune/orange très léger.
- Distribution aléatoire et naturelle conservée (sphères de rayon 300–800).
- Tailles (0.15–1.05) et opacité (0.8) réduites pour ne pas dépasser les planètes ni les trajectoires.
- Fond conservé `#000000`, étoiles non affectées par le fog (`fog={false}`).

## Couche `src/rendering/models/` — Assets 3D réels (NASA / JPL / USGS)

Sépare clairement la donnée astronomique du rendu des corps, sans mélanger données orbitales
(`src/orbital`), données JPL (`src/orbital/ephemeris`), logique caméra (`CameraController` /
`OrbitControls`) et rendu.

### Composants
- `modelRegistry.ts` — **source unique de vérité** associant chaque `BodyType`
  (sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune) à son asset réel :
  source, URL, licence, format, textures, échelle/orientation (GLB), `fallback`.
- `modelLoader.ts` — chargeur unique et mis en cache (Map de Promises) :
  - `assetType: "texture"` → `THREE.TextureLoader` (carte équirectangulaire réelle).
  - `assetType: "gltf"` → `GLTFLoader` + `DRACOLoader` (chargés paresseusement via `import()`
    dynamique afin de ne pas alourdir le bundle principal). Applique `scale`/`orientation`.
  - En cas d'échec, la Promise rejette ; le composant retombe sur le rendu de secours (sphère colorée).
- `useAstroModel.ts` — hook React : charge l'asset une fois au montage, expose `texture` /
  `object` / `status`. Aucun chargement dans `useFrame`.
- `types.ts`, `index.ts` — types et ré-exports.

### Contrats de performance
- Chargement unique par asset, réutilisé (cache).
- Aucun `fetch` réseau dans la boucle de rendu.
- Aucune création répétée de géométrie/matériau.
- Décodeur DRACO en chunk différé (uniquement si un GLB compressé est chargé).

### Intégration
`src/App.tsx` (composants `Sun` et `Planet`) utilise `useAstroModel(bodyId)` à la place de l'ancien
`loadTexture`. Le Soleil est rendu **auto-émissif** (`emissiveMap` = texture SDO, `emissive` blanc,
`emissiveIntensity` 1.15, `color` noir, `toneMapped` false) et donc **indépendant de l'éclairage des
planètes** ; son `THREE.PointLight` reste la source lumineuse des planètes (inchangé). Saturne utilise
désormais `SaturnRings` (plusieurs `RingGeometry` concentriques bandées, orientées plan équatorial,
éclairées par la scène) plutôt que l'ancien anneau plat unique non éclairé. Les planètes/Lune utilisent
un `color` blanc neutre quand la vraie texture est présente (couleurs naturelles, non saturées).

## Temps astronomique réel + Jour/Nuit réaliste (V1.4.0)

### Module `src/rendering/astronomicalTime.ts`

Nouveau module utilitaire pour les calculs de temps astronomique, indépendant de Three.js/React.

**Responsabilités :**
- Conversion temps simulé (`simTime`, heures depuis époque) ↔ date UTC, date julienne
- Calcul GMST (Greenwich Mean Sidereal Time)
- Position du Soleil : longitude écliptique, déclinaison, ascension droite
- Point subsolaire (latitude/longitude sur Terre où le Soleil est au zénith)
- Angle de rotation initial de la Terre à l'époque pour cohérence jour/nuit
- Formatage dates/heures pour l'affichage UI

**API :**
- `simulationTimeToUTC(simTime)` → `Date`
- `simulationTimeToJulianDate(simTime)` → `number`
- `calculateGMST(julianDate)` → `number` (radians)
- `calculateSunDeclinationRightAscension(julianDate)` → `{ dec, ra }`
- `calculateSubsolarPoint(simTime, earthPosition)` → `{ latitude, longitude } | null`
- `calculateInitialEarthRotationAngle(earthPositionAtEpoch)` → `number` (radians)
- `getAstronomicalTime(simTime, earthPosition)` → objet complet
- `formatUTCDate(date)`, `formatSimulationTime(simTime)` → strings
- `getBodyOrbitalElements(bodyId)` → éléments orbitaux de référence

**Contraintes respectées :**
- Aucune dépendance Three.js/React
- Aucun fetch réseau
- Calculs purs, déterministes, réutilisables
- Époque de référence : 2025-08-19 00:00:00 UTC (simTime = 0)

### Jour/Nuit réaliste — `src/rendering/lighting.ts` (mise à jour)

**`createSunLight(sunPosition, earthPosition)` :**
- Calcule `daylightDirection` = vecteur normalisé Soleil → Terre (`earthPosition - sunPosition`)
- Remplace l'ancienne direction fixe `(-1, 0, 0)`
- La direction est recalculée chaque frame via `useSolarLighting()` avec les positions planétaires actuelles

**`useSolarLighting(sunPosition, planetPositions)` :**
- Extrait `earthPosition = planetPositions.earth`
- Appelle `createSunLight()` avec la position Terre réelle
- Retourne `sunDirection` pour le panneau d'informations
- `planetIllumination` calculé via `isBodyIlluminated()` pour chaque corps

**Résultat :** La frontière jour/nuit se déplace progressivement sur la Terre (et tous les corps) lorsque le temps avance, cohérente avec la position astronomique réelle du Soleil.

### Rotation terrestre cohérente

**Angle initial (`calculateInitialEarthRotationAngle`) :**
- Calcule l'angle de rotation initial à simTime=0 pour que le point subsolaire réel fasse face au Soleil
- Utilise la position Terre à l'époque + GMST + ascension droite du Soleil
- Aligne la rotation visuelle sur la réalité astronomique

**Composant `Planet` (Terre) :**
- Reçoit `initialRotationAngle={earthInitialRotationAngle}` via props
- `getRotationAngle(time, 23.934, initialRotationAngle)` → rotation pilotée par `simTime`
- Fonctionne avec toutes les vitesses (0.1x/1x/5x/10x), pause, passé/futur

### Panneau "Plus d'informations" — `ObjectInfoPanel` (mise à jour)

**Nouvelles données affichées (toggle "More Info") :**
- Diamètre, périodes orbitale/rotation, excentricité, inclinaison
- Position actuelle (X, Y, Z), vitesse orbitale estimée
- Date/heure UTC simulée, temps de simulation
- Statut JPL : "Active" ou "Fallback (orbital model)"
- **Terre spécifique** : point subsolaire (lat/lon), direction Soleil, heure simulée

**Architecture :**
- Calculs astronomiques via `useMemo` dans `ExplorerSection` (partagés avec `SolarSystemScene`)
- Pas de duplication : `planetPositions`, `sunDirection`, `subsolarPoint` calculés une fois par frame
- Transmis aux composants UI via props

### TimeControlBar (mise à jour)

- Affiche la date/heure UTC simulée (ex: "2025-08-19 15:26:00 UTC") au lieu de l'époque fixe
- Met à jour en temps réel avec `simTime`
- Distinction claire : temps de simulation vs date astronomique vs vitesse

### Performance

- `useMemo` pour tous les calculs astronomiques (réexécution seulement si `simTime` ou positions JPL changent)
- Aucun calcul lourd dans `useFrame`
- Réutilisation des vecteurs Three.js (`sunDirection` calculé une fois par frame)
- Pas de fetch réseau dans la boucle de rendu

### Non-régression

Tous systèmes LOCKED préservés : orbital V0.9.4, JPL V1.0.3, visualScale V1.2.0, textures V1.1.1, Soleil V1.3.4, Lune, Saturne/anneaux V1.3.2, trajectoires V1.3.1, étoiles V1.3.1, CameraController, OrbitControls, Focus Camera, zoom, damping, sélection, TimeControlBar, responsive.

## V1.4.1 — Stabilisation avant le style

### Rotation astronomique (lisse et déterministe)

- **Formule** (inchangée, `src/rendering/rotation.ts`) :
  `angle = initialAngle + (simulationTime / rotationPeriod) × 2π`
  — unités : `simulationTime` en heures simulées, `rotationPeriod` en heures (valeurs
  astronomiques réelles, négatives = rétrograde). Aucune intégration cumulative.
- **Correction du flux temps → composants** : auparavant, `Sun`/`Planet` (et la Lune)
  appliquaient la rotation dans `useFrame` avec la prop `time` figée au dernier rendu React
  (un rendu toutes les 6 frames via `onTimeUpdate`). La rotation sautait par paliers.
- **Désormais** : les composants reçoivent le ref vivant `timeRef` et lisent `timeRef.current`
  dans `useFrame`. La rotation reste une fonction pure de `simulationTime`, mais suit le temps
  à la frame près. Pause = aucune évolution ; passé/futur = recomposition exacte ;
  0.1x/1x/5x/10x = accélération du temps simulé seulement.
- **Périodes en vigueur** (heures simulées) : Soleil 609,12 · Mercure 1407,6 ·
  Vénus −5832,5 (rétrograde) · Terre 23,934 (jour sidéral) · Mars 24,623 · Jupiter 9,925 ·
  Saturne 10,656 · Lune 655,72 (rotation synchrone/verrouillage de marée).
- **Angle initial Terre** : `calculateInitialEarthRotationAngle()` aligne le point subsolaire
  astronomique (GMST + RA + déclinaison) vers le Soleil à l'époque ; la rotation ultérieure
  conserve cet alignement (2π par jour sidéral).

### Jour/nuit

- Lumière : `PointLight` au Soleil (intensité 2,8, decay 0) source radiale ; `ambientLight` 0,02 ;
  `DirectionalLight` 0,04 en fill. Le GPU produit jour → crépuscule → nuit via les normales du
  globe (aucune zone peinte sur la texture).
- La direction Soleil→Terre est recalculée depuis les positions (JPL ou fallback orbital)
  et la rotation du globe tourne sous la lumière → le terminateur se déplace naturellement
  avec l'heure simulée.

## V1.5.0 — Temps réel, horloge locale, epoch dynamique

### Modèle temporel (cause racine corrigée)

- **Ancienne relation (défaut 3600×)** :
  `simTime += delta_réel_s × speed` (delta en secondes réelles),
  `simulationTimeToUTC(simTime)` = `epoch + simTime × 3600000` ms (simTime en heures).
  À ×1 : 1 seconde réelle = 1 heure simulée → la Terre tournait en ~24 s réelles.
- **Nouvelle relation** :
  `simTime += (delta_réel_s × speed) / 3600`
  → à ×1 : 1 seconde réelle = 1/3600 h = 1 seconde simulée (temps réel).
  Les formules restent en heures : rotation, orbital, JPL — aucune conversion heure↔seconde.

### Epoch dynamique (`src/time.ts`)

- Module partagé capturant `Date.now()` une seule fois au chargement (`SIMULATION_EPOCH_MS`).
- Importé par `astronomicalTime.ts` et `jplProvider.ts` — source unique de vérité.
- L'ancien epoch fixe `2025-08-19` est remplacé ; à ×1, l'horloge affiche l'heure locale réelle.

### Affichage local + UTC

- TimeControlBar : horloge locale (`toLocaleString()`) principale, UTC secondaire.
- ObjectInfoPanel : Local Time et UTC affichés séparément.

### Throttling JPL

- `useEffect` JPL dépendent de `[jplDayId]` (`simulationTimeToDayId(simTime)`) au lieu de `[simTime]`.
- Un fetch par jour simulé (pas par frame). Pas de fetch réseau dans la boucle de rendu.

### Bouton « More Info » (Voir plus)

- Anciennement codé en dur : `isDetailOpen={false}`, `onDetailToggle={() => {}}`.
- Désormais `ExplorerSection` possède l'état `isDetailOpen` ; le toggle l'inverse et il est
  réinitialisé à chaque changement de corps sélectionné (`handleSelectPlanet`).

### Lune — texture réelle

- Mesh unique : sphère 16×16 dans le composant `Planet` (branche Terre). Aucun doublon.
- Chemin texture : `modelRegistry.ts` (`/textures/moon.jpg`, LROC WAC 2048×1024) →
  `modelLoader.ts` (sRGB, ClampToEdge, mipmaps) → `useAstroModel("moon")` → `map` du
  `meshStandardMaterial` (`color="#ffffff"` quand texture présente).
- UV : équirectangulaires standards de `SphereGeometry` ; la rotation est appliquée au groupe
  parent, les UV ne sont pas altérés.

### Nouvelles responsabilités

- `src/rendering/rotationSelftest.ts` — selftest (15 tests) de la rotation déterministe,
  exécutable via `npx jiti src/rendering/rotationSelftest.ts`.
- `App.tsx` — passage de `timeRef` aux composants `Sun`/`Planet` ; état `isDetailOpen` ;
  `handleSelectPlanet` centralise la sélection (reset du détail).
