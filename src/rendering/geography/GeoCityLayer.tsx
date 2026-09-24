import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { Html } from "@react-three/drei"
import type { ThreeEvent } from "@react-three/fiber"
import { geoLonLatToVector3 } from "./geoProjection.ts"
import type { GeoLod3City, GeoLod3Data } from "./geoLod.ts"

const CITY_COLOR = new THREE.Color("#4ce6ff")
const CITY_COLOR_HOVER = new THREE.Color("#e6fbff")

/** Population compacte type HUD NASA-Eyes : 2.16M, 346K. */
function formatPopulation(pop: number): string {
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(2)}M`
  return `${Math.round(pop / 1_000)}K`
}

export function GeoCityLayer({
  earthRadius,
  data,
  onCitySelect,
}: {
  earthRadius: number
  data: GeoLod3Data | null
  onCitySelect?: (city: GeoLod3City) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const occludeRef = useRef<THREE.Mesh>(null)
  const [hoveredCity, setHoveredCity] = useState<GeoLod3City | null>(null)

  const { geometry, cityCount } = useMemo(() => {
    if (!data) return { geometry: null, cityCount: 0 }
    const markerGeometry = new THREE.SphereGeometry(Math.max(earthRadius * 0.012, 0.025), 8, 8)
    return { geometry: markerGeometry, cityCount: data.cities.length }
  }, [data, earthRadius])

  const hoveredPosition = useMemo(() => {
    if (!hoveredCity) return null
    const v = geoLonLatToVector3(hoveredCity.longitude, hoveredCity.latitude, earthRadius * 1.03)
    return [v.x, v.y, v.z] as [number, number, number]
  }, [hoveredCity, earthRadius])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !data) return
    for (let i = 0; i < data.cities.length; i++) mesh.setColorAt(i, CITY_COLOR)
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [data])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !data) return
    const matrix = new THREE.Matrix4()
    data.cities.forEach((city, index) => {
      const position = geoLonLatToVector3(city.longitude, city.latitude, earthRadius * 1.02)
      matrix.setPosition(position)
      mesh.setMatrixAt(index, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [data, earthRadius])

  useEffect(() => () => geometry?.dispose(), [geometry])

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    const instanceId = event.instanceId
    if (instanceId === undefined || !data) return
    const city = data.cities[instanceId]
    setHoveredCity(city ?? null)
    const mesh = meshRef.current
    if (city && mesh) {
      mesh.setColorAt(instanceId, CITY_COLOR_HOVER)
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      document.body.style.cursor = "pointer"
    }
  }

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    const instanceId = event.instanceId
    setHoveredCity(null)
    const mesh = meshRef.current
    if (instanceId !== undefined && mesh) {
      mesh.setColorAt(instanceId, CITY_COLOR)
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    document.body.style.cursor = "auto"
  }

  if (!data || !geometry) return null

  return (
    <>
      {/* Occluder sphérique (raycast actif) : sert uniquement à `Html` pour
          masquer le tooltip quand la ville passe derrière le globe. */}
      <mesh ref={occludeRef}>
        <sphereGeometry args={[earthRadius, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, cityCount]}
        renderOrder={3}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={(event) => {
          event.stopPropagation()
          const instanceId = event.instanceId
          if (instanceId !== undefined && data.cities[instanceId]) {
            onCitySelect?.(data.cities[instanceId])
          }
        }}
      >
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {data.cities.map((city) => {
        const position = geoLonLatToVector3(city.longitude, city.latitude, earthRadius * 1.035)
        return (
          <Html key={`city-label-${city.id}`} position={position.toArray()} center distanceFactor={earthRadius * 0.35}
            zIndexRange={[30, 0]} pointerEvents="none">
            <span className="whitespace-nowrap rounded bg-slate-950/75 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-100">
              {city.name}
            </span>
          </Html>
        )
      })}

      {hoveredCity && hoveredPosition && (
        <Html
          position={hoveredPosition}
          // `as any` : deux copies de @types/three (root + .pnpm) rendent la
          // ref de l'occluder structurellement incompatible à la compilation,
          // alors que `Mesh` est bien un `Object3D` à l'exécution.
          occlude={[occludeRef] as any}
          zIndexRange={[100, 0]}
          pointerEvents="none"
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-lg px-3 py-1.5 shadow-xl text-white pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2">
            <div className="font-bold text-xs text-cyan-300 tracking-wide">{hoveredCity.name}</div>
            <div className="text-[10px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>{hoveredCity.country}</span>
              <span className="text-cyan-400/80">•</span>
              <span>{formatPopulation(hoveredCity.pop)} hab.</span>
            </div>
          </div>
        </Html>
      )}
    </>
  )
}