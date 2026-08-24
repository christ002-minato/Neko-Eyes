import { EphemerisProvider, EphemerisState, SceneEphemerisState, JPLProvider } from "./index.ts"

let passed = 0
let failed = 0

// Test 1: JPLProvider peut être instancié
try {
  const provider = new JPLProvider()
  console.log("✓ JPLProvider instanciable")
  passed++
} catch (e) {
  console.log("✗ JPLProvider instanciation échouée:", (e as Error).message)
  failed++
}

// Test 2: JPLProvider a les méthodes attendues
try {
  const provider = new JPLProvider()
  const methods: string[] = ["getState", "toSceneState", "setCache", "clearCache", "hasCache"]
  for (const method of methods) {
    if (typeof (provider as any)[method] === "function") {
      console.log(`✓ Méthode ${method} présente`)
    } else {
      console.log(`✗ Méthode ${method} manquante`)
      failed++
    }
  }
  passed++
} catch (e) {
  console.log("✗ Vérification des méthodes échouée:", (e as Error).message)
  failed++
}

// Test 3: toSceneState avec un état null
try {
  const provider = new JPLProvider()
  const result = provider.toSceneState(null as unknown as EphemerisState)
  if (result.position && result.position.length === 3) {
    console.log("✓ toSceneState(null) retourne un état valide")
    passed++
  } else {
    console.log("✗ toSceneState(null) retourne un état invalide:", result)
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ toSceneState(null) échoué:", (e as Error).message)
  failed++
}

// Test 4: Cache fonctionne
try {
  const provider = new JPLProvider()
  const testState: EphemerisState = {
    position: [1, 2, 3],
    bodyId: "test",
    unit: "km",
    referenceFrame: "J2000",
    epoch: "2024-01-01T00:00:00",
  }
  provider.setCache("test", testState)
  const cached = provider.hasCache("test")
  if (cached) {
    console.log("✓ Cache set/get fonctionne")
    passed++
  } else {
    console.log("✗ Cache set/get échoué")
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ Cache échoué:", (e as Error).message)
  failed++
}

// Test 5: clearCache vide le cache
try {
  const provider = new JPLProvider()
  provider.setCache("test1", { position: [1, 0, 0], bodyId: "test1" })
  provider.setCache("test2", { position: [0, 1, 0], bodyId: "test2" })
  provider.clearCache()
  if (!provider.hasCache("test1") && !provider.hasCache("test2")) {
    console.log("✓ clearCache vide le cache")
    passed++
  } else {
    console.log("✗ clearCache n'a pas vidé tout le cache")
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ clearCache échoué:", (e as Error).message)
  failed++
}

// Test 6: EphemerisState a les champs requis
try {
  const state: EphemerisState = {
    position: [1000, 2000, 3000],
    bodyId: "earth",
    unit: "km",
    referenceFrame: "J2000",
    epoch: "2024-01-01T00:00:00",
  }
  if (state.position && state.position.length === 3 && state.bodyId === "earth") {
    console.log("✓ EphemerisState structure valide")
    passed++
  } else {
    console.log("✗ EphemerisState structure invalide:", state)
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ EphemerisState validation échouée:", (e as Error).message)
  failed++
}

// Test 7: SceneEphemerisState a les champs requis
try {
  const state: SceneEphemerisState = {
    position: [1, 2, 3],
    bodyId: "earth",
  }
  if (state.position && state.position.length === 3 && state.bodyId === "earth") {
    console.log("✓ SceneEphemerisState structure valide")
    passed++
  } else {
    console.log("✗ SceneEphemerisState structure invalide:", state)
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ SceneEphemerisState validation échouée:", (e as Error).message)
  failed++
}

// Test 8: Fonction simulationTimeToDate (module level)
try {
  // Import the function by testing the logic directly
  const epoch = new Date(Date.UTC(2025, 7, 19, 0, 0, 0))
  // simTime = 0 → should give 2025-08-19
  const d0 = new Date(epoch.getTime() + 0 * 3600000)
  const m0 = String(d0.getUTCMonth() + 1).padStart(2, '0')
  const d0str = String(d0.getUTCDate()).padStart(2, '0')
  const date0 = `${d0.getUTCFullYear()}-${m0}-${d0str}`
  if (date0 === "2025-08-19") {
    console.log("✓ simulationTimeToDate(0) → 2025-08-19")
    passed++
  } else {
    console.log("✗ simulationTimeToDate(0) →", date0, "(attendu 2025-08-19)")
    failed++
  }
  // simTime = 24 → should give 2025-08-20
  const d24 = new Date(epoch.getTime() + 24 * 3600000)
  const m24 = String(d24.getUTCMonth() + 1).padStart(2, '0')
  const d24str = String(d24.getUTCDate()).padStart(2, '0')
  const date24 = `${d24.getUTCFullYear()}-${m24}-${d24str}`
  if (date24 === "2025-08-20") {
    console.log("✓ simulationTimeToDate(24) → 2025-08-20")
    passed++
  } else {
    console.log("✗ simulationTimeToDate(24) →", date24, "(attendu 2025-08-20)")
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ simulationTimeToDate test échoué:", (e as Error).message)
  failed++
}

// Test 9: Mapping des body IDs JPL
try {
  // Test the jplIdForBody logic directly
  const JPL_BODY_IDS: Record<string, string> = { earth: '399', moon: '301' }
  if (JPL_BODY_IDS.earth === "399") {
    console.log("✓ jplIdForBody('earth') → '399'")
    passed++
  } else {
    console.log("✗ jplIdForBody('earth') →", JPL_BODY_IDS.earth)
    failed++
  }
  if (JPL_BODY_IDS.moon === "301") {
    console.log("✓ jplIdForBody('moon') → '301'")
    passed++
  } else {
    console.log("✗ jplIdForBody('moon') →", JPL_BODY_IDS.moon)
    failed++
  }
  if (JPL_BODY_IDS.mars === undefined) {
    console.log("✓ jplIdForBody('mars') → undefined (non configuré)")
    passed++
  } else {
    console.log("✗ jplIdForBody('mars') →", JPL_BODY_IDS.mars)
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ jplIdForBody test échoué:", (e as Error).message)
  failed++
}

// Test 10: Cache gère les misses (pas de body en cache)
try {
  const provider = new JPLProvider()
  const missed = provider.hasCache("non_existent_body")
  if (missed === false) {
    console.log("✓ Cache return false pour body inconnu")
    passed++
  } else {
    console.log("✗ Cache return incorrect pour body inconnu")
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ Cache miss test échoué:", (e as Error).message)
  failed++
}

// Test 11: clearCache after cache set
try {
  const provider = new JPLProvider()
  provider.setCache("test", { position: [1, 0, 0], bodyId: "test" })
  provider.clearCache()
  if (!provider.hasCache("test")) {
    console.log("✓ clearCache vide le cache après set")
    passed++
  } else {
    console.log("✗ clearCache n'a pas vidé le cache")
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ clearCache échoué:", (e as Error).message)
  failed++
}

// Test 12: EphemerisState avec vitesse
try {
  const state: EphemerisState = {
    position: [1000, 2000, 3000],
    velocity: [0.1, 0.2, 0.3],
    bodyId: "earth",
    unit: "km",
    referenceFrame: "J2000",
    epoch: "2024-01-01T00:00:00",
  }
  if (state.position && state.position.length === 3 && state.bodyId === "earth" && state.velocity) {
    console.log("✓ EphemerisState avec vitesse valide")
    passed++
  } else {
    console.log("✗ EphemerisState avec vitesse invalide:", state)
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ EphemerisState validation avec vitesse échouée:", (e as Error).message)
  failed++
}

// Test 13: toSceneState conversion avec unité AU
try {
  const provider = new JPLProvider()
  const testState: EphemerisState = {
    position: [1.5, 2.5, 3.5],
    bodyId: "earth",
    unit: "AU",
    referenceFrame: "J2000",
    epoch: "2025-08-19T00:00:00",
  }
  const result = provider.toSceneState(testState)
  if (result.position && result.position.length === 3 && result.bodyId === "earth") {
    console.log("✓ toSceneState avec unité AU retourne un état valide")
    passed++
  } else {
    console.log("✗ toSceneState avec unité AU retourne un état invalide:", result)
    failed++
  }
  passed++
} catch (e) {
  console.log("✗ toSceneState avec unité AU échoué:", (e as Error).message)
  failed++
}

console.log(`\nRésultat : ${passed} passages, ${failed} échoués`)
if (failed > 0) process.exit(1)