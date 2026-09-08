import fs from "node:fs";

const file = "data/source/geoBoundariesCGAZ_ADM0.geojson";
const targets = new Set(["CIV", "FRA", "USA", "BRA", "JPN"]);

const results = new Map();

const stream = fs.createReadStream(file, {
  encoding: "utf8",
  highWaterMark: 1024 * 1024,
});

let buffer = "";
let depth = 0;
let inFeatures = false;
let featureStart = -1;

function countCoordinates(value) {
  if (!Array.isArray(value)) return 0;

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    return 1;
  }

  let total = 0;
  for (const item of value) {
    total += countCoordinates(item);
  }
  return total;
}

function analyzeFeature(feature) {
  const properties = feature.properties ?? {};
  const code = properties.shapeGroup;

  if (!targets.has(code)) return;

  const geometry = feature.geometry ?? {};
  const coordinates = geometry.coordinates;

  const points = [];

  function collect(value) {
    if (
      Array.isArray(value) &&
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      points.push(value);
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        collect(item);
      }
    }
  }

  collect(coordinates);

  const longitudes = points.map((p) => p[0]);
  const latitudes = points.map((p) => p[1]);

  results.set(code, {
    code,
    name: properties.shapeName,
    shapeType: properties.shapeType,
    geometryType: geometry.type,
    coordinates: points.length,
    rings: countRings(coordinates),
    longitudeMin: Math.min(...longitudes),
    longitudeMax: Math.max(...longitudes),
    latitudeMin: Math.min(...latitudes),
    latitudeMax: Math.max(...latitudes),
  });
}

function countRings(value) {
  if (!Array.isArray(value)) return 0;

  if (
    value.length > 0 &&
    Array.isArray(value[0]) &&
    value[0].length >= 2 &&
    typeof value[0][0] === "number"
  ) {
    return 1;
  }

  let total = 0;
  for (const item of value) {
    total += countRings(item);
  }

  return total;
}

stream.on("data", (chunk) => {
  buffer += chunk;

  let start = 0;

  while (true) {
    const featureIndex = buffer.indexOf('"type": "Feature"', start);

    if (featureIndex === -1) break;

    const objectStart = buffer.lastIndexOf("{", featureIndex);

    if (objectStart === -1) break;

    let i = objectStart;
    let level = 0;
    let string = false;
    let escaped = false;
    let objectEnd = -1;

    for (; i < buffer.length; i++) {
      const char = buffer[i];

      if (string) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          string = false;
        }
        continue;
      }

      if (char === '"') {
        string = true;
      } else if (char === "{") {
        level++;
      } else if (char === "}") {
        level--;

        if (level === 0) {
          objectEnd = i;
          break;
        }
      }
    }

    if (objectEnd === -1) {
      break;
    }

    const json = buffer.slice(objectStart, objectEnd + 1);

    try {
      const feature = JSON.parse(json);
      analyzeFeature(feature);
    } catch {
      // Feature incomplète ou invalide, on ignore.
    }

    start = objectEnd + 1;
  }

  buffer = buffer.slice(start);
});

stream.on("end", () => {
  console.log("\n========================================");
  console.log(" GEOJSON ADM0 — ANALYSE CIBLÉE");
  console.log("========================================\n");

  for (const code of targets) {
    const result = results.get(code);

    if (!result) {
      console.log(`${code} : NON TROUVÉ`);
      continue;
    }

    console.log(`${result.code} | ${result.name}`);
    console.log("----------------------------------------");
    console.log(`Shape type       : ${result.shapeType}`);
    console.log(`Geometry         : ${result.geometryType}`);
    console.log(`Coordonnées      : ${result.coordinates}`);
    console.log(`Rings            : ${result.rings}`);
    console.log(`Longitude min    : ${result.longitudeMin}`);
    console.log(`Longitude max    : ${result.longitudeMax}`);
    console.log(`Latitude min     : ${result.latitudeMin}`);
    console.log(`Latitude max     : ${result.latitudeMax}`);
    console.log();
  }

  console.log("========================================");
  console.log("Analyse terminée sans modification du fichier.");
  console.log("========================================\n");
});

stream.on("error", (error) => {
  console.error("Erreur de lecture :", error.message);
  process.exit(1);
});
