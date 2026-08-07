# Google Ads Sitelinks — teri website ke hisaab se

**6 Aug 2026 · Aqua Perl**

---

# 🔴 Pehle ye — Google ne jo suggest kiya, wo SAB TOOTA HUA hai

Tere screenshot mein Google ne 4 sitelink bana ke rakhe hain. Maine har ek check kiya:

| Google ka sitelink | Kaunsa page? | Status |
|---|---|---|
| Testimonials | `/testimonials` | ❌ **404** |
| Directions | `/directions` ya `/location` | ❌ **404** |
| Affordable RO Repair | `/affordable-ro-repair` | ❌ **404** |
| Testimonials (dobara) | — | ❌ **404 + duplicate** |

**Chaaro ke chaaro 404 hain.** Aur do to bilkul same naam ke hain ("Testimonials" 2 baar).

## Agar ye chala diya to kya hoga

1. Customer ad pe click karega → **"Page not found" khulega** → turant wapas chala jaayega
2. Tu **uske click ka paisa dega** — bina kuch mile
3. Google ka **Quality Score girega** → har click aur mehnga ho jaayega
4. Bounce rate badhega → aage ke ads bhi mehnge

**Ye Google ka AI "auto-suggest" hai — usne tere site ko theek se dekha hi nahi.** Bharosa mat kar.

> Neeche wala message *"I found some sitelinks for you"* — **usko accept mat karna.**

---

# ✅ Pehla kaam — ye 4 DELETE kar

Har ek ke aage **🗑️ (dustbin)** icon hai. Chaaro pe click kar ke hata de.

Phir **Edit** dabake naye banayenge.

---

# 📏 Google ke rules (2026)

| Field | Limit |
|---|---|
| **Sitelink text** (title) | **25 character** |
| **Description line 1** | **35 character** |
| **Description line 2** | **35 character** |

> Space aur punctuation bhi ginte hain.
> Mobile pe 15-17 character se chhota rakhna behtar hai — poora dikhta hai.

**Kitne banane hain:** kam se kam 4, **8 sabse achha**. 6+ sitelink wale ads ko **10-20% zyada CTR** milta hai.

---

# 🎯 TERE liye 8 sitelinks — copy-paste ready

Maine tere **asli pages** check kiye (sab 200 OK hain) aur unke hisaab se likha hai.

---

## 1️⃣ RO Repair — ₹200 Visit

```
Text (22):  RO Repair — ₹200 Visit
Line 1 (33): Same-day Patna visit. All brands.
Line 2 (30): TDS test + diagnosis included.
URL: https://rokadoctor.in/service-patna
```

**Kyun:** ₹200 tera sabse bada hathiyaar hai. Competitor ₹350-399 lete hain. Ye pehla sitelink hona chahiye.

---

## 2️⃣ AMC Plans From ₹1,499

```
Text (21):  AMC Plans From ₹1,499
Line 1 (34): 3 services/year, filters included.
Line 2 (30): Cheaper than paying per visit.
URL: https://rokadoctor.in/amc-plans
```

**Kyun:** AMC = mahine ki pakki kamai. Ek customer = ₹1,499+ saal bhar ke liye.

---

## 3️⃣ Kent, Aquaguard & More

```
Text (22):  Kent, Aquaguard & More
Line 1 (32): 21 brands serviced across Patna.
Line 2 (31): Genuine parts, 30-day warranty.
URL: https://rokadoctor.in/service-patna/brand
```

**Kyun:** log brand ka naam search karte hain — "kent ro service patna". Tere paas 21 brand pages hain, ye unka hub hai.

---

## 4️⃣ Filters & Spare Parts

```
Text (21):  Filters & Spare Parts
Line 1 (34): Membranes, filters, booster pumps.
Line 2 (30): Genuine parts, India delivery.
URL: https://rokadoctor.in/category/spare-parts
```

**Kyun:** ye pan-India bikta hai — sirf Patna nahi. Extra kamai.

---

## 5️⃣ Buy New RO Purifier

```
Text (19):  Buy New RO Purifier
Line 1 (31): RO + UV + UF, alkaline, copper.
Line 2 (31): Free installation across Patna.
URL: https://rokadoctor.in/category/new-ro-purifiers
```

**Kyun:** tune bola tu bechta bhi hai. Ye page uske liye hai.

---

## 6️⃣ Commercial RO Plants

```
Text (20):  Commercial RO Plants
Line 1 (32): Shops, schools, hotels, offices.
Line 2 (33): 250 LPH onwards. Free site visit.
URL: https://rokadoctor.in/category/commercial-plants
```

**Kyun:** ek commercial deal = 20 ghar ke barabar. Sabse zyada munafa yahin hai.

---

## 7️⃣ Service in Your Area

```
Text (20):  Service in Your Area
Line 1 (31): Kankarbagh, Boring Rd, Danapur…
Line 2 (26): 16 areas. 90-min response.
URL: https://rokadoctor.in/service-patna
```

**Kyun:** log apne area ka naam search karte hain. Ye 16 area pages ka gateway hai.

---

## 8️⃣ Call 8969821440

```
Text (15):  Call 8969821440
Line 1 (31): Talk to a technician right now.
Line 2 (27): Open 8 AM – 9 PM, all days.
URL: https://rokadoctor.in/contact
```

**Kyun:** Patna mein customer form nahi bharta — **call karta hai**. Number seedha sitelink mein.

---

# ⚠️ Ek cheez jo tu poochne wala tha

## "Testimonials" wala sitelink kyun nahi banaya?

Kyunki **teri site pe testimonials/reviews ka page hai hi nahi.** Google ne guess kar liya tha, par wo 404 hai.

**Do raaste:**

**A. Abhi ke liye chhod do** — tere 44 Google review already ad ke saath **star rating** ki tarah dikhenge (agar GBP link ho). Alag page ki zaroorat nahi.

**B. Baad mein banwa lo** — bol dena, main `/reviews` page bana dunga jisme asli Google review dikhenge. Tab ye sitelink add kar lena.

## "Directions" wala kyun nahi?

Tera business **Service Area Business** hai — tu customer ke ghar jaata hai. "Directions" tab kaam ka hota hai jab log tere paas aate hon.

Agar dukaan pe log aate hain to ye add kar sakta hai:
```
Text (14):  Visit Our Shop
Line 1 (30): Buddha Colony, Patna — 800001.
Line 2 (23): Open 8 AM – 9 PM daily.
URL: https://rokadoctor.in/contact
```
(Contact page pe Google Maps link already laga diya hai maine)

---

# 🏆 Competitor kya kar rahe hain — asli data

Maine Patna market check kiya:

| Competitor | Visit charge | Reviews |
|---|---|---|
| **Aqua Perl (tu)** | **₹200** | **44** |
| R K Enterprises | ₹200 | 21 |
| Pal Water Solutions | ₹150–250 | 13 |
| SOMISTHA AQUA | ₹249 | — |
| Mr Service Expert | ₹399 | 7,931 |
| RO Care India | ₹399 | — |

## Isse kya seekha

**1. Bade competitor (Mr Service Expert, RO Care India) Patna ke hain hi nahi.**
Unka office Gurgaon/Delhi mein hai. Wo ₹399 lete hain aur **local nahi hain**. Tera fayda: *"Patna ka local, ₹200 mein"*.

**2. ₹200 pe tu akela nahi hai** — R K bhi ₹200 leta hai.
Isliye sirf rate mat bechna. Ye bech:
- **90-minute response** (koi nahi bolta)
- **30-day warranty** (koi nahi deta)
- **TDS test included** (Patna ka paani 600+ TDS hai — logon ko fikar hai)

**3. Emergency/urgency wale shabd sabse achha chalte hain** local service ads mein:
`Same-day` · `90-min response` · `Call now` · `Today` — ye use karna.

---

# 💰 Budget aur setup — mera saaf suggestion

## Ad chalane se pehle 2 cheez zaroori

| Kaam | Status |
|---|---|
| **GA4 tracking** | ⏳ code taiyaar hai, **push karna baaki** |
| **Conversion tracking** | ❌ abhi nahi hai |

**Bina conversion tracking ke ad mat chalana.** Warna pata hi nahi chalega ki ₹5,000 se kitne call aaye.

GA4 push ho jaaye to bol dena — main **call/WhatsApp click ko Google Ads conversion** se jod dunga. Phir Google khud unhi logon ko dikhayega jo call karte hain.

## Budget

| Phase | Budget | Kya |
|---|---|---|
| Test (2 hafte) | ₹300/din | Sirf "ro repair patna" type keyword |
| Scale | ₹500-800/din | Jo keyword call la raha ho |

India mein local service ka CPC **₹10-60** hai. ₹300/din = roz 5-15 click.

## Keywords — inse shuru kar

```
ro repair patna
ro service near me
water purifier repair patna
ro service kankarbagh
kent ro service patna
aquaguard service patna
ro filter change patna
ro installation patna
```

**Negative keywords** (paisa bachaane ke liye) — ye zaroor daal:
```
-free       -job        -vacancy    -salary
-training   -course     -wholesale  -dealership
-franchise  -second hand
```

---

# 📋 Aaj ka checklist

## Google Ads mein

- [ ] **4 purane sitelink DELETE karo** (sab 404 hain)
- [ ] *"I found some sitelinks for you"* — **accept mat karna**
- [ ] Upar wale **8 naye** add karo (copy-paste ready hain)
- [ ] Har URL add karne ke baad **khud click karke check karo** ki page khulta hai

## Ad chalane se pehle

- [ ] GA4 wala code push karo (zip mein hai)
- [ ] Mujhe bata — main conversion tracking jod dunga
- [ ] Negative keywords daalo
- [ ] Location: **sirf Patna** (poora India mat karna — paisa barbaad)
- [ ] Schedule: **8 AM – 9 PM** (jab tu call utha sake)

---

# 🔴 Sabse zaroori baat

**Ad chalane se pehle GBP theek karlo.**

Reason: log ad dekhenge → tera naam Google karenge → GBP dekhenge. Agar wahan:
- naam mein "Best Ro Service in Patna" hai (suspension risk)
- purani photo hai
- review ka jawab nahi diya

...to wo **competitor ke paas chale jaayenge** — aur tu uske click ka paisa de chuka hoga.

**Order ye hona chahiye:**
1. GBP theek karo (naam, photo, review jawab)
2. GA4 push karo
3. Conversion tracking jodo
4. **Phir** ad chalao

---

# Ek baat aur

Sitelink dalne ke baad **7 din ruk ke dekhna** kaunsa sabse zyada click la raha hai. Google Ads mein **Assets → Sitelinks → Clicks** column dikhta hai.

Jo 0 click la raha ho, usko badal dena. Jo chal raha ho, uske jaisa aur banana.
