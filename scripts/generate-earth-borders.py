#!/usr/bin/env python3

"""
generate-earth-borders.py

Génère une texture transparente PNG (1440×720) contenant
uniquement les frontières ADM0 en blanc, destinée à être
superposée sur earth.jpg dans le rendu Three.js.

Projection équirectangulaire (compatible SphereGeometry UV) :
  x = (longitude + 180) / 360 * width
  y = (90 - latitude) / 180 * height

Usage : python3 scripts/generate-earth-borders.py
Dépendances : Python 3 + Pillow (PIL)
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

# ─── Constants ──────────────────────────────────────────────────────────────
WIDTH = 1440
HEIGHT = 720
INPUT_PATH = Path("data/processed/countries-adm0-globe.json")
OUTPUT_PNG = Path("public/textures/earth-borders.png")

# Line rendering settings
BORDER_COLOR = (255, 255, 255, 255)  # White, fully opaque
LINE_WIDTH = 1
ANTIMERIDIAN_THRESHOLD = 180  # Skip segments crossing ±180°


# ─── Projection ─────────────────────────────────────────────────────────────
def geo_to_pixel(lon, lat):
    """Convert geographic coordinates to pixel coordinates (equirectangular)."""
    x = (lon + 180) / 360 * WIDTH
    y = (90 - lat) / 180 * HEIGHT
    return x, y


# ─── Validation with known coordinates ──────────────────────────────────────
def validate_projection():
    """Validate the equirectangular projection against known coordinates."""
    print("=== VALIDATION DE LA PROJECTION ===\n")

    tests = [
        ("Pol Nord (0°, 90°)",          0,     90,  720.0,   0.0),
        ("Pol Sud (0°, -90°)",          0,    -90,  720.0, 720.0),
        ("Prime méridien / Équateur",   0,      0,  720.0, 360.0),
        ("Bord gauche (-180°, 0°)",  -180,      0,    0.0, 360.0),
        ("Bord droit (180°, 0°)",     180,      0, 1440.0, 360.0),
        ("Paris (2.35°, 48.86°)",     2.35, 48.86,  729.4, 164.6),
        ("New York (-74°, 40.7°)",    -74,   40.7,  424.0, 197.2),
        ("Tokyo (139.7°, 35.7°)",   139.7,  35.7, 1278.8, 217.2),
        ("Sydney (151.2°, -33.9°)", 151.2, -33.9, 1324.8, 495.6),
        ("Le Cap (-18.4°, 34°)",    -18.4,    34,  646.4, 224.0),
    ]

    all_passed = True
    for label, lon, lat, exp_x, exp_y in tests:
        px, py = geo_to_pixel(lon, lat)
        dx = abs(px - exp_x)
        dy = abs(py - exp_y)
        passed = dx < 0.5 and dy < 0.5
        if not passed:
            all_passed = False

        status = "✅" if passed else "❌"
        print(f"  {status} {label}")
        print(f"     pixel:   ({px:.1f}, {py:.1f})")
        print(f"     attendu: ({exp_x}, {exp_y})")
        print()

    print("RESULTAT :", "✅ PROJECTION VALIDÉE" if all_passed else "❌ PROJECTION INCORRECTE")
    print()
    return all_passed


# ─── Drawing ────────────────────────────────────────────────────────────────
def draw_polygon(draw, rings):
    """Draw polygon rings (outline only) on the canvas, skipping antimeridian crossings."""
    for ring in rings:
        if len(ring) < 2:
            continue

        pixels = [geo_to_pixel(lon, lat) for lon, lat in ring]

        for i in range(len(pixels) - 1):
            lon1, _ = ring[i]
            lon2, _ = ring[i + 1]

            if abs(lon2 - lon1) > ANTIMERIDIAN_THRESHOLD:
                continue

            draw.line(
                [pixels[i], pixels[i + 1]],
                fill=BORDER_COLOR,
                width=LINE_WIDTH,
            )

        # Close the ring
        lon_first, _ = ring[0]
        lon_last, _ = ring[-1]
        if abs(lon_first - lon_last) <= ANTIMERIDIAN_THRESHOLD:
            draw.line(
                [pixels[-1], pixels[0]],
                fill=BORDER_COLOR,
                width=LINE_WIDTH,
            )


# ─── Main ───────────────────────────────────────────────────────────────────
def main():
    # 1. Validate projection
    if not validate_projection():
        sys.exit(1)

    # 2. Load GeoJSON
    print(f"Chargement de {INPUT_PATH}...")
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    countries = raw["countries"]
    print(f"{len(countries)} pays trouvés.")

    total_polygons = 0
    total_points = 0
    for country in countries:
        geom = country["geometry"]
        if geom["type"] == "Polygon":
            total_polygons += 1
            total_points += sum(len(ring) for ring in geom["coordinates"])
        elif geom["type"] == "MultiPolygon":
            for polygon in geom["coordinates"]:
                total_polygons += 1
                total_points += sum(len(ring) for ring in polygon)

    print(f"{total_polygons} polygones, {total_points} points.")
    print()

    # 3. Create transparent canvas
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 4. Draw borders
    print("Dessin des frontières...")
    for country in countries:
        geom = country["geometry"]
        if geom["type"] == "Polygon":
            draw_polygon(draw, geom["coordinates"])
        elif geom["type"] == "MultiPolygon":
            for polygon in geom["coordinates"]:
                draw_polygon(draw, polygon)

    # 5. Export PNG
    OUTPUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(OUTPUT_PNG), "PNG")

    # 6. Verify output
    stats = OUTPUT_PNG.stat()
    print()
    print("=== RÉSULTAT ===")
    print(f"Fichier : {OUTPUT_PNG}")
    print(f"Résolution : {WIDTH}×{HEIGHT}")
    print(f"Taille : {stats.st_size // 1024} KB")

    # Verify with Pillow
    verify = Image.open(str(OUTPUT_PNG))
    print(f"Mode : {verify.mode}")

    # Count transparent vs opaque pixels
    total = WIDTH * HEIGHT
    alpha = verify.split()[-1]
    opaque = sum(1 for value in alpha.tobytes() if value > 0)
    transparent = total - opaque
    print(f"Pixels transparents : {transparent}/{total} ({100 * transparent / total:.1f}%)")
    print(f"Pixels opaques (frontières) : {opaque}/{total}")
    print()

    print("=== VÉRIFICATION MANUELLE ===")
    print("Pour vérifier earth-borders.png avant intégration :")
    print()
    print("  1. Ouvrir earth-borders.png dans un visualiseur d'images")
    print("     (Finder, Eye of GNOME, GIMP, etc.)")
    print("  2. Fond doit être totalement transparent (damier dans GIMP)")
    print("  3. Frontières en blanc sur fond transparent")
    print("  4. Lignes fines et continues")
    print("  5. Superposer sur earth.jpg dans GIMP/Photoshop :")
    print("     - Ouvrir earth.jpg comme calque de fond")
    print("     - Ajouter earth-borders.png par-dessus")
    print("     - Vérifier l'alignement des frontières avec la carte")
    print()
    print("  En ligne de commande (vérification rapide) :")
    print('    python3 -c "from PIL import Image; img=Image.open(\'public/textures/earth-borders.png\'); print(f\'{img.size}, mode={img.mode}\')"')
    print()


if __name__ == "__main__":
    main()
