# 4 competitor ka deep scan — aur jo mila
### 16 Sep 2026 · sab kuch unke live HTML se measure kiya

---

## Tu ne 4 URL diye. Charo scrape kiye. Ye mila.

| | rosale | rocare | onedios | sulekha | **HUM** |
|---|---|---|---|---|---|
| HTTP | 200 | 200 | 200 | **403** | 200 |
| Title length | 59 | 60 | 29 | — | 56 |
| Words | **3,341** | 2,483 | 1,860 | — | 2,520 |
| Schema blocks | 1 | 7 | **0** | — | 2 |
| Schema types | 2 | 12 | **0** | — | **21** |
| H2 count | 17 | 10 | 60 | — | 10 |
| Images | **37** | 26 | 658 | — | **5** |
| Domain (first SSL) | 2021-07 | **2017-11** | 2018-09 | — | **2025-09** |

**Sulekha ne humein 403 diya** — wo bot block karte hain. Matlab unka page
scrape nahi kar sakte, par SERP me wo hai.

---

# 🔴 GAP 1 — Synonym keywords. Ye sabse bada tha.

Maine har page ke rendered body me phrase count kiye:

```
phrase                              rosale  rocare  onedios   HUM
────────────────────────────────────────────────────────────────
ro service in patna                    6       8       6      11  ✅
water purifier service in patna        1       3       4       0  🔴
water purifier service                 7      15       -       0  🔴
ro service near me                     0       8       0       0  🔴
ro water purifier                      5       1      20       0  🔴
ro service centre                      0       6       0       1
ro service center                      0       4       3       0  🔴
water purifier repair                  3       1       0       0  🔴
ro technician                          3       1       -       0  🔴
ro servicing                           1       1       -       0  🔴
```

**Sat head synonym hamare page pe ZERO the.**

Ye kyun matter karta hai: Google `"water purifier service in patna"` aur
`"ro service in patna"` ko **related but distinct** queries maanta hai. Jo page
doosra phrase kabhi bolta hi nahi, wo uske liye rank nahi kar sakta — chahe
schema kitna bhi achha ho.

Aur ye chhoti query nahi hai. Google autocomplete:
```
water purifier service in patna   →  8 variants
ro service near me                → 10 variants
ro water purifier service         → 10 variants
best ro service in patna          →  5 variants
ro service centre in patna        →  7 variants
```

### ✅ Fix

`/ro-service-in-patna` par:
- **Ek naya intro paragraph** jo saare naam ek saath bolta hai — natural sentence
  me, stuffing nahi:
  > *"People search for this job under several names — RO service in Patna,
  > water purifier service in Patna, RO service near me, RO service centre in
  > Patna, or simply an RO technician in Patna. It is all the same visit and
  > the same fixed rate."*
- **5 nayi FAQs** jo har missing phrase ko apna jawab deti hain:
  - "Is water purifier service in Patna the same as RO service?"
  - "Are you an RO service centre in Patna or an individual technician?"
  - "Do you do RO service near me in my area of Patna?"
  - "Do you handle water purifier repair as well as routine RO servicing?"
  - "Is there an RO service center near Kankarbagh or Boring Road?"
- **8 naye keywords** metadata me

**Measured result (rendered page, pehle vs ab):**
```
ro service in patna               11 → 16
water purifier service             0 →  2
water purifier service in patna    0 →  2
ro service near me                 0 →  2
ro service centre                  1 →  3
ro water purifier                  0 →  1
ro technician                      0 →  1
words                          2,520 → 2,795
```

---

# 🔴 GAP 2 — H2 headings. Hum aadhe waste kar rahe the.

Ye maine H2 text extract karke count kiya:

**rosaleandservices.com — 10 of 17 H2 me keyword:**
```
✅ Our Expert RO Services in Patna
✅ Why Choose RO Sale & Services in Patna?
✅ Complete RO AMC Plans for Patna
✅ Expert Service for All RO Brands in Patna
✅ Our Service Areas in Patna
✅ Why Regular RO Maintenance Matters in Patna
✅ Get Patna's Best RO Service Today!
```

**Hamara page — sirf 5 of 10:**
```
🔴 What the job actually involves
🔴 How to tell you need this
🔴 Where people get overcharged
🔴 Every brand, same job
🔴 Other things we do
```

H2 H1 ke baad **sabse bada structural signal** hai. Hum aadha signal generic
phrasing pe barbaad kar rahe the.

### ✅ Fix — ab 10/10

```
✅ RO Service in Patna — what the job actually involves
✅ What it costs in Patna
✅ How to tell you need RO Service in Patna
✅ RO Service in Patna — where people get overcharged
✅ RO Service in Patna — kaam kaisa dikhta hai
✅ RO Service in Patna — common questions
✅ We cover all of Patna
✅ RO Service in Patna for every brand
✅ Other RO services in Patna
✅ RO Service in Patna — book abhi
```

Aur ye `intent.h1` se aata hai, hardcode nahi — matlab **saare 7 intent pages**
pe apne aap sahi ho gaya (`/ro-repair-patna` pe "RO Repair in Patna — what the
job actually involves" banega).

**10/10 — rosale ke 10/17 (59%) se behtar.**

---

# 🔴 GAP 3 — Images. Ye main theek NAHI kar sakta.

```
rosale   37 images
rocare   26 images
onedios  658 images
HUM       5 images
```

Hamare paas **sirf 3 asli photo** hain (`public/service/`):
- `technician-working.jpg`
- `tds-testing.jpg`
- `membrane-old-new.jpg`

**Ye tere bina nahi ho sakta bhai.** Mujhe 15-20 asli photo chahiye:
- RO khulа hua, andar ke filter dikhte hue
- Gandi membrane vs nayi (side by side)
- TDS meter ka reading — before aur after
- Tera van / tool bag
- Customer ke ghar me machine lagate hue
- Bill / service card

Ek baar bhej de, main har area page aur intent page pe laga dunga with proper
alt text + ImageObject schema. **Abhi ye 37 vs 5 ka gap khula hai.**

⚠️ Internet se uthayi ya AI photo **mat** dena — reverse image search se GBP
suspension ho sakti hai aur 50 reviews chale jayenge.

---

# 📊 Jahan hum AAGE hain (ye bhi sach hai)

| | hum | rosale | rocare | onedios |
|---|---|---|---|---|
| **Schema types** | **21** | 2 | 12 | **0** |
| HowTo schema | ✅ | ❌ | ❌ | ❌ |
| FAQPage schema | ✅ | ❌ | ✅ | ❌ |
| AggregateRating | ✅ | ❌ | ✅ | ❌ |
| GeoCircle / service area | ✅ | ❌ | ❌ | ❌ |
| FAQ entries | **26** | — | — | — |

**onedios ke paas ZERO schema hai aur wo #3 pe hai** — sirf domain authority
(2018 se) aur 658 images ke dam par.

Ye batata hai ki schema akela ranking nahi deta. Par jab domain age barabar
ho jayegi to schema hi farak banayega — aur rich results (FAQ dropdown, HowTo
steps) abhi bhi CTR badhate hain.

---

# ⚠️ Sabse badi sachai — domain age

```
rocareindia.com        2017-11   (8 saal)
onedios.com            2018-09   (7 saal)
rosaleandservices.com  2021-07   (4 saal)
rokadoctor.in          2025-09   (12 mahine)
```

**Hum sabse naye hain, 3 se 7 saal peeche.**

Ye main jaadu se theek nahi kar sakta, aur jo bole ki kar sakta hai wo jhooth
bol raha hai. Domain trust time leta hai. Par do cheez isko tez karti hain:

1. **Backlinks** — abhi hamare paas lagbhag zero hain. Maine check kiya,
   `"rokadoctor.in"` ka mention sirf Trustpilot pe mila.
2. **Directory listings** — JustDial, Sulekha, IndiaMART. Ye teeno khud
   ranking me hain aur inse backlink + citation dono milte hain.

**Yahi wajah hai ki main bar-bar wo 5 listing bol raha hu.** Wo koi side kaam
nahi hai — wo domain authority banane ka sabse tez tareeka hai jo tere haath
me hai.

---

# ✅ Naya permanent test — `verify-keyword-coverage.sh`

Ab ye 27 checks har build pe chalte hain:
- 10 head synonyms ka minimum count (rendered page pe, source file pe nahi)
- 4 money pages pe H2 keyword density ≥ 80%
- Word count ≥ 2,400 (rocare 2,483 ko match karne ke liye)
- FAQ entries ≥ 12
- 11 pages 200 return karein

**Agar koi keyword dobara zero ho gaya to build fail hogi.**

---

# 📦 Test report

```
Build          : EXIT 0 · 191 pages · ZERO warnings
Test suite     : 1070 / 1070 PASS · 0 FAIL   (naya test 27/27)
Zip == dir     : 0 differences
Secrets        : 0
Kuch toota     : 16/16 pages OK
H1 glue        : none ✅
```

---

# 📤 Upload

**Zip:** `aquaperl-KEYWORD-FIX.zip` · 14.46 MB (MD5 chat me diya hai)

**Sirf 5 files:**
```
[BADLI] src/lib/seo/service-intent-data.ts       81,348 bytes  ← synonyms + 5 FAQ
[BADLI] src/app/(shop)/[intent]/page.tsx         20,040 bytes  ← 5 H2 keyword-rich
[BADLI] scripts/verify-all.sh                     1,406 bytes
[NAYI]  scripts/verify-keyword-coverage.sh        6,190 bytes  ← naya test
[BADLI] NAYA-HATHIYAR-16SEP.md
```

`patna-service-data.ts` **140,115 bytes — nahi chhua.** 73 area page safe.

### Verify after copy
```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
$want = @{
  "src\lib\seo\service-intent-data.ts"      = 81348
  "src\app\(shop)\[intent]\page.tsx"        = 20040
  "scripts\verify-keyword-coverage.sh"      = 6190
  "src\lib\seo\patna-service-data.ts"       = 140115
}
foreach ($k in $want.Keys) {
  $sz = (Get-Item -LiteralPath $k).Length
  if ($sz -eq $want[$k]) { Write-Host "OK   $k ($sz)" -f Green }
  else { Write-Host "GALAT $k — $sz, chahiye $($want[$k])" -f Red }
}
```

Commit:
```
fix: add head synonyms and keyword-rich H2s measured against 4 ranking competitors
```

---

# Ab imaandari se — ye kaafi hai kya?

**Nahi.** Ye teen me se do gap band hue. Baaki teen cheezein **sirf tu** kar sakta hai:

| Kaam | Kyun | Time |
|---|---|---|
| **15-20 asli photo bhej** | 37 vs 5 ka gap. Iske bina Image search aur trust dono khali | 30 min |
| **5 directory listing** | Domain age 3-7 saal peeche hai. Backlink + citation ka sabse tez rasta | 45 min |
| **GSC Request Indexing** | Naye pages Google ko pata hi nahi | 10 min |

Site ka on-page kaam ab competitor se behtar hai — schema 21 vs 2, H2 10/10 vs
10/17, FAQ 26. **Jo bacha hai wo site ke bahar hai.**
