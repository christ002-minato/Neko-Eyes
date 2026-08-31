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
## D17 — Connexion JPL Horizons V1.0.1

- **Décision** : intégration de l'API JPL Horizons via `JPLProvider` dans `src/orbital/ephemeris/`, sans modifier les systèmes LOCKED.
- **Raison** : remplacer les données codéesen dur (D10) par des données astronomiques réelles, progression progressive validée par tests et comparaison modèle/JPL.
- **Statut** : active (V1.0.1).
- **Dépendance** : aucune nouvelle dépendance externe ; utilisation du `fetch` natif du navigateur.

## D18 — Unités et conversion V1.0.1

- **Décision** : conversion JPL AU → unités scène via facteur 55 (mise à l'échelle visuelle de l'orbite Earth radius=55).
- **Raison** : les données JPL sont en UA (Unités Astronomiques) ; le modèle scène utilise des unités visuelles calibrées.
- **Statut** : active (V1.0.1).
- **Précision** : facteur de conversion硬编码 mais documenté ; pourrait être rendu configurable à terme.

## D19 — Comparaison modèle/JPL V1.0.1

- **Décision** : mécanisme propre de comparaison position calculée V0.9.4 vs position JPL, activable via état `jplEarthPosition` dans `ExplorerSection`, désactivé par défaut.
- **Raison** : permettre validation des données JPL sans casser le modèle existant ; l'utilisateur peut comparer les deux positions avant tout changement.
- **Statut** : active (V1.0.1).
- **Mise en œuvre** : état `jplEarthPosition` passé de `ExplorerSection` → `SolarSystemScene` → `Planet` (en option pour Earth uniquement).

## D20 — Connexion Lune JPL V1.0.2

- **Décision** : intégration de la Lune via JPL Horizons (ID 301) en utilisant le système géocentrique (position relative à la Terre).
- **Raison** : la position JPL de la Lune est déjà relative à la Terre, ce qui évite tout double comptage du mouvement orbital Terre → Lune. La hiérarchie Terre → Lune est préservée de manière naturelle.
- **Statut** : active (V1.0.2).
- **Dépendance** : aucune nouvelle dépendance ; utilisation du `fetch` natif et du cache existant.

## D21 — Hiérarchie Terre → Lune V1.0.2

- **Décision** : la position de la Lune dans la scène = position Terre (issue JPL) + offset lunaire (issue JPL, déjà géocentrique).
- **Raison** : maintenir la hiérarchie Soleil → Terre → Lune vue en V0.9.4 tout en utilisant les données JPL réelles. La position JPL de la Lune étant géocentrique, elle s'ajoute naturellement à la position Terre sans double comptage.
- **Statut** : active (V1.0.2).
- **Mise en œuvre** : `positionOverride={jplMoonPosition}` passé au composant `Planet` lorsque `p.id === 'moon'` et qu'un planet a été sélectionné.

## D22 — Intégration complète JPL V1.0.3

- **Décision** : extension de l'infrastructure JPL à l'ensemble des 8 planètes du système solaire, en utilisant les IDs JPL/Horizons officiels.
- **Raison** : offrir aux utilisateurs des positions planétaires précises basées sur les données astronomiques réelles de NASA/JPL, tout en maintenant la compatibilité descendante avec le modèle V0.9.4.
- **Statut** : active (V1.0.3).
- **Dépendance** : aucune nouvelle dépendance ; utilisation du `fetch` natif et du cache existant.

## D23 — Comparaison modèle/JPL complet V1.0.3

- **Décision** : mécanisme de comparaison V0.9.4 vs JPL appliqué à chaque planète avant validation finale. Chaque planète est évaluée indépendamment.
- **Raison** : permettre à l'utilisateur de visualiser l'écart entre l'orbite képlérienne simplifiée et les données astronomiques réelles, sans imposer de changement de rendu.
- **Statut** : active (V1.0.3).
- **Mise en œuvre** : affichage parallèle des positions calculées JPL et modèle V0.9.4 pour chaque planète sélectionnée ou visible.

## D24 — Stratégie de fallback V1.0.3

- **Décision** : mode dégradé automatique vers les positions V0.9.4 si l'API JPL est indisponible pour un corps donné. Aucune interruption du rendu.
- **Raison** : garantir une expérience utilisateur fluide en toutes circonstances, même en l'absence de connexion réseau ou de disponibilité de l'API JPL.
- **Statut** : active (V1.0.3).
- **Mise en œuvre** : vérification de la réponse HTTP ; si !response.ok, position reprise par le modèle képlérien simplifié.

## D25 — Couche rendering V1.1.0

- **Décision** : création d'une couche `src/rendering/` séparant l'apparence 3D des calculs orbitaux dans `src/orbital/`.
- **Raison** : permettre des évolutions du rendu (textures, shaders) sans risque de régression sur les modèles scientifiques validés (V0.9.4, JPL). Le rendering devient opt-in pour les nouvelles fonctionnalités.
- **Portée** : aucune modification de `src/orbital/`, pas de nouveaux calculs orbitaux, pas de nouvelles dépendances critiques. Seules des abstractions de présentation sont ajoutées.
- **Statut** : active (V1.1.0).

## D26 — Conservation visuelle V1.1.0

- **Décision** : l'apparence actuelle de Neko Eyes est préservée à V1.1.0. Aucun nouvelle texture, bloom, atmosphère, shader complexe, nouveau background ou système lumière réaliste n'est ajouté à cette étape.
- **Raison** : maintenir la stabilité et la compatibilité descendante. Les améliorations visuelles sont reportées à V1.1.1 (textures) et V1.2+ (shaders avancés).
- **Statut** : active (V1.1.0).
- **Contraintes** : aucun modificateur de CameraController, OrbitControls, TimeControlBar, système temporel, vitesses, pause, sélection, Focus Camera, zoom, responsive, logique de navigation.

## D27 — Couche rendering sans dépendance orbitale V1.1.0

- **Décision** : la couche `src/rendering/` ne contient aucun code de calcul orbital. Toutes les positions doivent être fournies en entrée par `src/orbital/`. Cela garantit que tout changement auxorbites n'affecte que `src/orbital/`, et non le rendering.
- **Raison** : séparation des responsabilités stricte et prévention des bugs de régression où des changements orbitaux casseraient silencieusement le rendu ou inversement.
- **Statut** : active (V1.1.0).

## D28 — Infrastructure textures V1.1.1

- **Décision** : création d'une infrastructure de texturesplanétaires dans `src/rendering/` sans modifier les systèmes scientifiques verrouisés.
- **Raison** : préparer le terrain pour des améliorations visuelles futures (V1.2+) tout en maintenant la stabilité et la compatibilité descendante de V1.1.0.
- **Portée** : aucune modification de `src/orbital/`, pas de nouveaux calculs orbitaux, pas de nouvelles dépendances critiques. Seules des abstractions de présentation et de chargement de textures sont ajoutées.
- **Statut** : active (V1.1.1).

## D29 — Planet component étendu V1.1.1

- **Décision** : le composant `Planet` accepte une prop `bodyType?: keyof typeof TEXTURE_PATHS` pour activer les textures de manière optionnelle.
- **Raison** : permettre l'activation des textures sans modifier le comportement par défaut ; la prop est optionnelle et n'affecte pas le rendu si non fournie.
- **Statut** : active (V1.1.1).
- **Mise en œuvre** : `bodyType?: keyof typeof TEXTURE_PATHS` ajouté à la signature de `Planet` ; le material `meshStandardMaterial` utilise le prop `map` conditionnel à partir de `useTexture()`.

## D30 — Couleur et materialité par type de corps V1.1.1

- **Décision** : `getMaterialConfig(bodyType)` fournit des valeurs de rugosité (roughness) et de métallicité (metalness) adaptées à chaque type de corpsplanétaire.
- **Raison** : assurer une apparence cohérente et réaliste lors de l'activation des textures ; chaque type de corps a des propriétés visuelles distinctes.
- **Statut** : active (V1.1.1).
- **Valeurs prédéfinies** : terre (rugosité 0.5, métallicité 0.1), lune (0.8, 0.0), soleil (0.3, 0.1), jupiter (0.6, 0.2), saturne (0.7, 0.1), uranus (0.5, 0.0), neptune (0.5, 0.0), mercure (0.8, 0.1), vénus (0.5, 0.0).

## D31 — Éclairage directionnel V1.1.2

- **Décision** : ajout d'une lumière directionnelle `THREE.DirectionalLight` représentant le Soleil, avec day/night cycle computation.
- **Raison** : offrir un éclairage astronomique cohérent avec les positions orbitales JPL, sans modifier le modèle orbital ni les données JPL.
- **Statut** : active (V1.1.2).
- **Implémentation** : `createSunLight()`, `isBodyIlluminated()`, `useSolarLighting()`, `getPlanetMaterialConfig()`.

## D32 — Day/night cycle V1.1.2

- **Décision** : cycle jour/nuit déterminé par la position du Soleil par rapport à chaque corpsplanétaire, sans mécanisme de rotation physique (réservé à V1.1.3).
- **Raison** : permettre une visualisation jour/nuit réaliste basée sur les positions orbitales existantes, sans complexifier le modèle de rotation pour cette étape.
- **Statut** : active (V1.1.2).
- **Mise en œuvre** : `isBodyIlluminated()` vérifie si le produit scalaire du vecteur corps‑Soleil est positif.

## D33 — Matériau compatible éclairage V1.1.2

- **Décision** : `getPlanetMaterialConfig()` fournit des valeurs de rugosité (roughness) et de métallicité (metalness) adaptées à chaque type de corpsplanétaire lorsqu'il est éclairé ou dans l'ombre.
- **Raison** : assurer une apparence cohérente et réaliste lors de l'activation de l'éclairage, sans modifier les propriétés matérielles de base.
- **Statut** : active (V1.1.2).
- **Valeurs prédéfinies** : terre (0.5/0.1 éclairé, 0.9/0.0 ombre), lune (0.8/0.0), mars (0.8/0.0), jupiter (0.6/0.2), saturne (0.7/0.1).

## D34 — Visual Scale / Scene Mapping centralisé V1.2.0

- **Décision** : création d'un module `src/rendering/visualScale.ts` centralisant la conversion données astronomiques → unités scène Three.js, avec facteurs configurables (`distanceScale`, `earthMoonDistanceScale`, `bodySizeScale`, `minVisualDistance`).
- **Raison** : corriger l'échelle visuelle (distances trop faibles, Lune collée à la Terre) sans toucher aux données JPL ni calculs orbitaux. Séparation tailles ≠ distances. Facteur unique source de vérité.
- **Statut** : active (V1.2.0).
- **Configuration par défaut** : `distanceScale: 3.5`, `earthMoonDistanceScale: 6.0`, `bodySizeScale: 1.0`, `minVisualDistance: 0.5`.
- **Mise en œuvre** : fonctions pures `mapOrbitalDistanceToVisual()`, `mapBodySizeToVisual()`, `mapOrbitalPositionToVisual()`, `computeVisualScales()` ; API runtime `getVisualScale()`, `setVisualScale()`, `resetVisualScale()`.
- **Intégration** : `getPlanetPosition()`, `getMoonOffset()`, `Planet`, `Sun`, `OrbitRings`, `CameraController`, `OrbitControls`, `fog`, `pointLight` — tous visual-scaled.
- **Contraintes** : aucune modification `src/orbital/`, `JPLProvider`, `getBodyPosition()`, modèles orbitaux V0.9.4.

## D35 — Textures planétaires performantes V1.2.0

- **Décision** : infrastructure `src/rendering/textureLoader.ts` avec `preloadAllTextures()` au démarrage, cache `Map<BodyType, THREE.Texture>`, fallback placeholder, zéro allocation useFrame, zéro réseau useFrame.
- **Raison** : rendu astronomique crédible (STYLE 2) avec performance garantie. 10 corps : sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune.
- **Statut** : active (V1.2.0).
- **Mise en œuvre** : `loadTexture()`, `getTexture()`, `hasTexture()`, `preloadAllTextures()`, `getMaterialConfig()`, `TEXTURE_PATHS`, `clearTextureCache()`.
- **Fallback** : placeholder CanvasTexture coloré si fichier texture absent — pas d'erreur bloquante, rendu fonctionnel.

## D36 — Sun rendering distinct V1.2.0

- **Décision** : migration Soleil depuis shader GLSL procédural (D11) vers `meshStandardMaterial` + texture + `emissive`/`emissiveIntensity`, conservant corona glow.
- **Raison** : rendu lumineux distinct des planètes, cohérent avec architecture textures + éclairage V1.1.2. Shader procédural remplacé par texture + emission pour simplicité et performance.
- **Statut** : active (V1.2.0).
- **Mise en œuvre** : composant `Sun` utilise `meshStandardMaterial` avec `map={sunTexture}`, `emissive="#ffd700"`, `emissiveIntensity=0.3`, `roughness=0.3`, `metalness=0.1`.

## D37 — Éclairage V1.1.2 intégré aux textures V1.2.0

- **Décision** : `useSolarLighting()` appelé chaque frame dans `SolarSystemScene` → `DirectionalLight` + `planetIllumination` → passé aux `Planet` via prop `illuminated` → `getPlanetMaterialConfig(bodyType, illuminated)` pour roughness/metalness dynamiques jour/nuit.
- **Raison** : day/night cycle réaliste compatible textures. Matériaux s'adaptent à l'ensoleillement (ex: terre 0.5/0.1 jour, 0.9/0.0 nuit).
- **Statut** : active (V1.2.0).
- **Mise en œuvre** : `planetIllumination` calculé via `isBodyIlluminated()` sur positions visual-scaled ; prop `illuminated` sur chaque `Planet` ; `moonIlluminated` pour Lune dans composant Terre.

## D38 — Architecture extensible anneaux Saturne V1.2.0

- **Décision** : composant `Planet` conserve le rendu anneaux Saturne (`ringGeometry` + `meshBasicMaterial`) dans architecture `bodyType` extensible, sans implémentation texture anneaux pour cette étape.
- **Raison** : préparer l'architecture pour textures anneaux futures (V1.3+) sans bloquer la livraison STYLE 1+2.
- **Statut** : active (V1.2.0).
- **Mise en œuvre** : anneaux rendus via `meshBasicMaterial` coloré (existant), prêts à recevoir `map` + texture transparente ultérieurement.

## D39 — Source solaire radiale pour le jour/nuit

- **Décision** : utiliser une `PointLight` au centre du Soleil et conserver une `DirectionalLight` très faible comme fill.
- **Raison** : une `DirectionalLight` seule projette des rayons parallèles et ne représente pas correctement Soleil → corps pour plusieurs orbites.
- **Statut** : active après audit du 2026-08-26.

## D40 — Rotation propre pilotée par le temps simulé

- **Décision** : calculer l’angle via `getRotationAngle(simTime, rotationPeriod)` dans `src/rendering/rotation.ts`.
- **Raison** : une rotation basée sur `delta` ignorait la pause et ne suivait pas correctement le passé/futur.
- **Corps** : Soleil, Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune et Lune.
- **Statut** : active techniquement; validation visuelle WebGL encore requise.

## D41 — Couleurs de trajectoires centralisées V1.3.0

- **Décision** : créer `src/rendering/trajectory.ts` avec `TRAJECTORY_COLORS` (une couleur distincte/cohérente par corps : 8 planètes + Lune) et `getTrajectoryColor(bodyId)`, utilisés par `OrbitRings` et l'anneau orbital lunaire.
- **Raison** : rendre chaque trajectoire identifiable tout en restant fine et discrète (approche visuelle NASA) ; centraliser les couleurs dans une configuration réutilisable au lieu d'une valeur codée en dur unique (`#6397ff`).
- **Statut** : active (V1.3.0).
- **Contrainte** : aucune modification des calculs orbitaux V0.9.4 ni des positions JPL.

## D42 — Fond spatial proche du noir V1.3.0

- **Décision** : arrière-plan `<color attach="background">` et `fog` passés de `#010610` à `#000000` ; étoiles 3D non affectées par le fog (`fog={false}` sur `pointsMaterial`).
- **Raison** : éliminer la dominante grise/bleue qui réduisait le contraste avec les corps célestes, tout en conservant une bonne lisibilité des étoiles sur fond noir.
- **Statut** : active (V1.3.0).

## D43 — Éclairage jour/nuit radial uniforme V1.3.0 (correction de V1.1.2)

- **Décision** : `PointLight` au Soleil reconfigurée (`intensity 2.8`, `decay 0`) pour une irradiance uniforme indépendamment de la distance ; `DirectionalLight` réduite à un fill négligeable (0.04) ; ambiance minimale (0.02).
- **Raison** : l'implémentation antérieure (fill directionnel quasi nul + point light à forte décroissance) ne produisait pas de séparation jour/nuit réellement visible sur tous les corps. Avec `decay 0`, chaque planète reçoit une irradiance identique côté Soleil → face éclairée nettement distincte de la face sombre (Terre, Mars, Jupiter, Lune et tous les corps).
- **Statut** : active (V1.3.0).
- **Contrainte** : a priori préserve l'architecture d'éclairage existante ; aucune modification de `src/orbital/`.

## D44 — Sélection par overlay subtil (pas d'émission) V1.3.0

- **Décision** : supprimer l'`emissive`/`emissiveIntensity` de sélection sur les matériaux de planète et de Lune, et remplacer le surlignage de sélection par un halo `meshBasicMaterial` `BackSide` additif fin (`depthWrite=false`) autour du corps.
- **Raison** : l'émission uniforme "lavait" la planète sélectionnée (couleur uniformément claire) et écrasait l'ombre jour/nuit. L'overlay additif subtil préserve texture, relief et partie sombre tout en restant un indicateur de sélection visible. La logique de sélection et Focus Camera reste inchangée.
- **Statut** : active (V1.3.0).

## D45 — Trajectoires orbitales en `Line2`/`LineMaterial` (pixels écran) V1.3.1

- **Décision** : remplacer les anneaux de trajectoire (`ringGeometry`, épaisseur en unités monde qui disparaissait au zoom-out) par des `Line2` + `LineMaterial` avec `worldUnits = false`, soit une épaisseur en pixels d'écran. `getTrajectoryConfig(bodyId)` centralise couleur, `lineWidth`, opacité et brightness par corps.
- **Raison** : épaisseur en pixels = lisibilité constante à tous les niveaux de zoom, y compris très éloigné, sans recalcul dans `useFrame` (la géométrie est statique ; la résolution écran est gérée automatiquement par `onBeforeRender`). Three.js fournit `three/examples/jsm/lines/` (aucune dépendance externe). La couleur reste attachée au corps, sélectionné ou non.
- **Conséquences** : 8 planètes + Lune migrées ; `OrbitRings` et l'anneau lunaire ne dépendent plus que d'`OrbitalTrajectory` ; `ringGeometry` orbital supprimé. Les calculs orbitaux (V0.9.4) et JPL (V1.0.x) sont intouchés.
- **Statut** : active (V1.3.1).

## D46 — Étoiles avec variété de couleurs V1.3.1

- **Décision** : ajouter un attribut de couleur par point (`vertexColors`) au champ d'étoiles avec une palette pondérée — blanc dominant, bleu très léger, cyan discret, jaune/orange très léger — et réduire légèrement tailles/opacité.
- **Raison** : un ciel peuplé d'étoiles uniquement blanches paraît monotone ; la variété colorée (subtile, sur fond `#000000`) rend le fond plus naturel tout en évitant de distraire des planètes et des trajectoires (tailles/luminosité réduites).
- **Contexte** : distribution aléatoire sphérique conservée ; les étoiles restent `fog={false}` pour ne pas être atténuées.
- **Statut** : active (V1.3.1).

## D47 — Correction de la projection texture et de l'anneau Saturne V1.3.2

- **Décision** : corriger le chargement des textures en forçant `ClampToEdgeWrapping`, `repeat = 1` et `offset = 0`, et remplacer le rendu Saturne par une géométrie annulaire réelle plus réaliste avec texture de bandes.
- **Raison** : l'ancien rendu déformait les images sur les sphères (répétition/étirement) et les anneaux Saturne restaient trop proches d'un disque opaque générique. Le but est de conserver la structure existante tout en améliorant la fidélité visuelle.
- **Statut** : active (V1.3.2).
- **Mise en œuvre** : `src/rendering/textureLoader.ts` et `src/App.tsx` (composant `SaturnRings`).

## Décision — Assets 3D réels (NASA / JPL / USGS)

- **Décision** : ajouter un attribut de couleur par point (`vertexColors`) au champ d'étoiles avec une palette pondérée — blanc dominant, bleu très léger, cyan discret, jaune/orange très léger — et réduire légèrement tailles/opacité.
- **Raison** : un ciel peuplé d'étoiles uniquement blanches paraît monotone ; la variété colorée (subtile, sur fond `#000000`) rend le fond plus naturel tout en évitant de distraire des planètes et des trajectoires (tailles/luminosité réduites).
- **Contexte** : distribution aléatoire sphérique conservée ; les étoiles restent `fog={false}` pour ne pas être atténuées.
- **Statut** : active (V1.3.1).

## Décision — Assets 3D réels (NASA / JPL / USGS)

- **Décision** : remplacer les sphères colorées de secours par des **assets astronomiques réels**.
  Chaque planète étant une sphère, l'asset scientifique réel retenu est sa **carte équirectangulaire
  d'albédo** (NASA SVS, NASA 3D Resources, USGS, CGI Moon Kit). Aucun asset n'est généré, reconstruit
  ou simulé artificiellement (pas d'effet GLSL, pas de forme procédurale).
- **Raison** : exigence de la mission « VRAIS MODÈLES 3D ». Les cartes équirectangulaires NASA sont
  les données scientifiques authentiques ; les planètes sont des sphères, aussi cette approche est-elle
  à la fois réelle, astronomiquement correcte et non procédurale.
- **Contexte** : le dépôt officiel NASA 3D (`nasa/NASA-3D-Resources`) contient des engins spatiaux, pas
  des globes planétaires ; un chargeur GLB/glTF (`modelLoader.ts`, DRACO paresseux) est néanmoins en
  place et le registre (`modelRegistry.ts`) peut référencer un `gltfFile` sans autre modification de code.
- **Sources documentées** (par corps, dans `modelRegistry.ts`) :
  Soleil = NASA SVS 11255 (SDO) ; Mercure = NASA SVS 11197 (MESSENGER) ; Vénus/Terre/Mars/Jupiter/
  Saturne/Neptune = NASA 3D Resources ; Lune = NASA SVS 4720 (CGI Moon Kit, LROC WAC) ; Uranus =
  Solar System Scope (CC BY 4.0, dérivé des données NASA Voyager/Hubble).
- **Soleil** : la texture SDO n'est que le rendu visuel ; le `THREE.PointLight` reste la source
  lumineuse principale (non remplacé).
- **Saturne** : anneaux procéduraux conservés en secours documenté (aucun GLB d'anneau réel intégré).
- **Honnêteté** : aucune planète n'est qualifiée de « modèle 3D GLB » tant qu'un tel asset réel n'est
  pas intégré et vérifié ; les 10 corps utilisent des cartes équirectangulaires réelles (assets réels).
- **Statut** : active (mission VRAIS MODÈLES 3D, étape 1 — textures réelles + architecture GLB prête).
