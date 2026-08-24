import type { OrbitalBody, Vec3 } from "./types.ts"

const TAU = Math.PI * 2

function solveKepler(M: number, e: number, maxIter = 10, tol = 1e-10): number {
  if (e === 0) return M
  let E = M
  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M
    const fp = 1 - e * Math.cos(E)
    const E_new = E - f / fp
    if (Math.abs(E_new - E) < tol) return E_new
    E = E_new
  }
  return E
}

function getLocalPosition(body: OrbitalBody, simulationTime: number): Vec3 {
  if (body.orbitalRadius === 0 || body.orbitalPeriod === 0) return [0, 0, 0]

  const e = body.eccentricity ?? 0
  if (e === 0) {
    const angle = (simulationTime / body.orbitalPeriod) * TAU + body.phase
    return [
      Math.cos(angle) * body.orbitalRadius,
      0,
      Math.sin(angle) * body.orbitalRadius,
    ]
  }

  const a = body.orbitalRadius
  const M = (simulationTime / body.orbitalPeriod) * TAU + body.phase
  const E = solveKepler(M, e)

  const x = a * (Math.cos(E) - e)
  const z = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E)
  return [x, 0, z]
}

/**
 * Position d'un corps au temps simulé donné, en unités scène.
 * Les corps hiérarchiques (chaîne parent) retournent leur position absolue,
 * en préservant le comportement actuel Terre → Lune.
 * Supporte les orbites elliptiques képlériennes lorsque eccentricity > 0.
 */
export function getBodyPosition(
  body: OrbitalBody,
  simulationTime: number,
): Vec3 {
  const [x, y, z] = getLocalPosition(body, simulationTime)
  if (!body.parent) return [x, y, z]
  const [px, py, pz] = getBodyPosition(body.parent, simulationTime)
  return [px + x, py + y, pz + z]
}