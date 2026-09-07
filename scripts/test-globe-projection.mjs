const DEG_TO_RAD = Math.PI / 180;

// Rayon de test
const R = 1;

const targets = [
  { code: "CIV", name: "Côte d'Ivoire", lon: -5.55, lat: 7.54 },
  { code: "FRA", name: "France", lon: 2.21, lat: 46.23 },
  { code: "BRA", name: "Brésil", lon: -51.93, lat: -14.24 },
  { code: "USA", name: "États-Unis", lon: -100, lat: 38 },
  { code: "JPN", name: "Japon", lon: 138.25, lat: 36.2 },
];

function geoToSphere(lon, lat, radius = R) {
  const lambda = lon * DEG_TO_RAD;
  const phi = lat * DEG_TO_RAD;

  return {
    x: radius * Math.cos(phi) * Math.cos(lambda),
    y: radius * Math.sin(phi),
    z: -radius * Math.cos(phi) * Math.sin(lambda),
  };
}

function length(v) {
  return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
}

console.log("\n========================================");
console.log(" NEKO EYES — TEST PROJECTION GLOBE");
console.log("========================================\n");

for (const target of targets) {
  const position = geoToSphere(target.lon, target.lat);

  console.log(`${target.code} | ${target.name}`);
  console.log("----------------------------------------");
  console.log(`Longitude : ${target.lon}°`);
  console.log(`Latitude  : ${target.lat}°`);
  console.log(
    `Vector3   : x=${position.x.toFixed(6)}, ` +
    `y=${position.y.toFixed(6)}, ` +
    `z=${position.z.toFixed(6)}`
  );
  console.log(`Rayon     : ${length(position).toFixed(6)}`);
  console.log();
}

console.log("========================================");
console.log("TESTS");
console.log("========================================");

let passed = true;

for (const target of targets) {
  const p = geoToSphere(target.lon, target.lat);
  const radiusError = Math.abs(length(p) - R);

  if (radiusError > 0.000001) {
    passed = false;
    console.log(`❌ ${target.code} rayon incorrect`);
  } else {
    console.log(`✅ ${target.code} projection valide`);
  }
}

console.log();

if (passed) {
  console.log("RESULTAT : ✅ PROJECTION MATHÉMATIQUE VALIDÉE");
} else {
  console.log("RESULTAT : ❌ PROJECTION À CORRIGER");
}

console.log();
