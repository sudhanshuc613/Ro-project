# 🔴 GSC ke 2 ASLI ERROR — dono meri galti — 19 Oct 2026

Owner ne Search Console ke screenshot bheje aur live HTML paste kiya.
**Dono error asli the, dono maine banaye the.** Pakde, theek kiye, aur dono ke
liye permanent test bana diya.

---

## 1. Kya galat tha — live HTML se saaf

Homepage ke JSON-LD me **do node ek hi `@id` par** the, aur **dono me `aggregateRating`**:

```json
node2  ["LocalBusiness","HVACBusiness"]  @id=.../#localbusiness   aggregateRating ✓
node3  "LocalBusiness"                   @id=.../#localbusiness   aggregateRating ✓  review ✓
```

### 🔴 GALTI 1 — "Review has multiple aggregate ratings"  (critical)

Google ek hi `@id` ke node **merge** karta hai. Merge ke baad us ek entity par
**DO aggregateRating** ho gaye. Google ye saaf mana karta hai.

GSC ne 5 detected item par yahi critical issue diya:
```
Aqua Perl RO Service Patna   ● 1 critical issue
Aqua Perl RO Service Patna   ● 1 critical issue
Aqua Perl                    ● 1 critical issue  ● 1 non-critical
Aqua Perl                    ● 1 critical issue  ● 1 non-critical
Aqua Perl                    ● 1 critical issue  ● 1 non-critical
```

**Ye 16 Oct ko maine hi banaya.** Us din maine @id conflict "fix" kiya tha —
`name`, `image`, `telephone`, `address` hata diye — par **`aggregateRating`
dono node me chhod diya**.

🔴 **Aur usse bura:** maine ise "verify" bhi kar liya tha. Test
`verify-titles-and-schema.sh` likhta tha ki `reviewCount` **exactly 2 baar**
aana chahiye. **Test khud hi bug ko sahi maan raha tha.**

### 🔴 GALTI 2 — nested review me `itemReviewed`  (non-critical)

```
A nested '<parent_node>' object can't contain the 'itemReviewed' field.
Remove 'itemReviewed' to avoid directional conflict.
```

Google ka apna doc:
> *"if the review is nested into another schema.org type using the `review`
> property, **omit** the `itemReviewed` property (we assume the parent item is
> the reviewed item)."*

Hamare teeno review me `itemReviewed: {LocalBusiness, name: "Aqua Perl"}` pada tha.

---

## 2. Fix

`src/lib/seo/schema.ts` → `reviewSchema()`:

| | pehle | ab |
|---|---|---|
| `aggregateRating` | **dono node me** | sirf `localBusinessSchema()` me |
| `itemReviewed` (nested review) | teeno me | **hata diya** |
| `review` array | 3 | **3** (kuch gaya nahi) |

Rating gayab nahi hui — merge ke baad wahi ek rating usi entity par lagti hai.

### Naap — fix ke baad (local)
```
node2  LocalBusiness+HVACBusiness  @id #localbusiness  aggRating=True   review=False
node3  LocalBusiness               @id #localbusiness  aggRating=False  review=True

"reviewCount"             1 baar   (pehle 2)
"@type":"AggregateRating" 1        (pehle 2)
"@type":"Review"          3        (waise ka waisa)
"@type":"Person"          3        (waise ka waisa)
itemReviewed              0        (pehle 3)
page par dikhne wala      58 Google reviews  ✓
```

---

## 3. 🆕 Detector me DO naye check — ab ye galti nikal nahi sakti

`scripts/jsonld-parents.py` me:

1. **Ek `@id` par ek se zyada `aggregateRating`**
   Har block ka tree walk karke `@id` ke hisaab se `aggregateRating` ginta hai.
   1 se zyada = FAIL.
2. **Nested review me `itemReviewed`**
   JSON path me `.review` hai aur node me `itemReviewed` = FAIL.

### Saboot ki detector sach me kaam karta hai
```
LIVE par (jo abhi toota hai)          → 4 FAIL
  / : @id #localbusiness par 2 aggregateRating
  / $[3].review[0] : nested Review me itemReviewed
  / $[3].review[1] : nested Review me itemReviewed
  / $[3].review[2] : nested Review me itemReviewed

LOCAL par (fix ke saath)              → 0 FAIL  (1737 PASS)
```
Ye theek wahi 4 cheez hain jo GSC ne pakdi thi.

### Test bhi theek kiya
`verify-titles-and-schema.sh` ab:
```
reviewCount sirf 1 baar          (pehle "2" maangta tha — wahi bug tha)
AggregateRating sirf 1 node par
nested review me itemReviewed = 0
```

---

## 4. 🔴 TEESRI GALTI — test chala hi nahi aur PASS jaisa dikha

Suite chalayi to `verify-browser` ne **PASS 0 / FAIL 0** chhapa.
Matlab Chromium missing tha, script crash ho gayi, aur `verify-all.sh` uske
output se number nikaal nahi paaya — to usne 0/0 maan liya.

**Na chalne wala test PASS jaisa dikhna** — ye sabse khatarnaak kism ki galti hai.

**Fix:** `browser-check.mjs` ab launch fail hone par saaf `PASS: 0  FAIL: 1`
deta hai aur theek karne ka tarika bhi likhta hai.

**Saboot:** Chromium chhupa ke chalaya →
```
FAIL  Chromium launch nahi hua — ye test CHALA HI NAHI.
      Thik karo: npx playwright install chromium
PASS: 0    FAIL: 1
```

---

## 5. Jo tune paste kiya usme ek cheez GALAT ALARM thi

Tere HTML me ProofStats aise dikh rahe the:
```
1.9★ · 914+ · 33 · 8 · 3+ · ₹78
```
Lagta hai sab galat hai. **Par ye bug nahi hai.**

Server ka asli HTML naapa:
```
Google rating    → "5.0★"
Repairs done     → "2,400+"
Areas covered    → "83"
Brands serviced  → "21"
In Patna         → "7+"
Visit charge     → "₹200"
```
Sab sahi. `CountUp` component number ko 0 se target tak **animate** karta hai.
Tune browser ka DOM us animation ke **beech me** copy kiya, isliye adhoore
number dikhe. 2 second baad wo poore ho jaate hain.

(Tere HTML me `reviewCount:"50"` bhi tha — wo purana cache tha. Live abhi **58** hai.)

---

## 6. Poora test — 3561 PASS / 0 FAIL (26 script)

```
tsc --noEmit            EXIT 0
check-client-exports    PASS (94 import)
check-async-in-client   PASS (80 client component)
next build              EXIT 0 — 210 static page
verify-all              3561 PASS / 0 FAIL
  verify-jsonld-parents    1737 / 0   ← 2 naye check ke saath
  verify-titles-and-schema   48 / 0   ← theek kiya hua test
  verify-browser             25 / 0   ← asli Chromium me
  verify-gbp-consistency    256 / 0
  verify-admin-deep          84 / 0
```

### Baaki jaanch
```
deep-audit (143 page)   FAIL 0 · H1==1 143/143 · noindex 0 · thin 0
                        duplicate title 0 · invalid JSON-LD 0
keyword (baseline)      TOTAL 94 · MISS 0
                        PRIMARY/INTENT/SHOP/BRAND/NEARME/TRUST — sab MISS 0
area 12×83              82 area 12/12, 1 area 11/12 (kadamkuan-mahendru = scanner artifact)
brand × area            1577/1577 (100%)
link check              150/150 → 200 · toote 0 · redirect 0
```

---

## 7. Kuch toota to nahi

```
132 code-driven page:
  content loss      0
  H1+H2+H3   live 6,021  =  local 6,021
  tel:       live 2,252  =  local 2,252
  words      live 421,131   local 420,998   (Cloudflare email mask)

Protected files  5/5 SAME
Navbar 19,454 bytes · isServicePage 0
5 image byte-same
```

---

## 7b. 🔴 CHAUTHI GALTI — `APPLY.ps1` KHUD TOOTI HUI THI

Zip bhejne se pehle maine `APPLY.ps1` ko dobara padha. Usme **3 asli bug** the.
Agar main zip bhej deta, **script tere laptop par ek line bhi na chalti.**

### Bug 1 — PowerShell ParserError (sabse bada)
`$expected` hashtable me **duplicate key** tha:
```powershell
"src\components\service\NearMeBlock.tsx"  = 11359     <- purana
...
"src\components\service\NearMeBlock.tsx"  = 11858     <- naya
```
PowerShell hashtable me ek key do baar allowed **nahi** hai. Ye **parse-time**
error hai — matlab script load hi nahi hoti, ek bhi line nahi chalti.

**Saboot (asli PowerShell 7.4.6 parser se, guess nahi):**
```
/tmp/apply-OLD.ps1   PARSE ERRORS: 1
   line 167: Duplicate keys 'src\components\service\NearMeBlock.tsx'
             are not allowed in hash literals.

/home/user/tools/APPLY.ps1 (fix ke baad)   PARSE ERRORS: 0
```

### Bug 2 + 3 — purane byte size
```
src\app\(shop)\page.tsx                           likha 18129  asli 18336
src\app\(shop)\ro-service-patna\[area]\page.tsx   likha 33151  asli 33171
```
Ye `$fail` badha dete → script bolti *"PUSH NAHI karunga"* → tu block.

### Fix
* duplicate key hataya (27 unique entry, dono list me same key)
* saare 27 size **asli file se dobara naape**
* bonus: 5 jagah `Test-Path` → `Test-Path -LiteralPath` (bracket folder safe)

### Permanent gate — `/home/user/tools/check-apply.py`
Ab har zip se pehle chalega. Jaanchta hai:
duplicate hashtable key · `$checkList` == `$expected` · **har size asli file se** ·
`\\` wali PowerShell string · `-LiteralPath` · `-Raw` · robocopy ·
Navbar+image guard · **aur asli PowerShell parser se parse**.

```
APPLY.ps1 GATE   PASS: 46   FAIL: 0
```

---

## 7c. Maine khud poora crawl kiya (tune bola tha)

### LOCAL (fix wala build) — 143 page
```
duplicate aggregateRating per @id   0 page   ✅
itemReviewed nested review          0 page   ✅
'itemReviewed' string kahin bhi     0 page   ✅
```

### LIVE rokadoctor.in — 144 page (abhi bhi toota hai)
```
duplicate aggregateRating per @id   1 page   🔴  sirf  https://rokadoctor.in/
itemReviewed nested review          1 page   🔴  3 review
'itemReviewed' string               1 page   🔴  6 baar
baaki 143 page                      saaf
```
Matlab bug **sirf homepage** par hai — aur GSC ke 5 item isse exactly milte hain
(2 LocalBusiness node + 3 Review).

### Aur jaanch
```
deep-audit 143 page       FAIL 0 · TOTAL WORDS 433,332
linkcheck                 146 page se 155 link · 155/155 → 200 · toote 0 · redirect 0
glue bug (source .tsx)    316 file · 1 hit = FALSE POSITIVE
                          HeroCarousel.tsx '₹4,999<span>+GST</span>' — ye branch
                          server HTML me render hi nahi hoti, aur '+' se shabd
                          chipakte bhi nahi. Kuch nahi badla.
CYRILLIC / GREEK homoglyph  0
dynamicParams = false       0 route (dono route par = true)
check-async-in-client       80 client component — PASS
check-client-exports        94 import — PASS
kwscan baseline             TOTAL 94 · MISS 0 (6/6 category)
area 12×83                  sab 12/12
```

### Sitemap 144 (live) vs 143 (local) — ye bug nahi
```
LIVE me hai, LOCAL me nahi:
  /products/apple-alfa-alkaline-copper-12l-ro-purifier
LOCAL me hai, LIVE me nahi:  (koi nahi)
```
Ye **data** ka farak hai, code ka nahi — Apple Alfa product live DB me hai,
local seed me nahi. Push se ispe koi asar nahi padega.

### Competitor — 19 Oct (24 ghante me kya badla)
| site | sitemap 18 Oct | sitemap 19 Oct | badla |
|---|---:|---:|---|
| roservicecentrepatna.in (Google #1) | 67 | 67 | — |
| rocareindia.com | 8,230 | 8,231 | +1 |
| serviceondoors.com | 50,302 | 50,302 | — |
| rosaleandservices.com | 119 | 119 | — |
| aquasolutionindia.com | 500 | 500 | — |
| roservicecenterpatna.com | 7 | 7 | — |

**Kisi ne kuch nahi kiya.** Aur ab bhi **kisi ke heading me area ya brand ka naam
nahi** (rocareindia 4 brand-head, waterix 1 — bas). Hamare **22 area-heading**
abhi bhi sabse bada farak hai.

---

## 8. Badli hui file — sirf 4 (+ APPLY.ps1)

| file | bytes | kya |
|---|---:|---|
| `src/lib/seo/schema.ts` | **26,209** | 🔴 duplicate `aggregateRating` + `itemReviewed` hataya |
| `scripts/jsonld-parents.py` | **19,781** | 2 naye check |
| `scripts/verify-titles-and-schema.sh` | **8,454** | galat expectation theek ki |
| `scripts/browser-check.mjs` | **6,885** | na chalne par saaf FAIL |
| `APPLY.ps1` | **11,419** | 🔴 duplicate key + 2 purane size + `-LiteralPath` |

🔴 **Koi keyword, heading, text, rate, area data, rating value NAHI badla.**
Sirf schema ka dhaancha theek hua.

### Zip ki jaanch
```
entries             630   (purana 629 + VERIFY-19OCT-SCHEMA.md)
purane zip se gaya   0    ← kuch hataya nahi
extract files       439 · bracket folder 75
md5 vs source       437 identical · 0 mismatch · 0 missing
public/             33 file · 11 MB      mockup/  4 file · 5.4 MB
protected 5/5       md5 same · Navbar 19,454 · isServicePage 0
5 image             byte-same
zip ke andar APPLY.ps1   46 PASS / 0 FAIL
```

---

## 9. Push ke baad Search Console me

1. URL Inspection → `https://rokadoctor.in/` → **TEST LIVE URL**
   → Review snippets me **0 critical issue** aana chahiye
2. **Enhancements → Review snippets → VALIDATE FIX**

🔴 **Imaandar baat (dobara):** error hat jayega, par **star phir bhi nahi aayenge** —
Google ka self-serving rule LocalBusiness par star dikhata hi nahi.
Star ka asli zariya **GBP (Maps + Local Pack)** hai. Isliye reviews 58 → 200
aur GBP ke "Open 24 hours" wala fix hi asli kaam hai.

---

## 10. Rollback
* **Vercel** → Deployments → purana 🟢 Ready → ⋯ → **Promote to Production** (30 sec)
* **Git** → `git reset --hard backup-<date>`
