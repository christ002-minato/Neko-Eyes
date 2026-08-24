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
  const i = body.inclination ?? 0
  const Ω = body.nodeLongitude ?? 0

  if (e === 0 && i === 0 && Ω === 0) {
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

  // Position orbitale de base dans le plan xz (sans inclinaison ni orientation)
  const x0 = a * (Math.cos(E) - e)
  const z0 = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E)

  // Étape 1 : application de l'inclinaison (rotation autour de l'axe X)
  // x1 = x0
  // y1 = z0 * sin(i)
  // z1 = z0 * cos(i)
  const x1 = x0
  const y1 = z0 * Math.sin(i)
  const z1 = z0 * Math.cos(i)

  // Étape 2 : application de la longitude du nœud montant (rotation autour de l'axe Z)
  // x2 = x1 * cos(Ω) - y1 * sin(Ω)
  // y2 = x1 * sin(Ω) + y1 * cos(Ω)
  // z2 = z1
  const x2 = x1 * Math.cos(Ω) - y1 * Math.sin(Ω)
  const y2 = x1 * Math.sin(Ω) + y1 * Math.cos(Ω)
  const z2 = z1

  return [x2, y2, z2]
}

/**
 * Position d'un corps au temps simulé donné, en unités scène.
 * Les corps hiérarchiques (chaîne parent) retournent leur position absolue,
 * en préservant le comportement actuel Terre → Lune.
 * Supporte :
 * - orbites circulaires (eccentricity = 0 ou absent)
 * - orbites elliptiques (eccentricity > 0)
 * - inclinaison orbitale (inclination > 0, rotation autour de l'axe X)
 * - orientation orbitale (nodeLongitude > 0, rotation autour de l'axe Z)
 * - combinaison eccentricity + inclination + nodeLongitude
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
