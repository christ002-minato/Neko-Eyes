import fs from "node:fs"

const INPUT = "data/processed/countries-adm0-test.json"
const INPUT = "data/processed/countries-adm0-raw.json"
const OUTPUT_DIR = "data/processed"

const LEVELS = {
  globe: 0.05,
  country: 0.01,
  detail: 0.002,
}

console.log("========================================")
console.log(" NEKO EYES — SIMPLIFICATION ADM0")
console.log("========================================")

const source = JSON.parse(fs.readFileSync(INPUT, "utf8"))

function distanceSquared(a, b) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return dx * dx + dy * dy
}

/**
 * Simplification de type radial-distance.
 *
 * Important :
 * - conserve toujours le premier et dernier point
 * - fonctionne sur les anneaux GeoJSON
 * - ne dépend d'aucune bibliothèque externe
 */
function simplifyRing(ring, tolerance) {
  if (!Array.isArray(ring) || ring.length <= 4) {
    return ring
  }

  const toleranceSquared = tolerance * tolerance
  const result = [ring[0]]

  let previous = ring[0]

  for (let i = 1; i < ring.length - 1; i++) {
    const point = ring[i]

    if (distanceSquared(point, previous) >= toleranceSquared) {
      result.push(point)
      previous = point
    }
  }

  const last = ring[ring.length - 1]

  if (result[result.length - 1] !== last) {
    result.push(last)
  }

  // Un anneau GeoJSON doit conserver au minimum 4 positions.
  if (result.length < 4) {
    return ring
  }

  return result
}

function simplifyPolygon(coordinates, tolerance) {
  return coordinates.map((ring) => simplifyRing(ring, tolerance))
}

function simplifyMultiPolygon(coordinates, tolerance) {
  return coordinates.map((polygon) =>
    polygon.map((ring) => simplifyRing(ring, tolerance)),
  )
}

function simplifyGeometry(geometry, tolerance) {
  if (!geometry) return geometry

  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: simplifyPolygon(
        geometry.coordinates,
        tolerance,
      ),
    }
  }

  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: simplifyMultiPolygon(
        geometry.coordinates,
        tolerance,
      ),
    }
  }

  return geometry
}

function countCoordinates(value) {
  let total = 0

  function scan(v) {
    if (!Array.isArray(v)) return

    if (
      v.length >= 2 &&
      typeof v[0] === "number" &&
      typeof v[1] === "number"
    ) {
      total++
      return
    }

    for (const child of v) {
      scan(child)
    }
  }

  scan(value)

  return total
}

for (const [level, tolerance] of Object.entries(LEVELS)) {
  console.log(`\n--- ${level.toUpperCase()} ---`)
  console.log(`Tolérance : ${tolerance}`)

  const countries = source.countries.map((country) => ({
    id: country.id,
    name: country.name,
    geometry: simplifyGeometry(
      country.geometry,
      tolerance,
    ),
  }))

  const coordinates = countries.reduce(
    (total, country) =>
      total + countCoordinates(country.geometry.coordinates),
    0,
  )

  const output = {
    version: 1,
    level: "ADM0",
    detail: level,
    tolerance,
    countries,
  }

  const filename = `countries-adm0-${level}.json`
  const outputPath = `${OUTPUT_DIR}/${filename}`

  fs.writeFileSync(
    outputPath,
    JSON.stringify(output),
  )

  const size = fs.statSync(outputPath).size

  console.log(`Coordonnées : ${coordinates.toLocaleString("fr-FR")}`)
  console.log(
    `Taille      : ${(size / 1024 / 1024).toFixed(2)} Mo`,
  )
  console.log(`Fichier     : ${outputPath}`)
}

console.log("\n========================================")
console.log(" SIMPLIFICATION TERMINÉE")
console.log("========================================")
