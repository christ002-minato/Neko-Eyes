import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import {
  GEO_LOD_MONITOR,
  loadGeoLodDataset,
  resolveGeoLodLevel,
  type CountriesAdm0Data,
  type GeoLodLevel,
  type GeoLodStatus,
} from "./geoLod.ts"

/**
 * Moniteur LOD géographique Terre — composant intra-Canvas (lecture seule).
 *
 * - Lit `camera.position` et la position monde actuelle de la Terre
 *   (qui continue son mouvement orbital / suivi — aucune hypothèse statique).
 * - N'ÉCRIT JAMAIS dans la caméra ni les contrôles : aucun nouveau système
 *   de caméra/tracking, CameraController + OrbitControls inchangés.
 * - Évaluation throttlée : 1 fois toutes les N frames + seulement si la
 *   caméra ou la Terre a bougé d'au moins `moveEpsilonRadii`.
 * - Notifie le parent UNIQUEMENT sur changement de niveau (hysteresis dans
 *   `resolveGeoLodLevel` → pas de bascule permanente autour des seuils).
 */
export function EarthGeoLodMonitor({
  earthPosition,
  earthRadius,
  onLevelChange,
}: {
  earthPosition: readonly [number, number, number]
  earthRadius: number
  onLevelChange: (level: GeoLodLevel) => void
}) {
  const { camera } = useThree()
  const levelRef = useRef<GeoLodLevel>(0)
  const frameRef = useRef(0)
  const lastCamRef = useRef(new THREE.Vector3())
  const lastEarthRef = useRef(new THREE.Vector3())
  const firstRunRef = useRef(true)
  const earthPosRef = useRef<readonly [number, number, number]>(earthPosition)
  earthPosRef.current = earthPosition
  const levelCbRef = useRef(onLevelChange)
  levelCbRef.current = onLevelChange
  const radiusRef = useRef(earthRadius)
  radiusRef.current = earthRadius

  useFrame(() => {
    frameRef.current += 1
    if (frameRef.current % GEO_LOD_MONITOR.frameSkip !== 0) return

    const radius = Math.max(radiusRef.current, 1e-6)
    const earth = earthPosRef.current
    const dx = camera.position.x - earth[0]
    const dy = camera.position.y - earth[1]
    const dz = camera.position.z - earth[2]
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (!firstRunRef.current) {
      const camMoved = lastCamRef.current.distanceTo(camera.position)
      const earthMoved = lastEarthRef.current.distanceTo(
        new THREE.Vector3(earth[0], earth[1], earth[2]),
      )
      const epsilon = GEO_LOD_MONITOR.moveEpsilonRadii * radius
      if (camMoved < epsilon && earthMoved < epsilon) return
    }

    firstRunRef.current = false
    lastCamRef.current.copy(camera.position)
    lastEarthRef.current.set(earth[0], earth[1], earth[2])

    const next = resolveGeoLodLevel(levelRef.current, distance, radius)
    if (next !== levelRef.current) {
      levelRef.current = next
      levelCbRef.current(next)
    }
  })

  return null
}

export interface EarthGeoLodDatasets {
  lod1Data: CountriesAdm0Data | null
  lod2Data: CountriesAdm0Data | null
  lod1Status: GeoLodStatus
  lod2Status: GeoLodStatus
}

/**
 * Charge les datasets requis par le niveau courant, de façon asynchrone
 * (jamais dans useFrame → jamais de blocage du rendu).
 *
 * - Chaque dataset est chargé au plus une fois (cache + single-flight).
 * - Fallback : pendant le chargement, le niveau précédent reste affiché
 *   (les données déjà chargées restent montées).
 * - Zoom arrière : l'appelant démonte la couche (géométrie GPU disposée) ;
 *   le cache CPU borné (2 entrées) évite tout re-téléchargement.
 */
export function useEarthGeoLodDatasets(level: GeoLodLevel): EarthGeoLodDatasets {
  const [lod1Data, setLod1Data] = useState<CountriesAdm0Data | null>(null)
  const [lod2Data, setLod2Data] = useState<CountriesAdm0Data | null>(null)
  const [lod1Status, setLod1Status] = useState<GeoLodStatus>("idle")
  const [lod2Status, setLod2Status] = useState<GeoLodStatus>("idle")

  useEffect(() => {
    if (level < 1 || lod1Data || lod1Status === "loading") return
    let cancelled = false
    setLod1Status("loading")
    loadGeoLodDataset(1).then(
      (data) => {
        if (cancelled) return
        setLod1Data(data)
        setLod1Status("ready")
      },
      () => {
        if (cancelled) return
        setLod1Status("error")
      },
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level >= 1])

  useEffect(() => {
    if (level < 2 || lod2Data || lod2Status === "loading") return
    let cancelled = false
    setLod2Status("loading")
    loadGeoLodDataset(2).then(
      (data) => {
        if (cancelled) return
        setLod2Data(data)
        setLod2Status("ready")
      },
      () => {
        if (cancelled) return
        setLod2Status("error")
      },
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level >= 2])

  return { lod1Data, lod2Data, lod1Status, lod2Status }
}
