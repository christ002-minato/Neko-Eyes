import type { OrbitalBody, Vec3 } from "./types.ts"

const TAU = Math.PI * 2

function getLocalPosition(body: OrbitalBody, simulationTime: number): Vec3 {
  if (body.orbitalRadius === 0 || body.orbitalPeriod === 0) return [0, 0, 0]
  const angle = (simulationTime / body.orbitalPeriod) * TAU + body.phase
  return [
    Math.cos(angle) * body.orbitalRadius,
    0,
    Math.sin(angle) * body.orbitalRadius,
  ]
}

/**
 * Position d'un corps au temps simulé donné, en unités scène.
 * Les corps hiérarchiques (chaîne parent) retournent leur position absolue,
 * en préservant le comportement actuel Terre → Lune.
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