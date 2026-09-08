import fs from "node:fs";
import readline from "node:readline";

const file = "data/source/geoBoundariesCGAZ_ADM0.geojson";

const stats = {
  features: 0,
  polygons: 0,
  multiPolygons: 0,
  otherGeometry: 0,
  properties: new Set(),
  shapeGroups: new Set(),
  shapeTypes: new Set(),
  countries: [],
  totalCoordinateNumbers: 0,
  maxCoordinateNumbers: 0,
  maxCountry: null,
};

let currentFeature = null;
let inFeatures = false;
let buffer = "";

const stream = fs.createReadStream(file, {
  encoding: "utf8",
  highWaterMark: 1024 * 1024,
});

const rl = readline.createInterface({
  input: stream,
  crlfDelay: Infinity,
});

function countCoordinates(value) {
  if (!Array.isArray(value)) return 0;

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    return 1;
  }

  return value.reduce((sum, item) => sum + countCoordinates(item), 0);
}

for await (const line of rl) {
  const trimmed = line.trim();

  if (trimmed.startsWith('"features"')) {
    inFeatures = true;
    continue;
  }

  if (!inFeatures) continue;

  if (trimmed.startsWith('{ "type": "Feature"')) {
    buffer = trimmed;
  } else if (buffer) {
    buffer += trimmed;
  }

  if (buffer && /}\s*,?\s*$/.test(buffer)) {
    try {
      const feature = JSON.parse(buffer.replace(/,$/, ""));

      if (feature.type !== "Feature") {
        buffer = "";
        continue;
      }

      stats.features++;

      const properties = feature.properties ?? {};
      const geometry = feature.geometry ?? {};

      for (const key of Object.keys(properties)) {
        stats.properties.add(key);
      }

      if (properties.shapeGroup) {
        stats.shapeGroups.add(properties.shapeGroup);
      }

      if (properties.shapeType) {
        stats.shapeTypes.add(properties.shapeType);
      }

      if (properties.shapeName) {
        stats.countries.push({
          code: properties.shapeGroup,
          name: properties.shapeName,
          type: geometry.type,
        });
      }

      if (geometry.type === "Polygon") {
        stats.polygons++;
      } else if (geometry.type === "MultiPolygon") {
        stats.multiPolygons++;
      } else {
        stats.otherGeometry++;
      }

      const coordinateCount = countCoordinates(geometry.coordinates);

      stats.totalCoordinateNumbers += coordinateCount;

      if (coordinateCount > stats.maxCoordinateNumbers) {
        stats.maxCoordinateNumbers = coordinateCount;
        stats.maxCountry = properties.shapeName ?? null;
      }

      buffer = "";
    } catch {
      // Une feature peut être répartie sur plusieurs lignes.
      // On continue l'analyse.
    }
  }
}

console.log("\n========================================");
console.log(" GEOJSON ADM0 — ANALYSE NEKO EYES");
console.log("========================================\n");

console.log(`Fichier              : ${file}`);
console.log(`Taille               : ${fs.statSync(file).size / 1024 / 1024} Mo`);

console.log("\n--- GEOMETRIES ---");
console.log(`Features             : ${stats.features}`);
console.log(`Polygon              : ${stats.polygons}`);
console.log(`MultiPolygon         : ${stats.multiPolygons}`);
console.log(`Autres géométries    : ${stats.otherGeometry}`);

console.log("\n--- COORDONNÉES ---");
console.log(`Coordonnées totales  : ${stats.totalCoordinateNumbers}`);
console.log(`Pays le plus lourd   : ${stats.maxCountry}`);
console.log(`Coordonnées max/pays : ${stats.maxCoordinateNumbers}`);

console.log("\n--- PROPRIÉTÉS ---");
console.log([...stats.properties].join(", "));

console.log("\n--- SHAPE TYPES ---");
console.log([...stats.shapeTypes].join(", "));

console.log("\n--- EXEMPLES DE PAYS ---");

for (const country of stats.countries.slice(0, 20)) {
  console.log(
    `${country.code ?? "?"} | ${country.name} | ${country.type}`
  );
}

console.log("\n========================================\n");
