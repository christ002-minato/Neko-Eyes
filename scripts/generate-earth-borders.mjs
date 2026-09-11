#!/usr/bin/env node

/**
 * generate-earth-borders.mjs
 *
 * Wrapper Node.js : appelle scripts/generate-earth-borders.py
 * qui génère la texture transparente earth-borders.png (1440×720)
 * avec les frontières ADM0 en blanc.
 *
 * Usage : node scripts/generate-earth-borders.mjs
 */

import { execSync } from "node:child_process";

try {
  execSync("python3 scripts/generate-earth-borders.py", {
    stdio: "inherit",
  });
} catch (err) {
  process.exit(1);
}