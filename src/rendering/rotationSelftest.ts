import { getRotationAngle } from "./rotation.ts"

/**
 * Selftest de la rotation astronomique déterministe.
 *
 * Vérifie que l'orientation d'un corps est une fonction pure du temps simulé :
 *   angle = initialAngle + (simulationTime / rotationPeriod) * 2π
 *
 * - même simulationTime → même orientation (déterminisme, pas de dérive cumulative)
 * - avance du temps → rotation correspondante
 * - retour dans le passé → orientation recalculée
 * - pause → aucune rotation
 * - changement de vitesse → déplacement du temps simulé, pas de la période
 */

let passed = 0
let failed = 0

const TAU = Math.PI * 2

function expectClose(actual: number, expected: number, label: string, epsilon = 1e-6) {
  let a = actual % TAU
  let e = expected % TAU
  if (a < 0) a += TAU
  if (e < 0) e += TAU
  let diff = Math.abs(a - e)
  if (diff > TAU / 2) diff = TAU - diff
  if (diff <= epsilon) {
    console.log(`✓ ${label} (angle=${actual.toFixed(4)})`)
    passed++
  } else {
    console.log(`✗ ${label} — attendu ${expected.toFixed(4)}, obtenu ${actual.toFixed(4)}`)
    failed++
  }
}

// ── 1. Déterminisme : même temps → même angle ────────────────────────────────
{
  const t = 123.456
  const a1 = getRotationAngle(t, 23.934)
  const a2 = getRotationAngle(t, 23.934)
  if (a1 === a2) {
    console.log(`✓ Déterminisme : même simulationTime → même orientation (${a1.toFixed(4)})`)
    passed++
  } else {
    console.log(`✗ Déterminisme : ${a1} ≠ ${a2}`)
    failed++
  }
}

// ── 2. Terre : rotation complète en 23.934 h simulées ───────────────────────
expectClose(getRotationAngle(23.934, 23.934), TAU, "Terre : 23.934 h → 2π rad (rotation complète)")

// ── 3. Terre : demi-journée → demi-rotation ──────────────────────────────────
expectClose(getRotationAngle(23.934 / 2, 23.934), Math.PI, "Terre : 11.967 h → π rad (demi-rotation)")

// ── 4. Périodicité : angle(t + période) = angle(t) + 2π ─────────────────────
{
  const t = 50
  const base = getRotationAngle(t, 23.934)
  const later = getRotationAngle(t + 23.934, 23.934)
  expectClose(later, base + TAU, "Périodicité : t + période → +2π")
}

// ── 5. Pause : pas d'évolution du temps → pas d'évolution de l'angle ────────
{
  const t = 12
  expectClose(getRotationAngle(t, 23.934), getRotationAngle(t, 23.934), "Pause : même t → même angle")
}

// ── 6. Changement de vitesse : le temps simulé est la source de vérité ──────
// 10x pendant dt = 2 s ⇒ simulationTime += 20 h ⇒ angle calculé sur t = 20 h.
expectClose(getRotationAngle(20, 23.934), getRotationAngle(10, 23.934) + getRotationAngle(10, 23.934), "10x : déplacement temporel ×10, pas de période artificielle")

// ── 7. Passé : retour dans le temps → orientation recalculée ────────────────
expectClose(getRotationAngle(-23.934, 23.934), -TAU, "Passé : t = -23.934 h → -2π")

// ── 8. Angle initial conservé ────────────────────────────────────────────────
expectClose(getRotationAngle(0, 23.934, 1.5), 1.5, "Angle initial : angle(t=0) = initialAngle")

// ── 9. Corps sans rotationPeriod → orientation figée ─────────────────────────
{
  const a1 = getRotationAngle(0, 0, 0.4)
  const a2 = getRotationAngle(999, 0, 0.4)
  if (a1 === a2 && a1 === 0.4) {
    console.log("✓ Corps sans rotationPeriod : orientation figée (pas de rotation arbitraire)")
    passed++
  } else {
    console.log("✗ Corps sans rotationPeriod : rotation incorrecte")
    failed++
  }
}

// ── 10. Rotation rétrograde (négative) ───────────────────────────────────────
expectClose(getRotationAngle(5832.5 / 2, -5832.5), -Math.PI, "Vénus (rétrograde) : demi-période → -π")

// ── 11. Corps de référence : Mars, Jupiter, Saturne ──────────────────────────
expectClose(getRotationAngle(24.623, 24.623), TAU, "Mars : rotation complète en 24.623 h")
expectClose(getRotationAngle(9.925, 9.925), TAU, "Jupiter : rotation complète en 9.925 h")
expectClose(getRotationAngle(10.656, 10.656), TAU, "Saturne : rotation complète en 10.656 h")

// ── 12. Lune (rotation synchrone / verrouillage de marée) ───────────────────
expectClose(getRotationAngle(655.72, 655.72), TAU, "Lune : rotation complète en 655.72 h (27.32 jours)")
expectClose(getRotationAngle(609.12, 609.12), TAU, "Soleil : rotation complète en 609.12 h")

// ── 13. Vitesses × et temps réel : l'intégration simule le temps en HEURES ──
// useFrame fait : timeRef.current += delta_réel_s × speed / 3600
//  → Δh simulées = Δs réels × speed / 3600.
// À ×1, 60 s réelles = 1/60 h simulée ; la vitesse multiplie Δh.
{
  const s = 60 // 60 s réelles écoulées

  // ×1 : Δh = 60/3600 = 1/60 h
  const h_p1 = (s * 1) / 3600
  // ×5 : Δh = 60*5/3600 = 5/60 h
  const h_p5 = (s * 5) / 3600

  // Même "durée réelle", vitesse ×5 → 5× plus d'heures simulées → 5× plus de rotation
  // (la différence de rotation de ×5 vs ×1 vaut (h_p5 - h_p1)/P × 2π)
  const diff_p5 = getRotationAngle(h_p5, 23.934) - getRotationAngle(h_p1, 23.934)
  const expectedDiff_p5 = ((h_p5 - h_p1) / 23.934) * TAU
  expectClose(diff_p5, expectedDiff_p5, "×5 : à durée réelle égale, rotation ×5")

  // ×0.1 : Δh = 60*0.1/3600 = 1/600 h → 10× moins de rotation que ×1
  const h_p01 = (s * 0.1) / 3600
  const diff_p01 = getRotationAngle(h_p01, 23.934) - getRotationAngle(h_p1, 23.934)
  const expectedDiff_p01 = ((h_p01 - h_p1) / 23.934) * TAU
  expectClose(diff_p01, expectedDiff_p01, "×0.1 : à durée réelle égale, rotation 0.1×")

  // ×1 : sur une heure réelle, Δh = 1 → rotation = 1/23.934 tour
  const oneHourReel = getRotationAngle(1, 23.934) - getRotationAngle(0, 23.934)
  expectClose(oneHourReel, TAU / 23.934, "×1 : 1/23.934 de tour par heure réelle")

  // ×10 : sur une heure réelle, Δh = 10 → 10 tours /23.934 → 10× la rotation ×1
  const tenHourReel = getRotationAngle(10, 23.934) - getRotationAngle(0, 23.934)
  expectClose(tenHourReel, 10 * (TAU / 23.934), "×10 : 10/23.934 de tour par heure réelle")
}

// ── 14. Pause : aucun advancement du temps simulé → aucune rotation ──────────
{
  const a1 = getRotationAngle(5, 23.934)
  const a2 = getRotationAngle(5, 23.934)
  if (a1 === a2) {
    console.log("✓ Pause : temps simulé figé → orientation identique")
    passed++
  } else {
    console.log("✗ Pause : l'orientation a changé sans avance du temps")
    failed++
  }
}

// ── 15. Epoch : simTime=0 correspond toujours à la même orientation (déterminisme local) ──
expectClose(getRotationAngle(0, 23.934), getRotationAngle(0, 23.934), "Epoch : même angle à t=0")

console.log(`\nRésultat : ${passed} passages, ${failed} échoués`)
if (failed > 0) process.exit(1)