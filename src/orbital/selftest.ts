import { getBodyPosition, defineOrbitalSystem, type OrbitalBody, type OrbitalBodyDefinition, type Vec3 } from "./index.ts"

const TAU = Math.PI * 2

// Définitions orbitales avec hiérarchie parent → enfant
// Basées sur les paramètres existants de la V0, avec parentId ajouté pour la Lune → Terre
const orbitalDefinitions: OrbitalBodyDefinition[] = [
  // Soleil (racine)
  {
    id: "sun",
    orbitalRadius: 0,
    orbitalPeriod: 0,
    phase: 0,
    rotationPeriod: undefined,
  },
  // Mercure
  {
    id: "mercury",
    orbitalRadius: 28,
    orbitalPeriod: 3,
    phase: 0.12 * TAU,
    rotationPeriod: undefined,
  },
  // Vénus
  {
    id: "venus",
    orbitalRadius: 40,
    orbitalPeriod: 7.5,
    phase: 0.42 * TAU,
    rotationPeriod: undefined,
  },
  // Terre avec Lune en enfant
  {
    id: "earth",
    orbitalRadius: 55,
    orbitalPeriod: 10,
    phase: 0.70 * TAU,
    rotationPeriod: undefined,
    parentId: "sun",
  },
  // Lune orbite autour de la Terre
  {
    id: "moon",
    orbitalRadius: 7,
    orbitalPeriod: 2.7,
    phase: 0 * TAU,
    rotationPeriod: undefined,
    parentId: "earth",
  },
  // Mars
  {
    id: "mars",
    orbitalRadius: 70,
    orbitalPeriod: 18.8,
    phase: 0.25 * TAU,
    rotationPeriod: undefined,
  },
  // Jupiter
  {
    id: "jupiter",
    orbitalRadius: 95,
    orbitalPeriod: 50,
    phase: 0.58 * TAU,
    rotationPeriod: undefined,
  },
  // Saturne
  {
    id: "saturn",
    orbitalRadius: 120,
    orbitalPeriod: 120,
    phase: 0.82 * TAU,
    rotationPeriod: undefined,
  },
  // Uranus
  {
    id: "uranus",
    orbitalRadius: 145,
    orbitalPeriod: 250,
    phase: 0.35 * TAU,
    rotationPeriod: undefined,
  },
  // Neptune
  {
    id: "neptune",
    orbitalRadius: 168,
    orbitalPeriod: 500,
    phase: 0.55 * TAU,
    rotationPeriod: undefined,
  },
]

// Construction du système hiérarchique
const bodies = defineOrbitalSystem(orbitalDefinitions)

// Vérification que la hiérarchie Terre → Lune est correcte
function findBody(id: string): OrbitalBody | null {
  return bodies.find((b) => b.id === id) ?? null
}

function test() {
  let passed = 0
  let failed = 0

  // 1. Soleil existe et n'a pas de parent
  const sun = findBody("sun")
  if (sun && sun.parent === undefined) {
    console.log("✓ Soleil : existe, pas de parent")
    passed++
  } else {
    console.log("✗ Soleil : échec")
    failed++
  }

  // 2. Terre a Soleil comme parent
  const earth = findBody("earth")
  if (earth && earth.parent?.id === "sun") {
    console.log("✓ Terre : parent = Soleil")
    passed++
  } else {
    console.log("✗ Terre : parent incorrect", earth?.parent)
    failed++
  }

  // 3. Lune a Terre comme parent
  const moon = findBody("moon")
  if (moon && moon.parent?.id === "earth") {
    console.log("✓ Lune : parent = Terre")
    passed++
  } else {
    console.log("✗ Lune : parent incorrect", moon?.parent)
    failed++
  }

  // 4. Position Lune absolue inclut position Terre
  if (moon && earth) {
    const simTime = 100
    const moonPos = getBodyPosition(moon, simTime) as [number, number, number]
    const earthPos = getBodyPosition(earth, simTime) as [number, number, number]
    // La position de la Lune doit être proche de Terre + offset orbital
    const distToEarth = Math.sqrt(
      Math.pow(moonPos[0] - earthPos[0], 2) +
      Math.pow(moonPos[1] - earthPos[1], 2) +
      Math.pow(moonPos[2] - earthPos[2], 2)
    )
    if (distToEarth <= moon.orbitalRadius * 1.1) {
      console.log(`✓ Position Lune : distance à Terre ≈ ${distToEarth.toFixed(2)} (≤ ${moon.orbitalRadius} + epsilon)`)
      passed++
    } else {
      console.log(`✗ Position Lune : distance à Terre = ${distToEarth.toFixed(2)}, attendu ≤ ${moon.orbitalRadius}`)
      failed++
    }
  }

  // 5. Périodicité Soleil (period = 0)
  const sunBody = findBody("sun")
  if (sunBody && sunBody.orbitalPeriod === 0) {
    console.log("✓ Soleil : period = 0")
    passed++
  } else {
    console.log("✗ Soleil : period incorrect")
    failed++
  }

  // 6. Terre period = 10
  if (earth && earth.orbitalPeriod === 10) {
    console.log("✓ Terre : period = 10")
    passed++
  } else {
    console.log("✗ Terre : period incorrect", earth?.orbitalPeriod)
    failed++
  }

  // 7. Lune period = 2.7
  if (moon && moon.orbitalPeriod === 2.7) {
    console.log("✓ Lune : period = 2.7")
    passed++
  } else {
    console.log("✗ Lune : period incorrect", moon?.orbitalPeriod)
    failed++
  }

  console.log(`\nRésultat : ${passed} passés, ${failed} échoués`)
  if (failed > 0) process.exit(1)
}

test()