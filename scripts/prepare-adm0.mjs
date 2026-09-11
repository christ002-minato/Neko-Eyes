import fs from "node:fs"

const SOURCE = "data/source/geoBoundariesCGAZ_ADM0.geojson"
const OUTPUT = "data/processed/countries-adm0-test.json"

const TARGETS = new Set([
  "CIV",
  "FRA",
  "BRA",
  "USA",
  "JPN",
])

console.log("========================================")
console.log(" NEKO EYES — PRÉPARATION ADM0")
console.log("========================================")

console.log("\nLecture du GeoJSON source...")

const data = JSON.parse(fs.readFileSync(SOURCE, "utf8"))

const countries = []

for (const feature of data.features) {
  const properties = feature.properties ?? {}

  const code = properties.shapeGroup
  const name = properties.shapeName
  const shapeType = properties.shapeType
  const geometry = feature.geometry

  if (!shapeType || shapeType !== "ADM0") continue
  if (!TARGETS.has(code)) continue
  if (!geometry) continue

  countries.push({
    id: code,
    name,
    geometry: {
      type: geometry.type,
      coordinates: geometry.coordinates,
    },
  })
}

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(
    {
      version: 1,
      level: "ADM0",
      countries,
    },
    null,
    0,
  ),
)

console.log("\nPays extraits :", countries.length)

for (const country of countries) {
  console.log(
    `${country.id} | ${country.name} | ${country.geometry.type}`,
  )
}

console.log("\nFichier créé :", OUTPUT)

const stats = fs.statSync(OUTPUT)

console.log(
  "Taille        :",
  (stats.size / 1024 / 1024).toFixed(2),
  "Mo",
)

console.log("\n========================================")
console.log(" TERMINÉ")
console.log("========================================")
