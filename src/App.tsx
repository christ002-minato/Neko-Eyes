import { useState, useEffect, useMemo, useRef, useCallback, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import nekoLogo from '@/imports/neko_eyer_logo.png'
import { JPLProvider } from '@/orbital/ephemeris'
import { defineOrbitalSystem, getBodyPosition } from '@/orbital'
import { useSolarLighting, mapOrbitalDistanceToVisual, mapBodySizeToVisual, mapOrbitalPositionToVisual, getMaterialConfig, getRotationAngle, createPlanetMesh, createSunMesh, getTrajectoryConfig, createOrbitTrajectory, disposeOrbitTrajectory, type BodyType, getPlanetMaterialConfig, calculateInitialEarthRotationAngle, getBodyOrbitalElements, simulationTimeToUTC, calculateSubsolarPoint, GeographicLayer, runGeoProjectionSelftest } from "@/rendering"
import { useAstroModel } from "@/rendering/models"
import { simulationTimeToDayId, formatLocalTime, formatUTCTime } from "@/time"


// ── Types ─────────────────────────────────────────────────────────────────────

interface Planet {
  id: string
  name: string
  radius: number
  orbitRadius: number
  period: number
  rotationPeriod?: number
  color: string
  glow: string
  type: string
  distanceAU: number
  moons: number
  tempC: string
  description: string
  initialOffset: number
  parentId?: string
  eccentricity?: number
  inclination?: number
  nodeLongitude?: number
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
}

// ── Celestial Data ────────────────────────────────────────────────────────────

const SUN: Planet = {
  id: 'sun', name: 'The Sun', radius: 15, orbitRadius: 0, period: 0,
  rotationPeriod: 609.12,
  color: '#FFD700', glow: 'rgba(255,200,50,0.7)',
  type: 'G-type Main-Sequence Star', distanceAU: 0, moons: 0,
  tempC: '5,500°C (surface)',
  description: "Our star — 99.86% of the Solar System's total mass, 1.4 million km in diameter, 4.6 billion years old.",
  initialOffset: 0,
}

const PLANETS: Planet[] = [
  {
    id: 'mercury', name: 'Mercury', radius: 1.5, orbitRadius: 28, period: 3,
    rotationPeriod: 1407.6,
    color: '#b0a090', glow: 'rgba(176,160,144,0.4)',
    type: 'Terrestrial', distanceAU: 0.39, moons: 0, tempC: '−180 / +430°C',
    description: 'Smallest planet. Extreme temperature swings, no atmosphere, heavily cratered surface.',
    initialOffset: 0.12,
    parentId: 'sun',
    eccentricity: 0.2056,
    inclination: 7.005 * Math.PI / 180,  // degrees → radians
    nodeLongitude: 48.331 * Math.PI / 180,  // degrees → radians
  },
  {
    id: 'venus', name: 'Venus', radius: 2.5, orbitRadius: 40, period: 7.5,
    rotationPeriod: -5832.5,
    color: '#FFC649', glow: 'rgba(255,198,73,0.4)',
    type: 'Terrestrial', distanceAU: 0.72, moons: 0, tempC: '+465°C',
    description: 'Hottest planet. Dense CO₂ atmosphere with sulfuric acid clouds trapping heat.',
    initialOffset: 0.42,
    parentId: 'sun',
    eccentricity: 0.0068,
    inclination: 3.395 * Math.PI / 180,
    nodeLongitude: 76.679 * Math.PI / 180,
  },
  {
    id: 'earth', name: 'Earth', radius: 2.8, orbitRadius: 55, period: 10,
    rotationPeriod: 23.934,
    color: '#4B9CD3', glow: 'rgba(75,156,211,0.4)',
    type: 'Terrestrial', distanceAU: 1.00, moons: 1, tempC: '−89 / +58°C',
    description: 'The only confirmed harbor of life in the universe. Liquid water, breathable atmosphere.',
    initialOffset: 0.70,
    parentId: 'sun',
    eccentricity: 0.0167,
    inclination: 0.00005 * Math.PI / 180,  // nearly coplanar
    nodeLongitude: 0,
  },
  {
    id: 'mars', name: 'Mars', radius: 2, orbitRadius: 70, period: 18.8,
    rotationPeriod: 24.623,
    color: '#C1440E', glow: 'rgba(193,68,14,0.4)',
    type: 'Terrestrial', distanceAU: 1.52, moons: 2, tempC: '−125 / +20°C',
    description: 'Red planet home to Olympus Mons, the tallest volcano in the Solar System at 21 km.',
    initialOffset: 0.25,
    parentId: 'sun',
    eccentricity: 0.0934,
    inclination: 1.85 * Math.PI / 180,
    nodeLongitude: 49.558 * Math.PI / 180,
  },
  {
    id: 'jupiter', name: 'Jupiter', radius: 6, orbitRadius: 95, period: 50,
    rotationPeriod: 9.925,
    color: '#C88B3A', glow: 'rgba(200,139,58,0.4)',
    type: 'Gas Giant', distanceAU: 5.20, moons: 95, tempC: '−110°C',
    description: 'Largest planet. The Great Red Spot is a storm raging continuously for over 350 years.',
    initialOffset: 0.58,
    parentId: 'sun',
    eccentricity: 0.0489,
    inclination: 1.305 * Math.PI / 180,
    nodeLongitude: 100.462 * Math.PI / 180,
  },
  {
    id: 'saturn', name: 'Saturn', radius: 5, orbitRadius: 120, period: 120,
    rotationPeriod: 10.656,
    color: '#FAD5A5', glow: 'rgba(250,213,165,0.4)',
    type: 'Gas Giant', distanceAU: 9.58, moons: 146, tempC: '−140°C',
    description: 'Iconic ring system spanning 280,000 km. Less dense than water.',
    initialOffset: 0.82,
    parentId: 'sun',
    eccentricity: 0.0555,
    inclination: 2.484 * Math.PI / 180,
    nodeLongitude: 122.364 * Math.PI / 180,
  },
  {
    id: 'uranus', name: 'Uranus', radius: 3.5, orbitRadius: 145, period: 250,
    rotationPeriod: -17.24,
    color: '#7DE8E8', glow: 'rgba(125,232,232,0.35)',
    type: 'Ice Giant', distanceAU: 19.22, moons: 28, tempC: '−224°C',
    description: 'Rotates on its side at 98°. Faint rings, blue-green methane atmosphere.',
    initialOffset: 0.35,
    parentId: 'sun',
    eccentricity: 0.0472,
    inclination: 0.773 * Math.PI / 180,  // 98° axial tilt, but orbital inclination is small
    nodeLongitude: 73.992 * Math.PI / 180,
  },
  {
    id: 'neptune', name: 'Neptune', radius: 3.2, orbitRadius: 168, period: 500,
    rotationPeriod: 16.11,
    color: '#4B70DD', glow: 'rgba(75,112,221,0.35)',
    type: 'Ice Giant', distanceAU: 30.05, moons: 16, tempC: '−214°C',
    description: 'Strongest winds in the Solar System — 2,100 km/h. Has a Great Dark Spot storm.',
    initialOffset: 0.55,
    parentId: 'sun',
    eccentricity: 0.0086,
    inclination: 1.77 * Math.PI / 180,
    nodeLongitude: 131.721 * Math.PI / 180,
  },
  {
    id: 'moon', name: 'The Moon', radius: 0.8, orbitRadius: 7, period: 2.7,
    rotationPeriod: 655.72,
    color: '#C0C0C0', glow: 'rgba(192,192,192,0.3)',
    type: 'Natural Satellite', distanceAU: 0.00257, moons: 0, tempC: '−173 / +127°C',
    description: 'Earth\'s only natural satellite. Its gravitational pull creates tides on Earth.',
    initialOffset: 0,
    parentId: 'earth',
    eccentricity: 0.0549,
    inclination: 5.145 * Math.PI / 180,
    nodeLongitude: 0,
  },
]

const ORBITAL_BODIES = defineOrbitalSystem(PLANETS.map((planet) => ({
  id: planet.id,
  orbitalRadius: planet.orbitRadius,
  orbitalPeriod: planet.period,
  phase: planet.initialOffset * Math.PI * 2,
  rotationPeriod: planet.rotationPeriod,
  parentId: planet.parentId,
  eccentricity: planet.eccentricity,
  inclination: planet.inclination,
  nodeLongitude: planet.nodeLongitude,
})))
const ORBITAL_BODY_BY_ID = new Map(ORBITAL_BODIES.map((body) => [body.id, body]))

function getPlanetPosition(p: Planet, time: number): [number, number, number] {
  if (p.id === 'sun') return [0, 0, 0]
  if (p.id === 'moon') return [0, 0, 0]
  const body = ORBITAL_BODY_BY_ID.get(p.id)
  if (!body) return [0, 0, 0]
  return mapOrbitalPositionToVisual(getBodyPosition(body, time))
}

function getMoonOffset(time: number): [number, number, number] {
  const moon = ORBITAL_BODY_BY_ID.get('moon')
  const earth = ORBITAL_BODY_BY_ID.get('earth')
  if (!moon || !earth) return [0, 0, 0]
  const moonPosition = getBodyPosition(moon, time)
  const earthPosition = getBodyPosition(earth, time)
  return mapOrbitalPositionToVisual([
    moonPosition[0] - earthPosition[0],
    moonPosition[1] - earthPosition[1],
    moonPosition[2] - earthPosition[2],
  ], true)
}

// ── 3D Scene Components ───────────────────────────────────────────────────────

function getBodyVisualRadius(bodyId: string): number {
  const planet = PLANETS.find(p => p.id === bodyId)
  if (planet) return mapBodySizeToVisual(planet.radius)
  if (bodyId === 'sun') return mapBodySizeToVisual(SUN.radius)
  return mapBodySizeToVisual(1)
}

function CameraController({
  focusTarget,
  focusPosition,
  isFocusing,
  onTransitionDone,
  controlsRef,
}: {
  focusTarget: string | null
  focusPosition: [number, number, number] | null
  isFocusing: boolean
  onTransitionDone: () => void
  controlsRef: React.RefObject<any>
}) {
  const { camera } = useThree()
  const lerpProgress = useRef(0)
  const currentFocus = useRef<string | null>(null)
  const prevCameraPos = useRef(new THREE.Vector3())
  const prevControlsTarget = useRef(new THREE.Vector3())
  const minDistanceSet = useRef(false)
  const prevFocusTarget = useRef<string | null>(null)

  useFrame(() => {
    if (!controlsRef.current) return
    const controls = controlsRef.current

    if (prevFocusTarget.current !== focusTarget) {
      if (focusTarget === null && prevFocusTarget.current !== null) {
        controls.minDistance = 0.05
        minDistanceSet.current = false
      }
      prevFocusTarget.current = focusTarget
    }

    if (isFocusing && focusPosition && focusTarget) {
      if (currentFocus.current !== focusTarget) {
        currentFocus.current = focusTarget
        lerpProgress.current = 0
        minDistanceSet.current = false
        prevCameraPos.current.copy(camera.position)
        prevControlsTarget.current.copy(controls.target)
      }

      lerpProgress.current = Math.min(lerpProgress.current + 0.018, 1)
      const t = lerpProgress.current * lerpProgress.current * (3 - 2 * lerpProgress.current)

      const bodyRadius = getBodyVisualRadius(focusTarget)
      const focusDistance = bodyRadius * 3.5
      const focusHeight = bodyRadius * 2.0
      const targetPos = new THREE.Vector3(
        focusPosition[0] + focusDistance,
        focusHeight,
        focusPosition[2] + focusDistance,
      )
      camera.position.lerpVectors(prevCameraPos.current, targetPos, t)
      const lookTarget = new THREE.Vector3(focusPosition[0], focusPosition[1], focusPosition[2])
      controls.target.lerpVectors(prevControlsTarget.current, lookTarget, t)
      controls.update()

      if (lerpProgress.current >= 1 && !minDistanceSet.current) {
        controls.minDistance = bodyRadius * 1.05
        controls.maxDistance = Math.max(controls.maxDistance, focusDistance * 4)
        minDistanceSet.current = true
        currentFocus.current = null
        onTransitionDone()
      }
    }
  })

  return null
}

function Sun({
  timeRef,
  selectedId,
  onSelect,
}: {
  timeRef: React.RefObject<number>
  selectedId: string | null
  onSelect: (p: Planet) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isSelected = selectedId === 'sun'
  const { texture: sunTexture } = useAstroModel("sun")

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = getRotationAngle(timeRef.current, SUN.rotationPeriod ?? 0)
    }
  })

  const visualSunRadius = mapBodySizeToVisual(SUN.radius)
  const sunHaloRadius = visualSunRadius * 2.8
  const sunInnerHaloRadius = visualSunRadius * 2.1

  const sunMesh = useMemo(() => createSunMesh({ position: [0, 0, 0], radius: visualSunRadius, color: SUN.color, bodyType: "sun" }, {
    color: "#000000",
    emissive: "#fff8e7",
    emissiveMap: sunTexture ?? undefined,
    emissiveIntensity: 2.5,
    map: sunTexture ?? undefined,
    roughness: 0.3,
    metalness: 0.1,
    toneMapped: false,
    side: THREE.DoubleSide,
  }), [sunTexture, visualSunRadius])

  return (
    <group>
      <mesh scale={1.15}>
        <sphereGeometry args={[sunHaloRadius, 32, 32]} />
        <meshBasicMaterial
          color="#ffcc00"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[sunInnerHaloRadius, 32, 32]} />
        <meshBasicMaterial
          color="#fff2cc"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.03}>
        <sphereGeometry args={[visualSunRadius, 32, 32]} />
        <meshBasicMaterial
          color="#fff8e7"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Selection glow */}
      {isSelected && (
        <mesh scale={1.03}>
          <sphereGeometry args={[mapBodySizeToVisual(SUN.radius), 32, 32]} />
          <meshBasicMaterial
            color="#00d8ff"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
      {/* Sun sphere */}
      <primitive
        object={sunMesh}
        ref={meshRef}
        onPointerDown={(e: { stopPropagation: () => void }) => {
          e.stopPropagation()
          onSelect(SUN)
        }}
      />
      {/* Invisible hitbox for easier clicking/touch */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation()
          onSelect(SUN)
        }}
      >
        <sphereGeometry args={[mapBodySizeToVisual(SUN.radius * 1.5), 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

function Planet({
  planet,
  time,
  timeRef,
  selectedId,
  onSelect,
  selectedMoon,
  onSelectMoon,
  positionOverride,
  moonPositionOverride,
  bodyType,
  illuminated,
  moonIlluminated,
  initialRotationAngle = 0,
}: {
  planet: Planet
  time: number
  timeRef: React.RefObject<number>
  selectedId: string | null
  onSelect: (p: Planet) => void
  selectedMoon: boolean
  onSelectMoon: () => void
  positionOverride?: [number, number, number]
  moonPositionOverride?: [number, number, number] | null
  bodyType?: BodyType
  illuminated?: boolean
  moonIlluminated?: boolean
  initialRotationAngle?: number
}) {
  const rotationGroupRef = useRef<THREE.Group>(null)
  const moonMeshRef = useRef<THREE.Mesh>(null)
  const isSelected = selectedId === planet.id

  const { texture } = useAstroModel(bodyType ?? "earth")
  const materialConfig = useMemo(() => {
    if (bodyType && illuminated !== undefined) {
      return getPlanetMaterialConfig(bodyType, illuminated)
    }
    return bodyType ? getMaterialConfig(bodyType) : { roughness: 0.7, metalness: 0.1 }
  }, [bodyType, illuminated])

  useFrame(() => {
    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.y = getRotationAngle(timeRef.current, planet.rotationPeriod ?? 0, initialRotationAngle)
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y = getRotationAngle(timeRef.current, moonData.rotationPeriod ?? 0)
    }
  })

  const visualRadius = mapBodySizeToVisual(planet.radius)
  const pos = positionOverride ? mapOrbitalPositionToVisual(positionOverride) : getPlanetPosition(planet, time)
  const moonOffset = planet.id === 'earth'
    ? moonPositionOverride
      ? mapOrbitalPositionToVisual(moonPositionOverride, true)
      : getMoonOffset(time)
    : [0, 0, 0] as [number, number, number]
  const moonData = PLANETS.find(p => p.id === 'moon')!
  const visualMoonRadius = mapBodySizeToVisual(moonData.radius)
  const visualMoonOrbitRadius = mapOrbitalDistanceToVisual(moonData.orbitRadius, true)

  const { texture: moonTexture } = useAstroModel("moon")
  const moonMaterialConfig = useMemo(() => getMaterialConfig("moon"), [])

  const gradientColors = useMemo(() => {
    if (planet.id === 'earth') return { c1: '#7dd4f6', c2: planet.color, c3: '#2e7a2c' }
    if (planet.id === 'jupiter') return { c1: planet.color, c2: '#8b5e2a', c3: planet.color }
    if (planet.id === 'saturn') return { c1: '#fff0d0', c2: planet.color, c3: '#c8a060' }
    return { c1: planet.color + 'cc', c2: planet.color, c3: planet.color + '77' }
  }, [planet])

  const materialProps = useMemo(() => ({
    // Couleur neutre quand la vraie texture est présente → rendu naturel, non saturé.
    // En repli (sans texture), on garde la couleur de gradient d'origine.
    color: texture ? "#ffffff" : gradientColors.c2,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
    roughness: materialConfig.roughness,
    metalness: materialConfig.metalness,
    map: texture ?? undefined,
  }), [gradientColors, materialConfig, texture])
  const planetMesh = useMemo(() => createPlanetMesh({
    position: [0, 0, 0],
    radius: visualRadius,
    color: planet.color,
    bodyId: planet.id,
    bodyType,
  }, materialProps), [bodyType, materialProps, planet.color, planet.id, visualRadius])

  return (
    <group position={pos}>
      <group ref={rotationGroupRef}>
        <primitive
          object={planetMesh}
          onPointerDown={(e: { stopPropagation: () => void }) => {
            e.stopPropagation()
            onSelect(planet)
          }}
        />
        {/* Invisible hitbox for easier clicking */}
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation()
            onSelect(planet)
          }}
        >
          <sphereGeometry args={[visualRadius * 1.5, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        {isSelected && (
          <mesh scale={1.04}>
            <sphereGeometry args={[visualRadius, 32, 32]} />
            <meshBasicMaterial
              color="#00d8ff"
              transparent
              opacity={0.2}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
        {/* Geographic boundaries (ADM0) inherit the group rotation */}
        {planet.id === 'earth' && <GeographicLayer earthRadius={visualRadius} />}
      </group>
      {/* Saturn rings — anneaux 3D réalistes : bandes de transparence, éclairés par la scène */}
      {planet.id === 'saturn' && <SaturnRings radius={visualRadius} />}
      {/* Moon around Earth */}
      {planet.id === 'earth' && (
        <>
          {/* Moon orbit trajectory */}
          <OrbitalTrajectory radius={visualMoonOrbitRadius} bodyId="moon" />
          <group position={moonOffset}>
          <group ref={moonMeshRef}>
            <mesh
              onPointerDown={(e) => {
                e.stopPropagation()
                onSelectMoon()
              }}
            >
              <sphereGeometry args={[visualMoonRadius, 16, 16]} />
              <meshStandardMaterial
                color={moonTexture ? "#ffffff" : moonData.color}
                emissive={new THREE.Color(0x000000)}
                emissiveIntensity={0}
                roughness={moonIlluminated ? (moonMaterialConfig.roughness) : 0.9}
                metalness={moonIlluminated ? (moonMaterialConfig.metalness) : 0.05}
                map={moonTexture ?? undefined}
              />
            </mesh>
            <mesh
              onPointerDown={(e) => {
                e.stopPropagation()
                onSelectMoon()
              }}
            >
              <sphereGeometry args={[visualMoonRadius * 2, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            {selectedId === 'moon' && (
              <mesh scale={1.06}>
                <sphereGeometry args={[visualMoonRadius, 16, 16]} />
                <meshBasicMaterial
                  color="#00d8ff"
                  transparent
                  opacity={0.22}
                  side={THREE.BackSide}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
          </group>
        </>
      )}
    </group>
  )
}

function OrbitalTrajectory({ radius, bodyId }: { radius: number; bodyId: string }) {
  const trajectory = useMemo(() => {
    const config = getTrajectoryConfig(bodyId)
    return createOrbitTrajectory({
      radius,
      color: config.color,
      lineWidth: config.lineWidth,
      opacity: Math.min(config.brightness * config.opacity, 1),
      segments: 768,
    })
  }, [radius, bodyId])

  useEffect(() => () => disposeOrbitTrajectory(trajectory), [trajectory])

  return <primitive object={trajectory.line} />
}

// Anneaux de Saturne : plusieurs bandes concentriques non-opaques (zones de
// transparence / divisions type Cassini) centrées et orientées dans le plan
// équatorial de la planète. Chaque bande est une géométrie annulaire réelle,
// éclairée par la scène (MeshStandardMaterial) comme le reste des corps.
const SATURN_RING_BANDS = [
  { i: 1.25, o: 1.45, color: "#e8d8b0", opacity: 0.52 },
  { i: 1.50, o: 1.85, color: "#cdb486", opacity: 0.9 },
  { i: 1.85, o: 1.95, color: "#d8c79c", opacity: 0.45 },
  { i: 2.02, o: 2.25, color: "#e3d2a8", opacity: 0.7 },
  { i: 2.25, o: 2.33, color: "#cbb98c", opacity: 0.35 },
  { i: 2.36, o: 2.45, color: "#ddcaa0", opacity: 0.45 },
]

function createSaturnRingTexture(): THREE.Texture {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return new THREE.Texture()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  gradient.addColorStop(0, "rgba(255,255,255,0)")
  gradient.addColorStop(0.18, "rgba(238,218,180,0.65)")
  gradient.addColorStop(0.34, "rgba(200,169,104,0.96)")
  gradient.addColorStop(0.52, "rgba(240,225,190,0.92)")
  gradient.addColorStop(0.78, "rgba(185,150,95,0.82)")
  gradient.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 24; i += 1) {
    const bandWidth = 18 + (i % 6) * 3
    const x = (i / 24) * canvas.width
    const alpha = 0.15 + ((i % 5) / 6) * 0.22
    ctx.fillStyle = `rgba(255, 244, 214, ${alpha})`
    ctx.fillRect(x, 0, bandWidth, canvas.height)
  }

  const ringTexture = new THREE.CanvasTexture(canvas)
  ringTexture.colorSpace = THREE.SRGBColorSpace
  ringTexture.wrapS = THREE.ClampToEdgeWrapping
  ringTexture.wrapT = THREE.ClampToEdgeWrapping
  ringTexture.needsUpdate = true
  return ringTexture
}

function SaturnRings({ radius }: { radius: number }) {
  const ringTexture = useMemo(() => createSaturnRingTexture(), [])
  const bands = useMemo(
    () =>
      SATURN_RING_BANDS.map((b) => ({
        geometry: new THREE.RingGeometry(b.i * radius, b.o * radius, 256, 1),
        color: b.color,
        opacity: b.opacity,
      })),
    [radius],
  )

  const axialTilt = 26.73 * (Math.PI / 180)
  useEffect(() => () => {
    bands.forEach((b) => b.geometry.dispose())
    ringTexture.dispose()
  }, [bands, ringTexture])

  return (
    <group rotation={[axialTilt, 0, 0]}>
      {bands.map((b, idx) => (
        <mesh key={idx} geometry={b.geometry} rotation-x={-Math.PI / 2}>
          <meshStandardMaterial
            map={ringTexture}
            color={b.color}
            transparent
            opacity={b.opacity}
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0}
            alphaTest={0.02}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function OrbitRings() {
  return (
    <group>
      {PLANETS.filter(p => p.id !== 'moon').map((p) => {
        const visualOrbitRadius = mapOrbitalDistanceToVisual(p.orbitRadius)
        return <OrbitalTrajectory key={`traj-${p.id}`} radius={visualOrbitRadius} bodyId={p.id} />
      })}
    </group>
  )
}

function StarField3D({ count = 4000 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 300 + Math.random() * 500
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  const sizes = useMemo(() => {
    const arr = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      arr[i] = Math.random() * 0.9 + 0.15
    }
    return arr
  }, [count])

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const palette = [
      [1.0, 1.0, 1.0], // blanc (dominant)
      [0.94, 0.97, 1.0], // bleu très léger
      [0.88, 0.98, 0.98], // cyan discret
      [1.0, 0.94, 0.82], // jaune/orange très léger
    ]
    const weights = [0.68, 0.13, 0.10, 0.09]
    const total = weights.reduce((a, b) => a + b, 0)
    const cumulative: number[] = []
    let acc = 0
    for (const w of weights) {
      acc += w / total
      cumulative.push(acc)
    }
    for (let i = 0; i < count; i++) {
      const rnd = Math.random()
      let idx = 0
      for (let j = 0; j < cumulative.length; j++) {
        if (rnd <= cumulative[j]) {
          idx = j
          break
        }
      }
      const c = palette[idx]
      const dim = 0.6 + Math.random() * 0.4
      arr[i * 3 + 0] = c[0] * dim
      arr[i * 3 + 1] = c[1] * dim
      arr[i * 3 + 2] = c[2] * dim
    }
    return arr
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        vertexColors
        size={0.8}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

function SolarSystemScene({
  selectedPlanet,
  onSelectPlanet,
  isPlaying,
  timeSpeed,
  focusTarget,
  focusPosition,
  isFocusing,
  onTransitionDone,
  controlsRef,
  onTimeUpdate,
  jplEarthPosition,
  jplMoonPosition,
  jplMercuryPosition,
  jplVenusPosition,
  jplMarsPosition,
  jplJupiterPosition,
  jplSaturnPosition,
  jplUranusPosition,
  jplNeptunePosition,
}: {
  selectedPlanet: Planet | null
  onSelectPlanet: (p: Planet) => void
  isPlaying: boolean
  timeSpeed: number
  focusTarget: string | null
  focusPosition: [number, number, number] | null
  isFocusing: boolean
  onTransitionDone: () => void
  controlsRef: React.RefObject<any>
  onTimeUpdate: (t: number) => void
  jplEarthPosition?: [number, number, number] | null
  jplMoonPosition?: [number, number, number] | null
  jplMercuryPosition?: [number, number, number] | null
  jplVenusPosition?: [number, number, number] | null
  jplMarsPosition?: [number, number, number] | null
  jplJupiterPosition?: [number, number, number] | null
  jplSaturnPosition?: [number, number, number] | null
  jplUranusPosition?: [number, number, number] | null
  jplNeptunePosition?: [number, number, number] | null
}) {
  const timeRef = useRef(0)
  const frameCount = useRef(0)

  const earthInitialRotationAngle = useMemo(() => {
    const earthAtEpoch = jplEarthPosition
      ? mapOrbitalPositionToVisual(jplEarthPosition)
      : mapOrbitalPositionToVisual(getBodyPosition(ORBITAL_BODY_BY_ID.get('earth')!, 0))
    return calculateInitialEarthRotationAngle(earthAtEpoch)
  }, [jplEarthPosition])

  useFrame((_, delta) => {
    if (isPlaying) {
      // delta est en secondes réelles ; simulationTime est en heures.
      // À ×1 : 1 s réelle = 1/3600 h = 1 s simulée (temps réel).
      timeRef.current += (delta * timeSpeed) / 3600
    }
    frameCount.current++
    if (frameCount.current % 6 === 0) {
      onTimeUpdate(timeRef.current)
    }

  })

  const jplPositions: Record<string, [number, number, number] | null | undefined> = {
    earth: jplEarthPosition,
    mercury: jplMercuryPosition,
    venus: jplVenusPosition,
    mars: jplMarsPosition,
    jupiter: jplJupiterPosition,
    saturn: jplSaturnPosition,
    uranus: jplUranusPosition,
    neptune: jplNeptunePosition,
  }
  const planetPositions: Record<string, [number, number, number]> = { sun: [0, 0, 0] }
  for (const planet of PLANETS) {
    if (planet.id === 'sun' || planet.id === 'moon') continue
    const jplPosition = jplPositions[planet.id]
    planetPositions[planet.id] = jplPosition
      ? mapOrbitalPositionToVisual(jplPosition)
      : getPlanetPosition(planet, timeRef.current)
  }
  const earthPosition = planetPositions.earth
  const moonOffset = jplMoonPosition
    ? mapOrbitalPositionToVisual(jplMoonPosition, true)
    : getMoonOffset(timeRef.current)
  planetPositions.moon = [
    earthPosition[0] + moonOffset[0],
    earthPosition[1] + moonOffset[1],
    earthPosition[2] + moonOffset[2],
  ]

  const { light: sunLight, pointLight, dayNightConfig, planetIllumination } = useSolarLighting(
    [0, 0, 0],
    planetPositions,
  )

  const handleSelectMoon = useCallback(() => {
    const moon = PLANETS.find(p => p.id === 'moon')!
    onSelectPlanet(moon)
  }, [onSelectPlanet])

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', mapOrbitalDistanceToVisual(200), mapOrbitalDistanceToVisual(600)]} />

      <ambientLight intensity={dayNightConfig.ambientIntensity} />
      <primitive object={sunLight} />
      <primitive object={pointLight} />

      <CameraController
        focusTarget={focusTarget}
        focusPosition={focusPosition}
        isFocusing={isFocusing}
        onTransitionDone={onTransitionDone}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.05}
        maxDistance={mapOrbitalDistanceToVisual(700)}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
        rotateSpeed={0.5}
        zoomSpeed={1.2}
      />

      <Sun
        timeRef={timeRef}
        selectedId={selectedPlanet?.id ?? null}
        onSelect={onSelectPlanet}
      />

      {PLANETS.filter(p => p.id !== 'moon' && p.id !== 'sun').map(p => {
        if (p.id === 'earth' && jplEarthPosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplEarthPosition}
              moonPositionOverride={jplMoonPosition}
              bodyType="earth"
              illuminated={planetIllumination.earth}
              moonIlluminated={planetIllumination.moon}
              initialRotationAngle={earthInitialRotationAngle}
            />
          )
        }
        if (p.id === 'mercury' && jplMercuryPosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplMercuryPosition}
              bodyType="mercury"
              illuminated={planetIllumination.mercury}
            />
          )
        }
        if (p.id === 'venus' && jplVenusPosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplVenusPosition}
              bodyType="venus"
              illuminated={planetIllumination.venus}
            />
          )
        }
        if (p.id === 'mars' && jplMarsPosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplMarsPosition}
              bodyType="mars"
              illuminated={planetIllumination.mars}
            />
          )
        }
        if (p.id === 'jupiter' && jplJupiterPosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplJupiterPosition}
              bodyType="jupiter"
              illuminated={planetIllumination.jupiter}
            />
          )
        }
        if (p.id === 'saturn' && jplSaturnPosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplSaturnPosition}
              bodyType="saturn"
              illuminated={planetIllumination.saturn}
            />
          )
        }
        if (p.id === 'uranus' && jplUranusPosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplUranusPosition}
              bodyType="uranus"
              illuminated={planetIllumination.uranus}
            />
          )
        }
        if (p.id === 'neptune' && jplNeptunePosition) {
          return (
            <Planet
              key={p.id}
              planet={p}
              time={timeRef.current}
              timeRef={timeRef}
              selectedId={selectedPlanet?.id ?? null}
              onSelect={onSelectPlanet}
              selectedMoon={selectedPlanet?.id === 'moon'}
              onSelectMoon={handleSelectMoon}
              positionOverride={jplNeptunePosition}
              bodyType="neptune"
              illuminated={planetIllumination.neptune}
            />
          )
        }
        return (
          <Planet
            key={p.id}
            planet={p}
            time={timeRef.current}
            timeRef={timeRef}
            selectedId={selectedPlanet?.id ?? null}
            onSelect={onSelectPlanet}
            selectedMoon={selectedPlanet?.id === 'moon'}
            onSelectMoon={handleSelectMoon}
            moonPositionOverride={p.id === 'earth' ? jplMoonPosition : undefined}
            bodyType={p.id as BodyType}
            illuminated={planetIllumination[p.id as keyof typeof planetIllumination]}
          />
        )
      })}

      <OrbitRings />
      <StarField3D count={4000} />
    </>
  )
}

// ── 2D UI Components ──────────────────────────────────────────────────────────

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.7 + 0.3,
    opacity: Math.random() * 0.5 + 0.12,
    delay: Math.random() * 7,
    duration: Math.random() * 3 + 2,
  }))
}

function StarField({ count = 120 }: { count?: number }) {
  const stars = useMemo(() => makeStars(count), [count])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  )
}

function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-xl border border-nk-cyan/10 shadow-2xl ${className}`}>
      {children}
    </div>
  )
}

function ObjectInfoPanel({
  planet,
  onClose,
  onFocus,
  simTime,
  jplPositions,
  planetPositions,
  sunDirection,
  subsolarPoint,
  isDetailOpen,
  onDetailToggle,
}: {
  planet: Planet | null
  onClose: () => void
  onFocus: () => void
  simTime: number
  jplPositions: Record<string, [number, number, number] | null | undefined>
  planetPositions: Record<string, [number, number, number]>
  sunDirection: THREE.Vector3 | null
  subsolarPoint: { latitude: number; longitude: number } | null
  isDetailOpen: boolean
  onDetailToggle: () => void
}) {
  if (!planet) return null
  const isMoon = planet.id === 'moon'
  const orbitalElements = getBodyOrbitalElements(planet.id)
  const position = planetPositions[planet.id]
  const jplPosition = jplPositions[planet.id]
  const hasJPL = !!jplPosition

  return (
    <GlassPanel className="p-4 w-64 md:w-[280px] max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0">
          <div className="text-[10px] font-mono text-nk-cyan/65 uppercase tracking-[0.15em] truncate">
            {planet.type}
          </div>
          <h3 className="text-xl font-display font-bold text-stellar mt-0.5 leading-tight">
            {planet.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-stellar-dim/50 hover:text-stellar w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-sm flex-shrink-0 ml-2"
        >
          ✕
        </button>
      </div>

      <div className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-white/3 border border-white/5">
        <div
          className="rounded-full flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            background: `radial-gradient(circle at 35% 30%, ${planet.color}cc, ${planet.color} 60%, ${planet.color}55)`,
            boxShadow: `0 0 18px 5px ${planet.glow}`,
          }}
        />
        <p className="text-[11px] text-stellar-dim leading-relaxed">{planet.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {([
          ['Distance', planet.id === 'sun' ? '—' : `${planet.distanceAU} AU`],
          ['Moons', planet.id === 'sun' ? '8 planets' : isMoon ? '0' : String(planet.moons)],
          ['Temperature', planet.tempC],
          ['Class', planet.type.split(' ').slice(-1)[0]],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="bg-white/5 rounded-lg p-2 border border-white/4">
            <div className="text-[9px] text-stellar-dim/45 font-mono uppercase tracking-wider">{label}</div>
            <div className="text-[11px] text-stellar font-mono mt-0.5 leading-snug">{value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onDetailToggle}
        className="w-full text-[11px] font-mono py-2 rounded-lg glass-light border border-white/10 text-stellar-dim hover:text-stellar hover:border-white/18 transition-all flex items-center justify-center gap-2"
      >
        {isDetailOpen ? 'Less Info' : 'More Info'}
        <span>{isDetailOpen ? '▲' : '▼'}</span>
      </button>

      {isDetailOpen && (
        <div className="mt-3 space-y-2 text-[10px] font-mono">
          <div className="text-nk-cyan/65 uppercase tracking-[0.15em] border-b border-white/10 pb-1">
            Astronomical Data
          </div>
          
          <div className="grid grid-cols-2 gap-1.5">
            {(() => {
              const rows: [string, string][] = [
                ['Diameter', `${(planet.radius * 2 * 6371).toFixed(0)} km`],
                ['Orbital Period', orbitalElements.period > 0 ? `${(orbitalElements.period / 24).toFixed(1)} days` : '—'],
                ['Rotation Period', planet.rotationPeriod ? `${planet.rotationPeriod.toFixed(2)} h` : '—'],
                ['Eccentricity', orbitalElements.eccentricity > 0 ? orbitalElements.eccentricity.toFixed(4) : '0 (circular)'],
                ['Inclination', orbitalElements.inclination > 0 ? `${(orbitalElements.inclination * 180 / Math.PI).toFixed(2)}°` : '0° (ecliptic)'],
                ['Semi-major Axis', orbitalElements.semiMajorAxis > 0 ? `${orbitalElements.semiMajorAxis.toFixed(3)} AU` : '—'],
              ]
              
              if (position) {
                const dist = Math.sqrt(position[0]**2 + position[1]**2 + position[2]**2)
                rows.push(['Current Distance', `${dist.toFixed(2)} scene units`])
              }
              
              if (hasJPL && jplPosition) {
                const jplDist = Math.sqrt(jplPosition[0]**2 + jplPosition[1]**2 + jplPosition[2]**2)
                rows.push(['JPL Distance', `${jplDist.toFixed(6)} AU`])
              }
              
              if (planet.id === 'earth' && subsolarPoint) {
                rows.push(['Subsolar Lat', `${subsolarPoint.latitude.toFixed(2)}°`])
                rows.push(['Subsolar Lon', `${subsolarPoint.longitude.toFixed(2)}°`])
              }
              
              if (orbitalElements.period > 0 && orbitalElements.semiMajorAxis > 0) {
                const orbitalSpeed = 2 * Math.PI * orbitalElements.semiMajorAxis / (orbitalElements.period / 24) * 29.78 / Math.sqrt(orbitalElements.semiMajorAxis)
                rows.push(['Orbital Speed', `${orbitalSpeed.toFixed(2)} km/s`])
              }

              return rows.map(([label, value]) => (
                <div key={label} className="bg-white/5 rounded-lg p-2 border border-white/4 col-span-2">
                  <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">{label}</div>
                  <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{value}</div>
                </div>
              ))
            })()}
          </div>

          <div className="text-nk-cyan/65 uppercase tracking-[0.15em] border-b border-white/10 pb-1 mt-2">
            Time & Position
          </div>
          
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded-lg p-2 border border-white/4 col-span-2">
              <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">Local Time</div>
              <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{formatLocalTime(simulationTimeToUTC(simTime))}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/4 col-span-2">
              <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">UTC</div>
              <div className="text-[10px] text-stellar/70 font-mono mt-0.5 leading-snug">{formatUTCTime(simulationTimeToUTC(simTime))}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/4 col-span-2">
              <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">Sim Time</div>
              <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{simTime >= 0 ? '+' : ''}{simTime.toFixed(1)} h from epoch</div>
            </div>
            {position && (
              <>
                <div className="bg-white/5 rounded-lg p-2 border border-white/4">
                  <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">X</div>
                  <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{position[0].toFixed(3)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/4">
                  <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">Y</div>
                  <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{position[1].toFixed(3)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/4">
                  <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">Z</div>
                  <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{position[2].toFixed(3)}</div>
                </div>
              </>
            )}
            {sunDirection && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/4 col-span-2">
                <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">Sun Dir</div>
                <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">({sunDirection.x.toFixed(3)}, {sunDirection.y.toFixed(3)}, {sunDirection.z.toFixed(3)})</div>
              </div>
            )}
            {planet.id === 'earth' && subsolarPoint && (
              <>
                <div className="bg-white/5 rounded-lg p-2 border border-white/4">
                  <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">Subsolar Lat</div>
                  <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{subsolarPoint.latitude.toFixed(2)}°</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/4">
                  <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">Subsolar Lon</div>
                  <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{subsolarPoint.longitude.toFixed(2)}°</div>
                </div>
              </>
            )}
            <div className="bg-white/5 rounded-lg p-2 border border-white/4 col-span-2">
              <div className="text-[9px] text-stellar-dim/45 uppercase tracking-wider">JPL Status</div>
              <div className="text-[10px] text-stellar font-mono mt-0.5 leading-snug">{hasJPL ? 'Active' : 'Fallback (orbital model)'}</div>
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  )
}

function TimeControlBar({
  isPlaying,
  onToggle,
  speed,
  onSpeedChange,
  simTime,
}: {
  isPlaying: boolean
  onToggle: () => void
  speed: number
  onSpeedChange: (v: number) => void
  simTime: number
}) {
  const presets = [
    { v: 0.1, label: '×0.1' },
    { v: 1, label: '×1' },
    { v: 5, label: '×5' },
    { v: 10, label: '×10' },
  ]

  const utcDate = simulationTimeToUTC(simTime)
  const localString = formatLocalTime(utcDate)
  const utcString = formatUTCTime(utcDate)

  return (
    <GlassPanel className="px-4 py-2.5 flex items-center gap-4 flex-wrap">
      <div className="text-[10px] font-mono leading-tight flex-shrink-0">
        <div className="text-nk-cyan/50 uppercase tracking-[0.12em]">Local Time</div>
        <div className="text-stellar mt-0.5">{localString}</div>
      </div>

      <div className="w-px h-7 bg-white/8 flex-shrink-0" />

      <div className="text-[10px] font-mono leading-tight flex-shrink-0">
        <div className="text-nk-cyan/50 uppercase tracking-[0.12em]">UTC</div>
        <div className="text-stellar/70 mt-0.5">{utcString}</div>
      </div>

      <div className="w-px h-7 bg-white/8 flex-shrink-0" />

      <button
        onClick={onToggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
          isPlaying
            ? 'bg-nk-cyan/20 border border-nk-cyan/40 text-nk-cyan hover:bg-nk-cyan/30 shadow-[0_0_10px_rgba(0,216,255,0.2)]'
            : 'bg-white/10 border border-white/20 text-stellar hover:bg-white/15'
        }`}
      >
        <span className="text-[11px]">{isPlaying ? '⏸' : '▶'}</span>
      </button>

      <div className="flex gap-1">
        {presets.map(({ v, label }) => (
          <button
            key={v}
            className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all ${
              Math.abs(speed - v) < 0.06
                ? 'bg-nk-cyan/20 text-nk-cyan border border-nk-cyan/30'
                : 'text-stellar-dim hover:text-stellar glass-light border border-white/8 hover:border-white/18'
            }`}
            onClick={() => onSpeedChange(v)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-7 bg-white/8 flex-shrink-0 hidden sm:block" />

      <div className="hidden sm:flex items-center gap-2">
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={speed}
          onChange={e => onSpeedChange(parseFloat(e.target.value))}
          className="w-20"
        />
        <span className="text-[10px] font-mono text-nk-cyan w-8 flex-shrink-0">×{speed.toFixed(1)}</span>
      </div>
    </GlassPanel>
  )
}

function PlanetSelector({ selected, onSelect }: { selected: Planet | null; onSelect: (p: Planet) => void }) {
  return (
    <GlassPanel className="py-2 px-1.5 flex flex-col gap-0.5">
      <div className="text-[10px] font-mono text-nk-cyan/55 uppercase tracking-[0.15em] px-2 py-1">
        Objects
      </div>
      {[SUN, ...PLANETS].map((p, i) => (
        <button
          key={p.id}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all w-full text-left border ${
            selected?.id === p.id
              ? 'bg-nk-cyan/12 border-nk-cyan/28 shadow-[0_0_8px_rgba(0,216,255,0.1)]'
              : 'hover:bg-white/5 border-transparent'
          } ${i === 0 ? 'mb-0.5' : ''}`}
          onClick={() => onSelect(p)}
        >
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: p.id === 'sun' ? 10 : 8,
              height: p.id === 'sun' ? 10 : 8,
              background: p.color,
              boxShadow: `0 0 5px ${p.glow}`,
            }}
          />
          <span className="text-[11px] font-mono text-stellar-dim">{p.name}</span>
          {selected?.id === p.id && (
            <span className="ml-auto w-1 h-1 rounded-full bg-nk-cyan animate-pulse" />
          )}
        </button>
      ))}
    </GlassPanel>
  )
}

function CoordinateDisplay({ selectedPlanet, time }: { selectedPlanet: Planet | null; time: number }) {
  const pos = selectedPlanet ? getPlanetPosition(selectedPlanet, time) : null
  const dist = pos ? Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]) : 0

  return (
    <GlassPanel className="p-3">
      <div className="text-[10px] font-mono text-nk-cyan/55 uppercase tracking-[0.15em] mb-1.5">
        Position
      </div>
      <div className="space-y-0.5 text-[11px] font-mono">
        {[
          ['RA', selectedPlanet?.id === 'sun' ? '—' : `${(pos?.[0] ?? 0).toFixed(2)} AU`],
          ['Dec', selectedPlanet?.id === 'sun' ? '—' : `${(pos?.[2] ?? 0).toFixed(2)} AU`],
          ['Dist', selectedPlanet ? `${(selectedPlanet.distanceAU || dist * 0.01).toFixed(3)} AU` : '—'],
          ['Vel', selectedPlanet?.id === 'sun' ? '—' : `${(29.78 / Math.sqrt(Math.max(selectedPlanet?.distanceAU ?? 1, 0.01))).toFixed(2)} km/s`],
        ].map(([k, v]) => (
          <div key={k}>
            <span className="text-stellar-dim/45">{k} </span>
            <span className="text-stellar">{v}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}

function DiscoveryHint({ visible }: { visible: boolean }) {
  return (
    <div
      className={`transition-all duration-400 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
      }`}
    >
      <GlassPanel className="px-4 py-2.5 flex items-center gap-3 border-white/8">
        <div className="w-1.5 h-1.5 rounded-full bg-nk-cyan/45 animate-pulse flex-shrink-0" />
        <span className="text-[11px] font-mono text-stellar-dim/50">
          Click any object to explore
        </span>
      </GlassPanel>
    </div>
  )
}

function ExplorerStatusBar({ selectedPlanet, isPlaying }: { selectedPlanet: Planet | null; isPlaying: boolean }) {
  return (
    <div className="absolute bottom-0 inset-x-0 h-7 flex items-center px-5 justify-between pointer-events-none z-10">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(1,6,16,0.7), transparent)' }}
      />
      <div className="relative flex items-center gap-4 text-[9px] font-mono text-stellar-dim/28 uppercase tracking-[0.15em]">
        <span>{PLANETS.length + 1} objects</span>
        <span className="text-stellar-dim/15">·</span>
        <span>4.6 Gyr</span>
        <span className="text-stellar-dim/15">·</span>
        <span>Ecliptic plane</span>
        {selectedPlanet && (
          <>
            <span className="text-stellar-dim/15">·</span>
            <span className="text-nk-cyan/40">Tracking: {selectedPlanet.name}</span>
          </>
        )}
      </div>
      <div className="relative flex items-center gap-2 text-[9px] font-mono text-stellar-dim/20">
        <span
          className="w-1 h-1 rounded-full flex-shrink-0"
          style={{ background: isPlaying ? 'rgba(0,216,255,0.4)' : 'rgba(122,156,196,0.3)' }}
        />
        <span>{isPlaying ? 'LIVE' : 'PAUSED'}</span>
      </div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#hero', label: 'Home' },
    { href: '#explorer', label: 'Explorer' },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: scrolled
              ? 'rgba(2,8,19,0.82)'
              : 'linear-gradient(to bottom, rgba(1,6,16,0.55) 0%, rgba(2,8,19,0.2) 100%)',
            backdropFilter: scrolled ? 'blur(22px) saturate(160%)' : 'none',
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-px transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0,216,255,0.18) 25%, rgba(0,216,255,0.38) 50%, rgba(0,216,255,0.18) 75%, transparent 100%)',
            opacity: scrolled ? 1 : 0,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2.5 group flex-shrink-0">
          <img
            src={nekoLogo}
            alt="Neko Eyes — space cat logo"
            className="w-9 h-9 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(0,216,255,0.6)]"
          />
          <span className="font-display font-semibold text-lg tracking-wide text-stellar leading-none">
            Neko<span className="text-nk-cyan"> Eyes</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-mono px-4 py-2 rounded-lg text-stellar-dim hover:text-stellar hover:bg-white/6 transition-all duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-[10px] font-mono text-stellar-dim/25 border border-white/8 px-2 py-1 rounded">
            V0
          </span>
          <a
            href="#explorer"
            className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-lg bg-nk-cyan/15 border border-nk-cyan/30 text-nk-cyan hover:bg-nk-cyan/25 hover:shadow-[0_0_20px_rgba(0,216,255,0.2)] transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-nk-cyan animate-pulse" />
            Launch Explorer
          </a>
        </div>

        <button
          className="md:hidden text-stellar p-2 flex flex-col gap-1.5 items-center justify-center w-9 h-9"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <span className="text-xl leading-none text-stellar-dim">✕</span>
          ) : (
            <>
              <div className="w-5 h-px bg-stellar" />
              <div className="w-5 h-px bg-stellar" />
              <div className="w-5 h-px bg-stellar" />
            </>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t border-nk-cyan/8 px-6 py-4 flex flex-col gap-1"
          style={{ background: 'rgba(2,8,19,0.95)', backdropFilter: 'blur(24px)' }}
        >
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-sm py-3 px-2 text-stellar-dim hover:text-stellar border-b border-white/5 transition-colors last:border-b-0"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#explorer"
            className="mt-3 text-center font-mono text-sm py-3 rounded-xl bg-nk-cyan/15 border border-nk-cyan/30 text-nk-cyan"
            onClick={() => setMobileOpen(false)}
          >
            Launch Explorer
          </a>
        </div>
      )}
    </header>
  )
}

// ── HeroSection ───────────────────────────────────────────────────────────────

function HeroSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  const fade = (delay: string) =>
    `transition-all duration-700 ${delay} ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`

  return (
    <section id="hero" className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-space-950">
        <img
          src="https://images.unsplash.com/photo-1677926405168-fa86268b7295?w=1920&h=1080&fit=crop&auto=format"
          alt="Carina Nebula deep sky background"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.52 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-space-950/65 via-space-950/22 to-space-950/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-space-950/50 via-transparent to-space-950/50" />
      </div>

      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-space-950/70 to-transparent pointer-events-none z-10" />

      <StarField count={180} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.07 }}>
        <line x1="8%" y1="22%" x2="14%" y2="35%" stroke="white" strokeWidth="0.5" />
        <line x1="14%" y1="35%" x2="11%" y2="48%" stroke="white" strokeWidth="0.5" />
        <line x1="11%" y1="48%" x2="18%" y2="55%" stroke="white" strokeWidth="0.5" />
        <circle cx="8%" cy="22%" r="1.8" fill="white" />
        <circle cx="14%" cy="35%" r="2.2" fill="white" />
        <circle cx="11%" cy="48%" r="1.5" fill="white" />
        <circle cx="18%" cy="55%" r="2" fill="white" />
        <line x1="82%" y1="18%" x2="88%" y2="28%" stroke="white" strokeWidth="0.5" />
        <line x1="88%" y1="28%" x2="92%" y2="20%" stroke="white" strokeWidth="0.5" />
        <line x1="92%" y1="20%" x2="87%" y2="12%" stroke="white" strokeWidth="0.5" />
        <circle cx="82%" cy="18%" r="2" fill="white" />
        <circle cx="88%" cy="28%" r="2.5" fill="white" />
        <circle cx="92%" cy="20%" r="1.8" fill="white" />
        <circle cx="87%" cy="12%" r="1.5" fill="white" />
      </svg>

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center">
        <div className={`${fade('delay-0')} relative inline-flex items-center justify-center mb-7`}>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: loaded ? 128 : 120,
              height: loaded ? 128 : 120,
              border: '1px solid rgba(0,216,255,0.22)',
              animation: 'spin 10s linear infinite',
              transition: 'width 0.7s, height 0.7s',
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                top: -3,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#00d8ff',
                boxShadow: '0 0 8px rgba(0,216,255,0.8)',
              }}
            />
          </div>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 104,
              height: 104,
              border: '1px solid rgba(0,216,255,0.1)',
              animation: 'spin-reverse 16s linear infinite',
            }}
          />
          <img
            src={nekoLogo}
            alt="Neko Eyes — space cat with orbital rings"
            className="w-24 h-24 md:w-28 md:h-28 object-contain relative z-10"
            style={{
              filter:
                'drop-shadow(0 0 20px rgba(0,216,255,0.4)) drop-shadow(0 0 60px rgba(68,138,255,0.25))',
            }}
          />
        </div>

        <div className={fade('delay-75')}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-nk-cyan/22 bg-nk-cyan/7 text-nk-cyan text-[11px] font-mono uppercase tracking-[0.15em] mb-7">
            <div className="w-1.5 h-1.5 rounded-full bg-nk-cyan animate-pulse" />
            Solar System Explorer · V0
          </div>
        </div>

        <h1 className={`${fade('delay-100')} font-display font-bold leading-none mb-4`}>
          <span className="block text-6xl md:text-8xl text-stellar">Neko</span>
          <span
            className="block text-7xl md:text-9xl"
            style={{
              background: 'linear-gradient(135deg, #7df9ff 0%, #00d8ff 40%, #448aff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Eyes
          </span>
        </h1>

        <p className={`${fade('delay-150')} text-base md:text-lg text-stellar-dim leading-relaxed max-w-md mx-auto mb-10`}>
          Traverse the Solar System in real time. Explore planetary orbits, discover celestial bodies, and journey across 4.5 billion years of cosmic history.
        </p>

        <div className={`${fade('delay-200')} flex flex-col sm:flex-row items-center justify-center gap-3`}>
          <a
            href="#explorer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-sm font-semibold bg-nk-cyan text-space-900 hover:bg-[#22e3ff] transition-all hover:shadow-[0_0_28px_rgba(0,216,255,0.5)] active:scale-95"
          >
            Begin Exploration
            <span className="text-base">→</span>
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-35">
        <span className="text-[10px] font-mono text-stellar-dim uppercase tracking-[0.2em]">Scroll</span>
        <div
          className="w-px h-10 bg-gradient-to-b from-stellar-dim to-transparent"
          style={{ animation: 'orbit-glow 2.5s ease-in-out infinite' }}
        />
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-space-900 to-transparent pointer-events-none" />
    </section>
  )
}

// ── ExplorerSection ───────────────────────────────────────────────────────────

function ExplorerSection() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [timeSpeed, setTimeSpeed] = useState(1)
  const [focusTarget, setFocusTarget] = useState<string | null>(null)
  const [focusPosition, setFocusPosition] = useState<[number, number, number] | null>(null)
  const [isFocusing, setIsFocusing] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [simTime, setSimTime] = useState(0)
  // Identifiant du jour simulé (UTC) : les requêtes JPL sont throttlées à la
  // granularité jour pour éviter tout fetch réseau dans la boucle de rendu.
  const jplDayId = simulationTimeToDayId(simTime)
  const [jplEarthPosition, setJplEarthPosition] = useState<[number, number, number] | null>(null)
  const [jplMoonPosition, setJplMoonPosition] = useState<[number, number, number] | null>(null)
  const [jplMercuryPosition, setJplMercuryPosition] = useState<[number, number, number] | null>(null)
  const [jplVenusPosition, setJplVenusPosition] = useState<[number, number, number] | null>(null)
  const [jplMarsPosition, setJplMarsPosition] = useState<[number, number, number] | null>(null)
  const [jplJupiterPosition, setJplJupiterPosition] = useState<[number, number, number] | null>(null)
  const [jplSaturnPosition, setJplSaturnPosition] = useState<[number, number, number] | null>(null)
  const [jplUranusPosition, setJplUranusPosition] = useState<[number, number, number] | null>(null)
  const [jplNeptunePosition, setJplNeptunePosition] = useState<[number, number, number] | null>(null)
  const controlsRef = useRef<any>(null)

  const handleSelectPlanet = useCallback((p: Planet) => {
    setIsDetailOpen(false)
    setSelectedPlanet(p)
  }, [])

  const handleFocus = useCallback(() => {
    if (!selectedPlanet) return
    let pos: [number, number, number]

    if (selectedPlanet.id === 'moon') {
      const earthPos = getPlanetPosition(
        PLANETS.find(p => p.id === 'earth')!,
        simTime,
      )
      const moonOff = getMoonOffset(simTime)
      pos = [
        earthPos[0] + moonOff[0],
        earthPos[1] + moonOff[1],
        earthPos[2] + moonOff[2],
      ]
    } else if (selectedPlanet.id === 'earth' && jplEarthPosition) {
      pos = mapOrbitalPositionToVisual(jplEarthPosition)
    } else if (selectedPlanet.id === 'mercury' && jplMercuryPosition) {
      pos = mapOrbitalPositionToVisual(jplMercuryPosition)
    } else if (selectedPlanet.id === 'venus' && jplVenusPosition) {
      pos = mapOrbitalPositionToVisual(jplVenusPosition)
    } else if (selectedPlanet.id === 'mars' && jplMarsPosition) {
      pos = mapOrbitalPositionToVisual(jplMarsPosition)
    } else if (selectedPlanet.id === 'jupiter' && jplJupiterPosition) {
      pos = mapOrbitalPositionToVisual(jplJupiterPosition)
    } else if (selectedPlanet.id === 'saturn' && jplSaturnPosition) {
      pos = mapOrbitalPositionToVisual(jplSaturnPosition)
    } else if (selectedPlanet.id === 'uranus' && jplUranusPosition) {
      pos = mapOrbitalPositionToVisual(jplUranusPosition)
    } else if (selectedPlanet.id === 'neptune' && jplNeptunePosition) {
      pos = mapOrbitalPositionToVisual(jplNeptunePosition)
    } else {
      pos = getPlanetPosition(selectedPlanet, simTime)
    }

    setFocusTarget(selectedPlanet.id)
    setFocusPosition(pos)
    setIsFocusing(true)
  }, [selectedPlanet, simTime, jplEarthPosition, jplMercuryPosition, jplVenusPosition, jplMarsPosition, jplJupiterPosition, jplSaturnPosition, jplUranusPosition, jplNeptunePosition])

  const handleTransitionDone = useCallback(() => {
    setIsFocusing(false)
  }, [])

  // Focus automatique : quand un objet est sélectionné,
  // appeler handleFocus pour lancer la transition caméra.
  // On vérifie !isFocusing pour éviter de relancer une transition
  // si le Focus est déjà actif (ex. bouton manuel).
  useEffect(() => {
    if (selectedPlanet && !isFocusing) {
      handleFocus()
    }
  }, [selectedPlanet])

  // Fetch JPL Earth position when simulated DATE changes (throttled to 1 fetch per day)
  useEffect(() => {
    ;(async () => {
      try {
        const provider = new JPLProvider()
        const state = await provider.getState('earth', simTime)
        if (state && state.position) {
          const converted: [number, number, number] = [
            state.position[0] * 55,
            state.position[1] * 55,
            state.position[2] * 55,
          ]
          setJplEarthPosition(converted)
        }
      } catch (e) {
        setJplEarthPosition(null)
      }
    })()
  }, [jplDayId])

  // Fetch JPL Moon position when simulated DATE changes (throttled to 1 fetch per day)
  useEffect(() => {
    ;(async () => {
      try {
        const provider = new JPLProvider()
        const state = await provider.getState('moon', simTime)
        if (state && state.position) {
          // JPL Moon (ID 301) renvoie position en unités géocentriques (relative à la Terre)
          setJplMoonPosition([state.position[0], state.position[1], state.position[2]])
        } else {
          setJplMoonPosition(null)
        }
      } catch (e) {
        setJplMoonPosition(null)
      }
    })()
  }, [jplDayId])

  // Fetch JPL positions for all planets when simulated DATE changes (throttled to 1 fetch per day)
  useEffect(() => {
    ;(async () => {
      const provider = new JPLProvider()
      const promises = [
        provider.getState('mercury', simTime),
        provider.getState('venus', simTime),
        provider.getState('earth', simTime),
        provider.getState('mars', simTime),
        provider.getState('jupiter', simTime),
        provider.getState('saturn', simTime),
        provider.getState('uranus', simTime),
        provider.getState('neptune', simTime),
      ]
      const results = await Promise.all(promises)

      if (results[0] && results[0].position) {
        setJplMercuryPosition([results[0].position[0] * 55, results[0].position[1] * 55, results[0].position[2] * 55])
      }
      if (results[1] && results[1].position) {
        setJplVenusPosition([results[1].position[0] * 55, results[1].position[1] * 55, results[1].position[2] * 55])
      }
      if (results[2] && results[2].position) {
        setJplEarthPosition([results[2].position[0] * 55, results[2].position[1] * 55, results[2].position[2] * 55])
      }
      if (results[3] && results[3].position) {
        setJplMarsPosition([results[3].position[0] * 55, results[3].position[1] * 55, results[3].position[2] * 55])
      }
      if (results[4] && results[4].position) {
        setJplJupiterPosition([results[4].position[0] * 55, results[4].position[1] * 55, results[4].position[2] * 55])
      }
      if (results[5] && results[5].position) {
        setJplSaturnPosition([results[5].position[0] * 55, results[5].position[1] * 55, results[5].position[2] * 55])
      }
      if (results[6] && results[6].position) {
        setJplUranusPosition([results[6].position[0] * 55, results[6].position[1] * 55, results[6].position[2] * 55])
      }
      if (results[7] && results[7].position) {
        setJplNeptunePosition([results[7].position[0] * 55, results[7].position[1] * 55, results[7].position[2] * 55])
      }
    })()
  }, [jplDayId])

  const planetPositions = useMemo((): Record<string, [number, number, number]> => {
    const positions: Record<string, [number, number, number]> = { sun: [0, 0, 0] }
    const jplPositionsMap: Record<string, [number, number, number] | null | undefined> = {
      earth: jplEarthPosition,
      mercury: jplMercuryPosition,
      venus: jplVenusPosition,
      mars: jplMarsPosition,
      jupiter: jplJupiterPosition,
      saturn: jplSaturnPosition,
      uranus: jplUranusPosition,
      neptune: jplNeptunePosition,
    }
    for (const planet of PLANETS) {
      if (planet.id === 'sun' || planet.id === 'moon') continue
      const jplPos = jplPositionsMap[planet.id]
      positions[planet.id] = jplPos
        ? mapOrbitalPositionToVisual(jplPos)
        : getPlanetPosition(planet, simTime)
    }
    const earthPos = positions.earth
    const moonOffset = jplMoonPosition
      ? mapOrbitalPositionToVisual(jplMoonPosition, true)
      : getMoonOffset(simTime)
    positions.moon = [
      earthPos[0] + moonOffset[0],
      earthPos[1] + moonOffset[1],
      earthPos[2] + moonOffset[2],
    ]
    return positions
  }, [simTime, jplEarthPosition, jplMercuryPosition, jplVenusPosition, jplMarsPosition, jplJupiterPosition, jplSaturnPosition, jplUranusPosition, jplNeptunePosition, jplMoonPosition])

  const sunDirection = useMemo(() => {
    const earthPos = planetPositions.earth
    return new THREE.Vector3(-earthPos[0], -earthPos[1], -earthPos[2]).normalize()
  }, [planetPositions])

  const subsolarPoint = useMemo(() => {
    return calculateSubsolarPoint(simTime, planetPositions.earth)
  }, [simTime, planetPositions])

  const dayNightConfig = useMemo(() => ({
    hasDaylight: true,
    daylightDirection: sunDirection,
    ambientIntensity: 0.02,
    directIntensity: 2.8,
  }), [sunDirection])

  return (
    <section id="explorer" className="relative h-screen overflow-hidden">
      {/* 3D Solar System */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [80, 60, 80], fov: 50, near: 0.05, far: 10000 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <SolarSystemScene
            selectedPlanet={selectedPlanet}
            onSelectPlanet={handleSelectPlanet}
            isPlaying={isPlaying}
            timeSpeed={timeSpeed}
            focusTarget={focusTarget}
            focusPosition={focusPosition}
            isFocusing={isFocusing}
            onTransitionDone={handleTransitionDone}
            controlsRef={controlsRef}
            onTimeUpdate={setSimTime}
            jplEarthPosition={jplEarthPosition}
            jplMoonPosition={jplMoonPosition}
            jplMercuryPosition={jplMercuryPosition}
            jplVenusPosition={jplVenusPosition}
            jplMarsPosition={jplMarsPosition}
            jplJupiterPosition={jplJupiterPosition}
            jplSaturnPosition={jplSaturnPosition}
            jplUranusPosition={jplUranusPosition}
            jplNeptunePosition={jplNeptunePosition}
          />
        </Canvas>
      </div>

      <ExplorerStatusBar selectedPlanet={selectedPlanet} isPlaying={isPlaying} />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-nk-cyan/30 uppercase tracking-[0.2em] pointer-events-none z-10 select-none">
        Neko Eyes · Solar System Explorer · v0.1
      </div>

      <div className="absolute top-9 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="flex items-center gap-2 text-[11px] font-mono text-stellar-dim/35">
          <span>Solar System</span>
          {selectedPlanet && (
            <>
              <span className="text-stellar-dim/20">›</span>
              <span className="text-nk-cyan/55">{selectedPlanet.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Floating UI */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <DiscoveryHint visible={!selectedPlanet} />
        </div>

        {/* Right sidebar — panels grouped for responsive layout */}
        <div
          className={`absolute top-16 right-4 pointer-events-auto flex flex-col gap-3 transition-all duration-350 lg:flex-row lg:items-start ${
            selectedPlanet ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
        >
          <ObjectInfoPanel
            planet={selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
            onFocus={handleFocus}
            simTime={simTime}
            jplPositions={{
              earth: jplEarthPosition,
              mercury: jplMercuryPosition,
              venus: jplVenusPosition,
              mars: jplMarsPosition,
              jupiter: jplJupiterPosition,
              saturn: jplSaturnPosition,
              uranus: jplUranusPosition,
              neptune: jplNeptunePosition,
              moon: jplMoonPosition,
            }}
            planetPositions={planetPositions}
            sunDirection={sunDirection}
            subsolarPoint={selectedPlanet?.id === 'earth' ? subsolarPoint : null}
            isDetailOpen={isDetailOpen}
            onDetailToggle={() => setIsDetailOpen(prev => !prev)}
          />
          <div className="hidden sm:block">
            <CoordinateDisplay selectedPlanet={selectedPlanet} time={simTime} />
          </div>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-auto hidden lg:block">
          <PlanetSelector selected={selectedPlanet} onSelect={handleSelectPlanet} />
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
          <TimeControlBar
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying(p => !p)}
            speed={timeSpeed}
            onSpeedChange={setTimeSpeed}
            simTime={simTime}
          />
        </div>

        <div className="absolute bottom-24 right-4 pointer-events-auto lg:hidden">
          <GlassPanel className="p-2">
            <div className="text-[10px] font-mono text-nk-cyan/50 uppercase tracking-widest px-1 mb-1">
              Objects
            </div>
            <div className="flex flex-col gap-0.5">
              {[SUN, ...PLANETS].slice(0, 6).map(p => (
                <button
                  key={p.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 transition-all"
                  onClick={() => handleSelectPlanet(p)}
                >
                  <div className="rounded-full w-2 h-2 flex-shrink-0" style={{ background: p.color }} />
                  <span className="text-[10px] font-mono text-stellar-dim">{p.name}</span>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-space-950 border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <img src={nekoLogo} alt="Neko Eyes logo" className="w-7 h-7 object-contain opacity-75" />
          <span className="font-display font-semibold text-stellar text-sm">
            Neko<span className="text-nk-cyan"> Eyes</span>
          </span>
          <span className="text-[10px] font-mono text-stellar-dim/22 border border-white/6 px-2 py-0.5 rounded">
            V0
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-stellar-dim/30">
          <span>Solar System Explorer</span>
          <span className="text-stellar-dim/15">·</span>
          <span>Conception UI/UX</span>
          <span className="text-stellar-dim/15">·</span>
          <span>2025</span>
        </div>
        <div className="text-[10px] font-mono text-stellar-dim/22">
          React 19 · Tailwind CSS v4 · Three.js
        </div>
      </div>
    </footer>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  runGeoProjectionSelftest()

  return (
    <div className="min-h-screen bg-space-900">
      <Header />
      <main>
        <HeroSection />
        <ExplorerSection />
      </main>
      <Footer />
    </div>
  )
}
