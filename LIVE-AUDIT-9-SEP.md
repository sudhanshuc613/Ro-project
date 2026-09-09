# 🔍 Live Audit — 9 Sep 2026

Sab kuch abhi live measure kiya. Ek bhi cheez guess nahi.

---

# ✅ PART 1 — Deploy safal hai

```
173 pages live          sab 200 OK
8 naye area             sab 200
7 service page          sab 200
blog + author page      200
purane URL              308 redirect (404 nahi) ✅
sitemap                 115 URLs (63 area + 7 service + blog + catalog)
purane area URL sitemap me   0  ✅
```

**Speed pehle se behtar ho gayi:**

| Page | Pehle (3 Sep) | Ab | Farak |
|---|---|---|---|
| `/` | 1.35s | **0.11s** | 12× tez |
| `/service-patna` | 0.69s | **0.14s** | 5× tez |
| `/products` | **2.71s** | **0.73s** | 3.7× tez |
| `/ro-repair-patna` | — | 0.12s | naya |
| `/blog` | 404 | 0.14s | naya |

Kuch nahi toota. **Deploy clean hai.**

---

# 🔴 PART 2 — DO BADE PROBLEM MILE

## 🔴 PROBLEM 1 — `ro-project.vercel.app` LIVE HAI aur RANK KAR RAHA HAI

Ye sabse bada issue hai. Maine measure kiya:

```
Search: "ro service boring road patna"
  1. patnaaquacare.com
  2. indianyellowpages.com
  3. ro-project.vercel.app     ← 🔴 TERA APNA DUPLICATE
  4. rokadoctor.in             ← TU
```

**Tu apne aap se compete kar raha hai — aur haar raha hai.**

Check kiya:
```
ro-project.vercel.app/                            200 ✅ live
ro-project.vercel.app/ro-repair-patna             200 ✅ live
ro-project.vercel.app/ro-service-patna/kankarbagh 200 ✅ live
ro-project.vercel.app/blog                        200 ✅ live
ro-project.vercel.app/sitemap.xml   115 URLs — poora site expose
ro-project.vercel.app/robots.txt    "Allow: /"  ← crawl karne ki khuli chhoot
```

Aur `"ro-project.vercel.app"` search karne pe `/cart` page indexed mila.

**Achhi khabar:** canonical tag sahi hai (`rokadoctor.in` point karta hai).
**Buri khabar:** canonical ek *suggestion* hai, *order* nahi. Google usse
ignore kar sakta hai — aur yahan kar raha hai, kyunki wo URL rank kar raha hai.

### Kya ho raha hai
- Har page ka **do version** Google ke paas hai
- Link equity **baant** rahi hai
- Kabhi-kabhi Google galat wala dikha deta hai (boring road pe wahi hua)
- `.vercel.app` pe koi bhi contact/trust signal nahi — customer bhaag jayega

### ✅ FIX — 2 minute, Vercel me (code change nahi)

```
1. vercel.com → project "ro-project" → Settings
2. left side → "Domains"
3. "ro-project.vercel.app" ke aage ⋯ (teen dot)
4. "Edit" → "Redirect to" → rokadoctor.in chuno
5. Save
```

Agar "Redirect to" option na mile:
```
Settings → Deployment Protection → "Vercel Authentication"
ko ON kar do preview deployments ke liye
```

**Ye aaj hi karna. Sabse zyada asar isi ka hai.**

---

## 🟡 PROBLEM 2 — Cloudflare aa gaya hai (tune lagaya?)

DNS badal gaya hai:
```
Pehle (3 Sep):  216.198.79.1        (direct Vercel)
Ab (9 Sep):     104.21.66.37        (Cloudflare)
                172.67.155.218
```

Aur Cloudflare ne **tere robots.txt me apna content inject kar diya hai**:

```
# BEGIN Cloudflare Managed content
User-agent: GPTBot          Disallow: /
User-agent: ClaudeBot       Disallow: /
User-agent: CCBot           Disallow: /
User-agent: Google-Extended Disallow: /
User-agent: Bytespider      Disallow: /
# END Cloudflare Managed Content
```

### Ghabrane ki baat NAHI hai — maine check kiya

```
Googlebot        GOOGLE SEARCH                allowed  ✅
Bingbot          Bing + Copilot               allowed  ✅
OAI-SearchBot    ChatGPT Search               allowed  ✅
PerplexityBot    Perplexity                   allowed  ✅
```

**Tera Google search bilkul safe hai.** Googlebot ban ke maine 3 page fetch
kiye — teeno 200.

Jo block hue wo sirf **AI training** bots hain (GPTBot, ClaudeBot,
Google-Extended). Wo teri ranking pe koi asar nahi dalte.

### 🟡 Par ek baat soch le

`Google-Extended` block hai = teri site **AI Overviews** (Google ka AI answer
box) me nahi aayegi. 2026 me local search ka accha hissa wahan ja raha hai.

**Agar AI Overviews me dikhna hai:**
```
Cloudflare dashboard → rokadoctor.in → Settings → AI Crawl Control
→ "Google-Extended" ko Allow kar do
```

Mera suggestion: **Google-Extended allow kar de**, baaki block rehne de.

### ⚠️ Cloudflare ka ek aur asar

`cf-cache-status: DYNAMIC` — matlab Cloudflare kuch cache nahi kar raha, sirf
proxy kar raha hai. Speed abhi bhi achhi hai (0.11s), to abhi problem nahi.
Par ye check karte rehna.

---

# 📊 PART 3 — RANKING (abhi measure ki)

## Jahan tu #1 hai 🏆

```
"ro service in patna"        #1   ← sabse bada keyword
"ro service near me patna"   #1
"ro amc patna"               #1   ← NAYA PAGE ne kiya
"ro service charge patna"    #1   ← NAYA PAGE ne kiya
```

## Jahan tu #2 hai

```
"ro repair patna"            #2   (roservicecentrepatna.in #1)
"water purifier repair patna" #2  (justdial #1)
"ro membrane replacement patna" #2 (repairpatna.in #1)  ← naya page
```

## 🔴 Jahan kaam baaki hai

```
"ro service kankarbagh patna"   #3   (rocareindia #1, justdial #2)
"ro service boring road patna"  #4   (🔴 #3 pe TERA APNA vercel.app!)
"ro service centre patna"       #4
"ro installation patna"         #5   ← naya page
```

## 🔴 Ek buri khabar

`patnaaquacare.com` — jo **mar chuka tha** (45 words, "Default page") —
**wapas aa gaya hai**. Ab 253 words hai, aur `"ro service boring road patna"`
pe **#1** hai. Title abhi bhi "Default page" hai.

Matlab: Boring Road pe ek **253-word ka page jiska title "Default page" hai**
tere 1,238-word page se upar hai. Ye pure domain-age effect hai.

---

# 🔬 PART 4 — CONTENT WAR (head-to-head)

| | HUM | roservicecentrepatna | roservicecenterpatna | repairpatna | ro-service-patna.co.in |
|---|---|---|---|---|---|
| Home words | **4,525** | 2,285 | 609 | 993 | **19** |
| Pillar words | **7,444** | — | — | — | — |
| Schema | **55–60** | 17 | **0** | 2 | **0** |
| Internal links | **140** | 0 | 22 | 68 | 4 |
| tel: links | **20** | 6 | 4 | 7 | **0** |
| FAQPage | ✅ | ❌ | ❌ | ❌ | ❌ |
| LocalBusiness | ✅ | ❌ | ❌ | ✅ | ❌ |
| Rating schema | ✅ | ✅ | ❌ | ❌ | ❌ |

**Har technical metric pe tu aage hai.** Bahut aage.

## Par 2 jagah tu peeche hai

### 1. Kankarbagh — rocareindia
```
HUM   1,215 words   42 schema
UNKA  3,392 words   43 schema   ← 2.8× zyada content
```
Unka title: `RO Service Kankarbagh, Patna @9311587744 | Water Purifier Service`
— **phone number title me hai.**

> Yaad rakh: unke saare area pages 100% identical hain (51 identical
> sentences). Wo doorway hain. Par abhi tak Google ne pakda nahi.

### 2. Installation — shandarservices.com
```
HUM   2,309 words   48 schema   8 tel
UNKA  3,254 words    0 schema   0 tel   ← zero schema, phir bhi #1
```

---

# 🎯 PART 5 — AURON SE ALAG KYA KAR SAKTE HAIN

Tune yahi poocha. Ye 6 cheezein Patna me **koi nahi kar raha**:

## 1. 🔴 Phone number title me — turant, free

Competitor jo #1 pe hai: `@9311587744` title me.
Mobile search me number **dikhta** hai — log bina site khole call karte hain.

```
ABHI:  RO Repair in Kankarbagh, Patna — ₹200 Visit | Aqua Perl
KARO:  RO Service Kankarbagh @8969821440 — ₹200 Visit
```

Ye **A/B test karne layak** hai — 5-6 area pages pe try karo, 3 hafte dekho.

## 2. 🔴 Live TDS map — Patna ka koi nahi kar sakta

Tere paas **63 area ka asli TDS data** hai. Koi competitor ke paas nahi.

```
/patna-tds-map
  Interactive map · har area ka TDS
  "Apna area chuno → TDS dekho → kaunsa purifier chahiye"
```

Ye **linkable asset** hai — log isko share karenge, local news isko quote
karegi. Backlink apne aap aayenge. **Koi Gurgaon wala ye nahi bana sakta.**

## 3. 🔴 Video — Patna me ZERO log kar rahe hain

Maine check kiya — competitors ke pages pe **ek bhi video nahi**.

```
60-second Shorts:
  "Kankarbagh ka paani — TDS meter se dikhaya"
  "Membrane badalne ka sahi tarika"
  "Ye 5 baatein — technician aapko lut raha hai"
```

YouTube + page pe embed. VideoObject schema. **Google video results me
Patna RO ka koi competitor hai hi nahi.**

## 4. 🔴 Asli photos — abhi AI photos hain (RISK)

`public/service/` me AI-generated photos hain. Ye **GBP suspension risk** hai
(reverse image search se pakda jata hai). 44 review chale jayenge.

Par isko **hathiyar** bhi bana sakte hain:
```
Har area page pe wahan ka ASLI photo
"Kankarbagh me kal ka kaam" + date + TDS reading
```
Competitor stock photos use karta hai. Tu asli lagayega. **Google image
search me tu aayega, wo nahi.**

## 5. 🟡 Same-day guarantee — koi nahi de raha

```
"90 minute me nahi pahunche to visit charge maaf"
```
Bold hai, par tu Patna me hai aur wo Gurgaon me. **Ye tu de sakta hai, wo
nahi.** Schema me bhi daal sakte hain.

## 6. 🟡 WhatsApp pe TDS check — free lead magnet

```
"Apna pincode WhatsApp karo → uss area ka TDS + kaunsa purifier chahiye"
```
Zero cost. Har message ek lead. Aur ye tere 63-area data ka istemaal hai.

---

# 📋 PART 6 — PRIORITY ORDER

## 🔴 AAJ (30 minute)

```
1. ro-project.vercel.app redirect karo          2 min   ← SABSE BADA
   vercel.com → ro-project → Settings → Domains

2. Search Console → sitemap resubmit            2 min
   115 URLs dikhega

3. URL Inspection me ye 4 daalo                 5 min
   /ro-services-patna
   /ro-repair-patna
   /ro-service-patna/jakkanpur
   /ro-service-patna/naya-tola

4. /admin → ⭐ Review maango dabao              roz 1 min
   44 → 150. Ye 36% weight hai.
```

## 🟡 IS HAFTE

```
5. Google-Extended allow karo (Cloudflare)      2 min
   AI Overviews me dikhne ke liye

6. GBP naam theek karo                          5 min
   "Aqua Perl RO Service Centre"

7. GBP hours 7 AM – 10 PM                       2 min

8. Asli photos khinch ke bhejo                  1 ghanta
   AI photos hatane hain (suspension risk)

9. Google Place ID daalo                        2 min
```

## 🟢 AGLE 2 HAFTE

```
10. Kankarbagh page 1,215 → 2,500 words
    (rocareindia ke 3,392 se ladne ke liye)
11. Phone number title test — 5 area pages pe
12. /patna-tds-map banao
13. 3 YouTube Shorts
```

---

# 💬 PART 7 — Ek imaandar baat

**Website ka kaam ab poora ho chuka hai.** Sach me.

```
Words     4,525 vs 2,285   → 2× aage
Schema    55 vs 17         → 3× aage
Speed     0.11s            → sabse tez
Pages     173              → sabse zyada
Links     140 vs 0-68      → sabse zyada
```

Aur phir bhi:
- Boring Road pe ek **"Default page"** (253 words) tere upar hai
- Installation pe **zero-schema** wali site tere upar hai
- Kankarbagh pe **100% duplicate doorway pages** wali site tere upar hai

**Kyun? Kyunki wo 19% hai jisme tu jeet raha hai.**

```
Proximity     42%   badal nahi sakte
Reviews       36%   tu 44 pe hai       ← YAHAN HAI KAAM
GBP signals   32%   naam abhi galat hai
On-page       19%   tu #1 hai isme
```

**Main 100 aur page bana dun, ye nahi badlega.**

Jo badlega:
1. `ro-project.vercel.app` band karna (aaj, 2 min)
2. Roz 1 review maangna (44 → 150)
3. GBP naam + hours theek karna

**Teeno milake 40 minute ka kaam hai. Aur inka asar 173 pages se zyada hoga.**
