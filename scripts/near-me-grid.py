#!/usr/bin/env python3
"""
NEAR-ME GEO GRID — "alag alag jagah se kyun nahi aate" ka naap.
═══════════════════════════════════════════════════════════════════════════════

Owner ka sawaal (22 Oct 2026):
  "jab mai 'ro service near me' search karta hu ALAG ALAG JAGAH tabhi meri
   website nhi aati hai top pe aisa kiyu hota hai"

Ye script us sawaal ko ANDAAZ se nahi, NAAP se jawab deti hai.

KYA KARTI HAI
─────────────
1. Patna ko hamare apne 83 area ke lat/lng se bana bounding box me leti hai
2. Us box par NxN ka grid daalti hai (default 12x12 = 144 point)
3. Har point par:
     • hamare 83 area me se sabse paas kaunsa hai, aur kitni door
     • hamare Buddha Colony base se wo point kitni door hai
4. Batati hai:
     • kितne grid point par hamara koi area 1.5 km ke andar hai  (achhi cover)
     • kitne point 3 km se zyada door hain                        (kamzor cover)
     • base se doori ka distribution — yahi Map Pack ka ~55% factor hai

KYUN YE SAHI NAAP HAI
─────────────────────
Whitespark 2026 Local Search Ranking Factors (47 expert, 187 factor):
    Map Pack : proximity ~55% · GBP ~32% · reviews ~20% · on-page ~15% · links ~8%
    Organic  : on-page 33% · links 24% · behaviour 10% · GBP 7% · reviews 6%

Proximity Map Pack ka sabse bada factor hai aur wo code se NAHI badalta.
Ye script dikhati hai ki geography hamare khilaaf KAHAN-KAHAN hai, taaki
GBP service-area aur review ka kaam sahi jagah lagaya ja sake.

🔴 Ye Google se rank NAHI poochti. Google ko scrape karna ToS ke khilaf hai
   aur uske number bharose ke layak nahi hote. Ye sirf wo naapti hai jo
   deterministic hai: doori.

CHALAO:
    python3 scripts/near-me-grid.py            # 12x12
    python3 scripts/near-me-grid.py 16         # 16x16
"""
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src/lib/seo/patna-service-data.ts")
CONST = os.path.join(ROOT, "src/lib/constants.ts")


def haversine(a, b, c, d):
    """km between two lat/lng."""
    p = math.pi / 180
    x = (0.5 - math.cos((c - a) * p) / 2
         + math.cos(a * p) * math.cos(c * p) * (1 - math.cos((d - b) * p)) / 2)
    return 2 * 6371 * math.asin(math.sqrt(x))


def load_areas():
    """patna-service-data.ts se slug + name + lat/lng + responseMin nikaalo."""
    s = open(DATA, encoding="utf-8").read()
    out = []
    # har area object ka block: slug se agle slug tak
    for m in re.finditer(
        r"slug:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)',"
        r"[\s\S]{0,400}?lat:\s*([\d.]+),\s*lng:\s*([\d.]+),"
        r"\s*responseMin:\s*(\d+)", s
    ):
        out.append({
            "slug": m.group(1), "name": m.group(2),
            "lat": float(m.group(3)), "lng": float(m.group(4)),
            "responseMin": int(m.group(5)),
        })
    return out


def load_base():
    s = open(CONST, encoding="utf-8").read()
    m = re.search(r"geo:\s*\{\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)", s)
    if not m:
        raise SystemExit("CONTACT.geo constants.ts me nahi mila")
    return float(m.group(1)), float(m.group(2))


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 12
    areas = load_areas()
    blat, blng = load_base()

    print("=" * 78)
    print("  NEAR-ME GEO GRID — Patna coverage")
    print("=" * 78)
    print(f"  area with lat/lng : {len(areas)}")
    print(f"  base (hamara pata): {blat}, {blng}")
    if len(areas) < 50:
        print("  🔴 FAIL — 50 se kam area mile, parser toot gaya")
        sys.exit(1)

    lats = [a["lat"] for a in areas]
    lngs = [a["lng"] for a in areas]
    mnla, mxla, mnln, mxln = min(lats), max(lats), min(lngs), max(lngs)
    print(f"  bounding box      : lat {mnla}..{mxla}  lng {mnln}..{mxln}")
    print(f"  grid              : {n} x {n} = {n * n} point")
    print()

    rows = []
    for i in range(n):
        for j in range(n):
            la = mnla + (mxla - mnla) * i / (n - 1)
            ln = mnln + (mxln - mnln) * j / (n - 1)
            near = min(areas, key=lambda a: haversine(la, ln, a["lat"], a["lng"]))
            d = haversine(la, ln, near["lat"], near["lng"])
            rows.append({
                "lat": round(la, 4), "lng": round(ln, 4),
                "area": near["name"], "slug": near["slug"],
                "km_to_area": round(d, 2),
                "km_to_base": round(haversine(la, ln, blat, blng), 2),
                "responseMin": near["responseMin"],
            })

    good = [r for r in rows if r["km_to_area"] <= 1.5]
    ok = [r for r in rows if 1.5 < r["km_to_area"] <= 3.0]
    weak = [r for r in rows if r["km_to_area"] > 3.0]

    print("── AREA PAGE COVERAGE (grid point se sabse paas wale area ki doori) ──")
    print(f"  ≤1.5 km  achhi cover   {len(good):>4} / {len(rows)}  "
          f"({len(good) / len(rows) * 100:.0f}%)")
    print(f"  1.5–3 km theek         {len(ok):>4} / {len(rows)}  "
          f"({len(ok) / len(rows) * 100:.0f}%)")
    print(f"  >3 km    kamzor        {len(weak):>4} / {len(rows)}  "
          f"({len(weak) / len(rows) * 100:.0f}%)")
    print()

    print("── MAP PACK PROXIMITY (grid point se HAMARE PATE ki doori) ──")
    print("   Whitespark 2026: proximity = Map Pack ka ~55%")
    buckets = [(0, 3), (3, 5), (5, 8), (8, 12), (12, 99)]
    for lo, hi in buckets:
        c = [r for r in rows if lo <= r["km_to_base"] < hi]
        lbl = f"{lo}-{hi} km" if hi < 99 else f"{lo}+ km"
        bar = "█" * int(len(c) / len(rows) * 50)
        print(f"  {lbl:<9} {len(c):>4} point  {len(c) / len(rows) * 100:>5.1f}%  {bar}")
    print()

    far = sorted(rows, key=lambda r: -r["km_to_base"])[:8]
    print("── SABSE DOOR 8 GRID POINT (yahan Map Pack me aana sabse mushkil) ──")
    for r in far:
        print(f"  {r['km_to_base']:>5.1f} km base se   paas ka area: "
              f"{r['area']:<22} ({r['km_to_area']} km)")
    print()

    # har area kitne grid point ka "nearest" bana
    from collections import Counter
    cnt = Counter(r["slug"] for r in rows)
    print(f"── {len(cnt)} area kisi na kisi grid point ke sabse paas hain ──")
    print("  sabse zyada cover karne wale 6:")
    for slug, c in cnt.most_common(6):
        nm = next(a["name"] for a in areas if a["slug"] == slug)
        print(f"    {nm:<24} {c} grid point")
    orphan = [a["name"] for a in areas if a["slug"] not in cnt]
    print(f"  kisi grid point ke nearest NAHI: {len(orphan)} area")
    if orphan:
        print(f"    {', '.join(orphan[:10])}{' …' if len(orphan) > 10 else ''}")
    print()

    # ───────────────────────────────────────────────────────────────────────
    # 🔴 GRID KA ARTIFACT — ye likhna zaroori hai warna number jhoota lagega
    # ───────────────────────────────────────────────────────────────────────
    # Bounding box sabse door wale area (Anandpur, lng 84.964) tak khinch
    # jaata hai, isliye rectangle me bahut khaali zameen aa jaati hai jahan
    # hamara koi customer hi nahi. Us khaali zameen ko ginna galat tasveer
    # deta hai. Isliye ASLI naap neeche hai: hamare 83 ASLI area ki doori.
    print("── 🔴 ASLI NAAP — 83 asli area ki base se doori ──")
    print("   (upar wala grid bounding-box hai, usme khaali zameen bhi gini")
    print("    jaati hai. Customer grid point par nahi, AREA me rehte hain.)")
    # 🔴 EK HI NIYAM poore project me: 1 decimal par round, phir >= tulna.
    #    src/lib/geo/nearest-area.ts ka kmFromBase() bhi yahi karta hai.
    #    Bina round kiye Shivpuri/AG Colony (~4.96 km) chhoot jaate hain aur
    #    report 31 bolti hai jabki test 33 — do alag number = bharosa khatam.
    ad = sorted((round(haversine(blat, blng, a["lat"], a["lng"]), 1), a["name"])
                for a in areas)
    for lo, hi in buckets:
        c = [x for x in ad if lo <= x[0] < hi]
        lbl = f"{lo}-{hi} km" if hi < 99 else f"{lo}+ km"
        bar = "█" * int(len(c) / len(ad) * 50)
        print(f"  {lbl:<9} {len(c):>4} area   {len(c) / len(ad) * 100:>5.1f}%  {bar}")
    far5 = [x for x in ad if x[0] >= 5]
    print()
    print(f"  5 km+ door area : {len(far5)} / {len(ad)} "
          f"({len(far5) / len(ad) * 100:.0f}%)")
    print(f"  sabse door 6    : " +
          ", ".join(f"{nm} {d:.1f}km" for d, nm in ad[-6:]))
    print(f"  median doori    : {ad[len(ad) // 2][0]:.1f} km")
    print()

    out = os.path.join(ROOT, "near-me-grid.json")
    json.dump({"grid": n, "base": [blat, blng], "areas": len(areas),
               "area_km_from_base": [[round(d, 2), nm] for d, nm in ad],
               "rows": rows}, open(out, "w"), indent=1)
    print(f"  saved → {out}")
    print()
    print("=" * 78)
    print("  NATEEJA")
    print("=" * 78)
    print(f"  ORGANIC : {len(good) + len(ok)}/{len(rows)} grid point par hamara koi")
    print("            area page 3 km ke andar hai. Content ki kami NAHI hai.")
    print(f"  MAP PACK: {len(far5)}/{len(ad)} asli area ({len(far5) / len(ad) * 100:.0f}%) "
          f"hamare pate se 5 km+ door hain.")
    print("            Proximity Map Pack ka ~55% hai aur code se NAHI badalta.")
    print("            Ilaaj: GBP service area + reviews + 'open now' hours.")


if __name__ == "__main__":
    main()
