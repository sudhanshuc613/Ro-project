#!/usr/bin/env python3
"""
ANALYTICS TAG — HTTP + source level checks.
══════════════════════════════════════════════════════════════════════════════

Browser wala test (analytics-tag-browser.mjs) ye naapta hai ki tag SACH ME
chala ya nahi. Ye test wo cheezein dekhta hai jo browser se nahi dikhtin:

  • admin panel me card hai aur usme owner ka GTM ID dikh raha hai
  • /api/admin/settings bina login ke 401 deta hai (ID public hai, par
    badalne ka haq sirf admin ka)
  • privacy policy me "Google ke tag" wala sach likha hai
  • privacy policy ka purana jhooth hata hai ("kisi third party ko nahi")
  • sitemap me /privacy-policy ki lastmod badli hai (content badla hai to
    date bhi badalni chahiye — ye galti main 2 aur 3 Nov ko kar chuka hoon)
  • koi dusra page toota nahi

Usage: python3 scripts/analytics-tag-test.py http://127.0.0.1:3100
"""
import re
import sys
import json
import urllib.request
import urllib.error

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3100").rstrip("/")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

P = F = 0


def ok(name, cond, got=None):
    global P, F
    if cond:
        P += 1
    else:
        F += 1
        extra = "" if got is None else f"   got: {str(got)[:200]}"
        print(f"  FAIL  {name}{extra}")


def get(path, want=200):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": UA})
    try:
        r = urllib.request.urlopen(req, timeout=45)
        return r.getcode(), r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "ignore")
    except Exception as e:                                  # noqa: BLE001
        return 0, str(e)


def strip_comments(h):
    """React `<!-- -->` daalta hai — har naap se pehle hatao."""
    return re.sub(r"<!--.*?-->", "", h, flags=re.S)


print("── analytics tag: HTTP + source ──")

# ── 1. Admin API bina login ke band hona chahiye ────────────────────────────
code, _ = get("/api/admin/settings")
ok("GET /api/admin/settings bina login -> 401", code == 401, code)

req = urllib.request.Request(
    BASE + "/api/admin/settings",
    data=json.dumps({"key": "analytics", "value": {"gtmId": "GTM-HACKED1"}}).encode(),
    headers={"User-Agent": UA, "Content-Type": "application/json"},
    method="PUT",
)
try:
    urllib.request.urlopen(req, timeout=30)
    put_code = 200
except urllib.error.HTTPError as e:
    put_code = e.code
except Exception:                                            # noqa: BLE001
    put_code = 0
ok("PUT /api/admin/settings bina login -> 401", put_code == 401, put_code)

# ── 2. Privacy policy — naya sach ───────────────────────────────────────────
code, html = get("/privacy-policy")
ok("/privacy-policy 200", code == 200, code)
h = strip_comments(html)
ok("privacy: 'Google ke tag' heading hai", "Google ke tag" in h)
ok("privacy: GA4 ka zikr", "Google Analytics 4" in h)
ok("privacy: Tag Manager ka zikr", "Google Tag Manager" in h)
ok("privacy: hashed/scrambled baat saaf likhi", "SCRAMBLED" in h or "hashed" in h.lower())
ok("privacy: opt-out ka tarika diya", "ad personalisation" in h.lower() or "band kar do" in h)
ok("privacy: 'bechte' wala vaada bacha hua hai", "bechte" in h)

# 🔴 Purana jhooth wapas na aa jaye. Tag lagne ke baad ye line galat hai.
ok("privacy: purana 'na kisi third party ko dete hain' hata",
   "na kisi third party ko dete hain" not in h)
ok("privacy: purana 'ads ke liye kisi ko nahi dete' hata",
   "vigyapan (ads) ke liye kisi ko nahi dete" not in h)
ok("privacy: purana 'never sold or shared with third parties' hata",
   "never sold or shared with third parties" not in h)

# ── 3. Sitemap — privacy ki date badli ──────────────────────────────────────
code, xml = get("/sitemap.xml")
ok("/sitemap.xml 200", code == 200, code)
m = re.search(r"<url>\s*<loc>[^<]*?/privacy-policy</loc>\s*<lastmod>([^<]+)</lastmod>", xml)
ok("sitemap me /privacy-policy ka lastmod mila", m is not None)
if m:
    ok("privacy lastmod 2026-11-06 hai (content badla to date badli)",
       m.group(1)[:10] == "2026-11-06", m.group(1))
m2 = re.search(r"<url>\s*<loc>[^<]*?/shipping-policy</loc>\s*<lastmod>([^<]+)</lastmod>", xml)
ok("baaki policy page ki date CHHEDI NAHI gayi",
   m2 is not None and m2.group(1)[:10] == "2026-10-25",
   m2.group(1) if m2 else None)
# 🔴 Local DB me live se kam product hote hain, isliye yahan absolute 152
# nahi likha ja sakta — live par 152, local seed par 150. Jo cheez yahan
# maayne rakhti hai wo hai "URL ghate nahi", isliye floor laga hai aur
# zaroori page naam se jaanche jaate hain.
n = xml.count("<loc>")
ok("sitemap me kam se kam 150 URL (ghata nahi)", n >= 150, n)
for must in ["/privacy-policy", "/ro-service-centre-patna", "/ro-service-in-patna",
             "/service-patna/brand/kent", "/ro-service-patna/kankarbagh"]:
    ok(f"sitemap me {must} hai", must + "</loc>" in xml)

# ── 4. Koi page toota nahi — GTM lagne ke baad spot check ───────────────────
for p in ["/", "/ro-service-in-patna", "/service-patna",
          "/ro-service-patna/kankarbagh", "/service-patna/brand/kent",
          "/ro-service-centre-patna", "/contact", "/terms", "/about-us"]:
    c, b = get(p)
    bb = strip_comments(b)
    ok(f"{p} -> 200", c == 200, c)
    ok(f"{p} -> koi client-side exception nahi",
       "Application error" not in bb and "client-side exception" not in bb)
    ok(f"{p} -> h1 maujood", len(re.findall(r"<h1", bb)) >= 1)

# ── 5. Server HTML me tag NAHI hona chahiye (ye client par lagta hai) ───────
code, home = get("/")
ok("server HTML me GTM nahi (host check client par hota hai)",
   "googletagmanager.com/gtm.js" not in home)
ok("server HTML me gtag/js nahi", "googletagmanager.com/gtag/js" not in home)

# ── 6. Source level — jo browser se nahi dikhta ─────────────────────────────
SRC = "/home/user/aquanexa/"


def src(p):
    try:
        with open(SRC + p, encoding="utf-8") as fh:
            return fh.read()
    except OSError:
        return ""


lay = src("src/app/layout.tsx")
ok("layout.tsx AnalyticsTags render karta hai", "<AnalyticsTags />" in lay)
ok("layout.tsx me purana seedha <Analytics /> nahi bacha",
   "<Analytics />" not in lay)

at = src("src/components/analytics/AnalyticsTags.tsx")
ok("AnalyticsTags server component hai ('use client' NAHI)",
   "'use client'" not in at and at != "")
ok("AnalyticsTags getAnalyticsSettings bulata hai", "getAnalyticsSettings" in at)
ok("AnalyticsTags Analytics ko HAMESHA render karta hai (GTM optional)",
   "<Analytics config={a} />" in at)

gtm = src("src/components/analytics/GoogleTagManager.tsx")
ok("GoogleTagManager client component hai", gtm.startswith("'use client'"))
ok("GTM host-gated hai", "allowedHosts" in gtm)
ok("GTM container URL sahi", "googletagmanager.com/gtm.js?id=" in gtm)
ok("GTM dataLayer init pehle, container baad me",
   gtm.find("gtm-datalayer") < gtm.find("gtm-container"))
ok("GTM window.gtag ko overwrite nahi karta",
   "window.gtag = window.gtag || gtag" in gtm)

an = src("src/components/analytics/Analytics.tsx")
ok("Analytics config prop leta hai", "config?: AnalyticsValues" in an)
ok("Analytics bina prop ke bhi chalta hai (fallback)",
   "config ?? ANALYTICS_FALLBACK" in an)
ok("Analytics ka GA4 script waisa ka waisa", "gtag/js?id=" in an)
ok("Analytics ab GTM-only me bhi click track karta hai", "cfg.gtmActive" in an)

ov = src("src/lib/seo/analytics-overrides.ts")
ok("analytics-overrides me 'use client' NAHI hai", "'use client'" not in ov)
ok("extractIds lib me hai, client file me nahi", "export function extractIds" in ov)

card = src("src/components/admin/AnalyticsTagCard.tsx")
ok("admin card maujood", card.startswith("'use client'"))
ok("admin card sirf component export karta hai (bug class C)",
   len(re.findall(r"^export (?!default)", card, flags=re.M)) == 0)
ok("admin card paste-box deta hai", "ID nikaalo" in card)

api = src("src/app/api/admin/settings/route.ts")
ok("API me analytics schema hai", "analytics: z.object" in api)
ok("API validateAnalytics hi use karta hai (ek hi sach)",
   "validateAnalytics" in api)
ok("API analytics save par revalidatePath('/', 'layout') chalata hai",
   "if (key === 'analytics') revalidatePath('/', 'layout')" in api)

st = src("src/lib/settings.ts")
ok("settings.ts me getAnalyticsSettings", "export const getAnalyticsSettings" in st)
ok("getAnalyticsSettings cache tag 'settings' par hai",
   "['settings:analytics']" in st)
ok("getAllSettings analytics bhi deta hai", "analytics," in st)

sm = src("src/app/sitemap.ts")
ok("sitemap revalidate ab bhi 60 hai (metadata route ka niyam)",
   "export const revalidate = 60;" in sm)

cons = src("src/lib/constants.ts")
ok("constants.ts me gaId waisa ka waisa", "gaId: 'G-JP9HDZ9SE3'" in cons)
ok("constants.ts me adsId waisa ka waisa", "adsId: 'AW-610913435'" in cons)
ok("constants.ts me allowedHosts waise ke waise",
   "allowedHosts: ['rokadoctor.in', 'www.rokadoctor.in']" in cons)

print()
print("════════════════════════════════════")
print(f"  PASS: {P}    FAIL: {F}")
print("════════════════════════════════════")
sys.exit(0 if F == 0 else 1)
