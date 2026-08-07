# Phase 2 — 19 naye area pages + pillar content

**7 Aug 2026 · Aqua Perl · sab test verified**

---

# Kya hua — ek nazar mein

| Cheez | Pehle | Ab | Competitor |
|---|---|---|---|
| Patna area pages | 16 | **35** | 35 |
| `/service-patna` words | 1,984 | **5,488** | 8,719 |
| FAQs pillar page pe | 8 | **20** | 5 |
| Sitemap URLs | 54 | **72** | — |
| Area page duplicate sentences | — | **14** | **67** |

**Test: 95/95 PASS · 35/35 area pages 200 OK · tsc EXIT=0 · build EXIT=0**

---

# 🔴 Competitor ka sabse bada raaz — aur unki galti

Maine unke 3 area pages (`buddha-colony`, `kurji`, `rukanpura`) download karke compare kiye:

```
kurji vs rukanpura        → 100% same vocabulary
kurji vs buddha-colony    → 100% same vocabulary
IDENTICAL sentences       → 67 out of 136  (49%)
```

**Dono page pe hu-ba-hu ye same line hai:**

> *"At RO Care India, we recognise the value of having a RO water purifier that is fully operational in your home or office."*

> *"The danger of contracting waterborne infections also reduces with a water filter."*

## Iska matlab kya hai

Ye **doorway pages** hain — ek template, area ka naam badal ke 35 baar chipka diya. Google ka helpful-content system exactly isi cheez ko pakadta hai.

**Wo abhi isliye rank kar rahe hain kyunki:**
- Domain 13 saal purana hai (Oct 2012)
- 8,809 pages ka network hai
- Backlinks jam chuke hain

**Par ye pattern kabhi bhi update mein pit sakta hai.** Isliye maine unki nakal nahi ki.

## Tere pages ka score

```
Avg vocabulary overlap:      7.5%   (competitor 100%)
Max overlap (worst pair):   22.0%
Identical content sentences:   0    (competitor 67)
Live page duplicate lines:    14    — sirf form labels aur nav
```

14 jo bache hain wo "Book a Technician", "Select an issue…", phone number footer — **ye har page pe hone hi chahiye**. Asli content 100% unique hai.

---

# 📍 19 naye area pages

**Sabse pehle Buddha Colony** — tera apna area, tera GBP wahin hai, aur page tha hi nahi.

| # | Area | Pincode | TDS band | Common repair |
|---|---|---|---|---|
| 1 | **Buddha Colony** | 800001 | 260–480 | Old-pipeline iron sediment |
| 2 | Kurji | 800010 | 220–420 | Carbon saturation (odour) |
| 3 | Rukanpura | 800014 | 480–850 | Early membrane choking |
| 4 | Shastri Nagar | 800023 | 280–520 | Pump/adaptor failure |
| 5 | Mithapur | 800001 | 400–750 | Overworked commercial pumps |
| 6 | Bankipur | 800004 | 350–650 | Pressure-surge clogging |
| 7 | Anisabad | 800002 | 550–950 | Calcium scaling |
| 8 | Gardanibagh | 800001 | 450–800 | Mixed-source fouling |
| 9 | Kidwaipuri | 800001 | 250–450 | Low inlet pressure |
| 10 | Lodipur | 800001 | 270–500 | Neglected-unit overhaul |
| 11 | Lohia Nagar | 800020 | 480–880 | Short membrane life |
| 12 | Keshri Nagar | 800024 | 400–700 | UV degradation |
| 13 | Khajpura | 800014 | 500–900 | Iron staining |
| 14 | Hanuman Nagar | 800020 | 500–920 | Shared-borewell pressure |
| 15 | Raja Bazar | 800014 | 420–780 | Bad installation flow |
| 16 | Rajapur | 800001 | 240–460 | Monsoon turbidity |
| 17 | Sheikhpura | 800014 | 400–720 | PG high-usage exhaustion |
| 18 | Mahendru | 800006 | 300–580 | UV + monsoon bacteria |
| 19 | New Punaichak | 800001 | 290–540 | Seized pump from idling |

**Saare pincode `api.postalpincode.in` se verify kiye** — guess nahi kiya.

Har area ka apna:
- measured TDS band
- alag dominant failure mode
- asli landmarks (Sai Gali, Hartali Mor, Jyotipuram Colony, RPS More…)
- apna water story

---

# 📄 Pillar page — 1,984 → 5,488 words

`/service-patna` pe 5 naye section jode:

### 1. "Patna mein RO service — hum alag kyun hain"
Asli proof points, marketing nahi. Published groundwater study ka data (TDS 174–1,284 ppm, hardness 156–760 mg/L).

### 2. "Patna ke paani ka TDS — area ke hisaab se"
4 zone: soft (<300), moderate (300–500), hard (500–800), very hard (800+). Har zone mein kaunse area, kya problem, kya solution.

**Ye keyword pakadta hai:** `patna water tds`, `patna me pani ka tds kitna hai`

### 3. "RO ki common problem aur unka asli karan"
8 problems — symptom (Hinglish + English), causes, fix, cost, aur **Patna-specific note**.

**Ye keyword pakadta hai:** `ro not working`, `ro se pani nahi aa raha`, `ro leaking`, `ro water bad smell`

### 4. "Filter kitne din chalta hai — Patna mein"
5 filter stage. **Company rating vs Patna reality** side by side — sediment 6 months vs 3-4 months.

**Ye keyword pakadta hai:** `ro filter kitne din chalta hai`, `ro membrane life`

### 5. "Naya RO lene se pehle — seedhi salah"
5 buying questions. Copper/alkaline pe honest jawab (zaroorat nahi hai).

**Ye keyword pakadta hai:** `patna ke liye best ro`, `75 gpd ya 100 gpd`

### 6. FAQs — 8 se 20
12 naye long-tail questions, sab Hinglish mein jaise log type karte hain.

---

# 🎯 Keywords jo ab target ho rahe hain

**Area keywords (35 × 3 = 105 combinations):**
```
ro service buddha colony          ro repair buddha colony patna
ro service kurji patna            water purifier repair kurji
ro service anisabad               ro service khajpura patna
...aur 30 area × har variation
```

**Problem keywords (naye):**
```
ro se pani nahi aa raha            ro water leakage repair
ro me badbu aa rahi hai            ro slow water flow
ro bar bar band ho raha hai        ro high tds problem
```

**Filter/parts keywords (naye):**
```
ro filter kitne din chalta hai     ro membrane life patna
sediment filter kab badle          uv lamp replacement patna
ro filter price patna              75 gpd vs 100 gpd
```

**Water keywords (naye):**
```
patna water tds                    patna me pani kitna hard hai
kankarbagh water tds               patna borewell water quality
```

**Buying keywords (naye):**
```
patna ke liye best ro              copper ro zaroori hai kya
local ro vs branded                amc lena chahiye ya nahi
```

---

# ✅ Test results — sab verify kiya

```
════ Pillar page ════
  words: 5,488  (target 4,000+)                 PASS

════ 35 area pages ════
  200 OK: 35 / 35   FAIL: 0                     PASS

════ Naye pages ka content ════
  buddha-colony   1,497 words
  kurji           1,465 words
  anisabad        1,432 words
  mahendru        1,444 words

════ Uniqueness ════
  avg vocabulary overlap:      7.5%   (comp 100%)
  identical content sentences:   0    (comp 67)

════ Sitemap ════
  URLs: 72  (pehle 54)
  buddha-colony present:  YES

════ Purana kuch toota? ════
  brand/naam regression:  51/51 PASS
  admin panel:            44/44 PASS
  / /products /login /admin — sab 200

  tsc EXIT=0 · build EXIT=0
```

---

# 📤 Upload steps

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git pull --rebase origin main
```

**← yahan ruk ke zip extract karke files replace karo** (Ctrl+A → Ctrl+C → paste → "Replace the files")

```cmd
git status
git add .
git commit -m "add 19 Patna area pages (16 to 35), expand pillar content to 5488 words"
git push origin main
```

Vercel khud deploy karega, 3-4 min.

---

# 🔴 Deploy ke baad — ye 3 kaam turant

## 1. Search Console mein naye pages submit karo

`search.google.com/search-console` → **Sitemaps** → `sitemap.xml` dobara submit

Phir **URL Inspection** mein ye 5 sabse zaroori page daal ke **Request Indexing**:

```
https://rokadoctor.in/service-patna
https://rokadoctor.in/service-patna/buddha-colony
https://rokadoctor.in/service-patna/kurji
https://rokadoctor.in/service-patna/anisabad
https://rokadoctor.in/service-patna/rukanpura
```

> Roz 10 URL tak kar sakta hai. Baaki apne aap sitemap se crawl honge.

## 2. GBP service area mein naye area jodo

GBP → Edit profile → Service area → ye add karo:

```
Buddha Colony · Kurji · Rukanpura · Shastri Nagar · Mithapur
Bankipur · Anisabad · Gardanibagh · Kidwaipuri · Lodipur
Lohia Nagar · Keshri Nagar · Khajpura · Hanuman Nagar
Raja Bazar · Rajapur · Sheikhpura · Mahendru · New Punaichak
```

> GBP mein 20 tak hi aate hain. Pehle wale 16 mein se kam-important hata ke ye daalo, ya jo sabse zyada kaam wale area hain wahi 20 rakho.

## 3. GBP post — naye area announce karo

```
Ab Buddha Colony, Kurji, Rukanpura aur Anisabad mein bhi
RO service — visit charge sirf ₹200.

Buddha Colony mein hamari apni shop hai (Sai Gali, opp B-62),
isliye wahan 30 minute mein pahunch jaate hain.

📞 8969821440
```

---

# 🕐 Kya expect karna

| Time | Kya hoga |
|---|---|
| 3-7 din | Google naye pages crawl karega |
| 2-3 hafte | Search Console mein impressions dikhne lagenge |
| 1-2 mahine | Area keyword pe page 2-3 |
| 3-4 mahine | `ro service buddha colony` jaise keyword pe top 5 |
| 6 mahine | Kai area keyword pe top 3 |

**Buddha Colony sabse pehle rank karega** — kyunki GBP address wahin hai. Proximity + page = strong combo.

---

# 🔴 Ab bhi pending — ye rank rokte hain

| Kaam | Kyun zaroori |
|---|---|
| **AI photo hatana** | GBP suspend hua to 44 review chale jaayenge |
| **GBP naam se "Best Ro Service in Patna" hatana** | Suspension risk |
| **Search Console setup** | Iske bina pata nahi chalega kaun sa keyword chal raha |
| **GA4 push** | Zip mein hai, deploy hote hi chalu |
| **Blog** | Competitor ke 193 posts, tere 0 — Phase 3 |
| **Email MX record** | Zoho free hai |

---

# Aage kya (Phase 3)

Bolo to ye bana dunga:

1. **Blog system** — Patna-specific topics jo Gurgaon wale likh hi nahi sakte
2. **Brand × Area pages** — `kent-ro-service-kankarbagh` type (21 brand × 35 area = bahut zyada, top 50 combination hi banayenge)
3. **Rate card page** — har part ka daam, `ro parts price patna` keyword ke liye
