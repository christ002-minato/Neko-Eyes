# REFERENCE_ARCHITECTURE — Neko Eyes

> **Ne jamais présenter cette recherche comme l'architecture interne confirmée de NASA Eyes.**
> C'est un document de référence externe — observations, techniques recommandées et hypothèses pour l'avenir.

## Observations — simulateurs 3D spatiaux type NASA Eyes

- Hierarchie des corps célestes (planètes → lunes → satellites) est fondamentale pour un rendu cohérent pendant le suivi caméra.
- La position mondiale d'une lune doit être résolue récursivement : `Lune = Terre + offset_lunaire` ; cela doit fonctionner pendant que la Terre orbite autour du Soleil et que la caméra suit ou suit pas la Lune.
- Le suivi caméra doit préserver le damping, le zoom et la rotation utilisateur pendant que l'objet orbite — translation rigide appliquée aussi bien à la caméra qu'à la cible OrbitControls évite les conflits.
- L offset caméra (distance + direction) peut être établi au lancement du Focus et conservé pendant tout le déplacement de l'objet.
- Les bodies sans parent (Soleil, Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune) sont des racines ; ceux avec parent (Lune → Terre) résoluent leur position absolue par somme récursive.

## Techniques recommandées (pour de futures étapes)

- **Hiérarchie des corps** : résolution récursive de parent → enfant dans un modèle orbital séparé.
- **Textures** : KTX2 format, mipmapping,Atlas texturaux pour les planètes.
- **Atmosphère** : shaders de diffusion dirigée (atmospheric scattering) pilotés par le temps simulé.
- **Starfield** : InstancedMesh avec positions aléatoires dans un halo sphérique ; LOD selon distance caméra.
- **Shaders** : bruit multi-octave (comme le Soleil actuel) ; bump mapping ; parallax mapping pour les surfaces détaillées.
- **Bloom** : post-processing sur le Soleil et les étoiles brillantes ; tonemapping ACES ou Reinhard.
- **LOD** : différents niveaux de détail selon distance (sphere simplifiée → detailed mesh selon distance).
- **KTX2** : format de texture compressé de haute qualité pour le Soleil et les planètes.
- **InstancedMesh** : pour le starfield et les anneaux de Saturne.
- **Frustum culling** : cacher les corps hors de la caméra pour améliorer les performances.
- **Caméra relative à une cible mobile** : offset orbital conservé pendant que la cible suit sa trajectoire ; translation rigide caméra + controls.target pour préserver user controls.

## Hypothèses futures

- Remplacement des données codées en dur par les éphémères NASA/JPL Horizons.
- Ajout d'atmosphères classiques sur Terre, Mars, Vénus, Jupiter.
- Starfield dynamique avec magnitudes variables.
- Bloom et tonemapping pour le rendu HDR.
- LOD progressif selon distance caméra.
- Atmosphères avec diffusion dirigée (schémas de Prins-Bezivin ou équivalent).
- Ombres projetées par le Soleil sur les corps.
- Reflet spéculaire (specular mapping) sur les planètes gazeuses.

## Importance

Toujours séparer :
- **Recherche / inspiration** (ce document) ;
- **Architecture interne confirmée** (voir `docs/ARCHITECTURE.md` et `docs/DECISIONS.md`) ;
- **PLANNED / futur** (voir `PROJECT_STATUS.md`).

Ne jamais confondre recherche documentée et architecture validée par le code.