/** Returns the signed axial angle for a simulated time in hours. */
export function getRotationAngle(
  simulationTime: number,
  rotationPeriod: number,
  initialAngle = 0,
): number {
  if (rotationPeriod === 0) return initialAngle
  return initialAngle + (simulationTime / rotationPeriod) * Math.PI * 2
}