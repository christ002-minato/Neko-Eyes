import fs from "node:fs"

const FILES = [
  "data/processed/countries-adm0-test.json",
  "data/processed/countries-adm0-globe.json",
  "data/processed/countries-adm0-country.json",
  "data/processed/countries-adm0-detail.json",
]

let globalInvalid = 0

for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"))

  console.log("\n========================================")
  console.log(file)
  console.log("========================================")

  let invalid = 0

  function checkRing(ring, country) {
    if (!Array.isArray(ring)) {
      invalid++
      console.log(`Anneau invalide : ${country}`)
      return
    }

    if (ring.length < 4) {
      invalid++
      console.log(
        `Anneau trop court : ${country} (${ring.length} points)`,
      )
    }

    const first = ring[0]
    const last = ring[ring.length - 1]

    if (
      !Array.isArray(first) ||
      !Array.isArray(last) ||
      first[0] !== last[0] ||
      first[1] !== last[1]
    ) {
      invalid++
      console.log(
        `Anneau non fermé : ${country}`,
      )
    }
  }

  for (const country of data.countries) {
    const geometry = country.geometry

    if (geometry.type === "Polygon") {
      for (const ring of geometry.coordinates) {
        checkRing(ring, country.id)
      }
    }

    if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          checkRing(ring, country.id)
        }
      }
    }
  }

  console.log(`Anneaux invalides : ${invalid}`)

  globalInvalid += invalid
}

console.log("\n========================================")
console.log(" RÉSULTAT GLOBAL")
console.log("========================================")

console.log(`Anomalies : ${globalInvalid}`)

if (globalInvalid === 0) {
  console.log("VALIDATION : OK")
} else {
  console.log("VALIDATION : ÉCHEC")
}
