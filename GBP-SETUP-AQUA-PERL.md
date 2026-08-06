# Aqua Perl — naam badal diya + GBP ka poora setup

**6 Aug 2026 · 37/37 test PASS · build EXIT=0**

---

# ✅ Website mein jo badla

| Cheez | Pehle | Ab |
|---|---|---|
| Brand naam | AquaNexa | **Aqua Perl** |
| Legal naam | AquaNexa Water Solutions | **Aqua Perl RO Service Centre** |
| Street | Kankarbagh Main Road | **Sai Gali, Opposite B-62** |
| Locality | Kankarbagh | **Buddha Colony** |
| Pincode | 800020 | **800001** |
| Review count (schema) | **312 (jhooth)** | **44 (asli)** |
| Social links | 3 dead links | hata diye |

**32 files badli. Homepage pe "Aqua Perl" 33 baar, "AquaNexa" 0 baar.**

---

# 🔴 Do cheez pakdi jo Google penalty deti

## 1. Fake review count — schema mein 312 likha tha

Tere website ke code mein ye tha:

```json
"aggregateRating": { "ratingValue": "4.8", "reviewCount": "312" }
```

**Tere paas 44 hain. Website Google ko 312 bata rahi thi.**

Ye **"Spammy structured markup"** hai. Google iska manual action deta hai — saare rich results (star rating wagairah) band ho jaate hain, aur wapas laane mein mahine lagte hain.

**Ab asli 44 hai.** Ek jagah se control hota hai:

```
src/lib/constants.ts  →  GBP.reviewCount
```

> **Jab GBP pe review badhein, sirf yahi number badalna.** Har 10-15 review pe update kar dena.

## 2. Teen fake social links

```
facebook.com/aquanexa    ← exist nahi karta
instagram.com/aquanexa   ← exist nahi karta
youtube.com/@aquanexa    ← exist nahi karta
```

Google in links ko follow karta hai. 404 milta hai to bharosa girta hai. **Hata diye.**

Page bana le to `src/lib/constants.ts` → `SOCIAL` array mein daal dena.

---

# 🎯 GBP mein ab kya karna — tere jawab ke hisaab se

## 1️⃣ Naam — "Best Ro Service in Patna" hata

```
ABHI:  Aqua Perl | Ro Service Centre - Best Ro Service in Patna
KARO:  Aqua Perl RO Service Centre
```

Ab website ka legal naam bhi **bilkul yahi** hai — match ho jaayega.

> **Ranking thodi girega — sach bol raha hoon.** Par 44 review already hain, wo sambhal lenge. Aur suspension ka khatra khatam.

⚠️ **Naam badalte waqt:** sirf naam badalna, ek saath address/category mat chhedna. Warna Google "significant edit" samajh ke review mein daal dega.

---

## 2️⃣ Category — tu RO bechta bhi hai, service bhi karta hai

Tune bola dono karta hai. **Ek hi listing rakhni hai, do nahi** (do banayi to duplicate = suspension).

**Primary category:**
```
Water Purifier Supplier
```

**Kyun ye primary:** ye dono cover karta hai — bechna aur service. Aur ye single sabse bada ranking factor hai.

**Secondary categories (sab add kar):**
```
Water Filter Supplier
Water Treatment Supplier
Water Softening Equipment Supplier
Repair Service
Water Cooler Supplier
```

> Sirf wahi add karna jo sach mein karta hai. Faltu category = suspension.

---

## 3️⃣ Address — 🔴 ye sabse important faisla

Tere paas **asli address hai**: `Sai Gali, Opp B-62, Buddha Colony, Patna 800001`

**Ab sawaal ye hai:**

### Kya customer wahan aa sakta hai?

### ✅ Tune bataya: customer wahan nahi aata

Matlab tu **Service Area Business (SAB)** hai.

**GBP mein:**
1. Edit profile → Location
2. **"Remove business address"** / address hata do
3. Sirf **Service area** rakho (16 area neeche hain)

**Website bhi isi hisaab se badal di:**
- Street address ab kahin nahi dikhta (footer, contact page, schema — sab se hata)
- Sirf "Buddha Colony, Patna, Bihar 800001" dikhta hai
- Contact page pe likha hai: *"Hum aapke ghar aate hain — poore Patna mein doorstep service"*

**Kyun ye zaroori tha:** agar GBP pe address chhupa ho aur website pe poora pata likha ho, Google ise **mismatch** maanta hai aur local ranking girti hai.

> Aage kabhi dukaan khol ke customer bulaane lage, to **dono jagah ek saath** badalna:
> GBP pe address dikhao **aur** `src/lib/constants.ts` mein `showStreetAddress: true` kar do.

---

## 4️⃣ Service areas — 16 daal (poora Patna)

Tune bola poore Patna mein karta hai. **Ye 16 daal — bilkul yahi jo website pe hain:**

```
Kankarbagh          Boring Road         Patliputra Colony
Rajendra Nagar      Danapur             Bailey Road
Kadamkuan           Ashiana Nagar       Rajiv Nagar
Gola Road           Gandhi Maidan       Phulwari Sharif
Khagaul             Digha               Patna City
Kumhrar
```

**Sirf "Patna" mat likhna** — ek-ek area alag daal. Google har area ke search ke liye tab hi dikhayega.

> 20 tak daal sakta hai. 16 kaafi hain kyunki website pe inhi 16 ka page bana hua hai. **Match hona zaroori hai.**

---

## 5️⃣ Services section — rate ke saath daal

GBP mein "Services" bhaag hai. Zyadatar log khaali chhod dete hain. **Ye 8 daal:**

| Service | Rate |
|---|---|
| RO Repair | ₹350 se |
| Filter Change | ₹350 se |
| RO Membrane Replacement | — |
| New RO Installation | — |
| RO Uninstallation | — |
| AMC Plan | — |
| TDS Water Testing | — |
| Commercial RO Plant Service | — |

**Aur ye do — kyunki tu bechta bhi hai:**
- New RO Purifier Sale
- RO Spare Parts

---

## 6️⃣ Description (750 character) — copy kar

```
Aqua Perl Patna mein RO water purifier repair, service, installation
aur naye purifier ki sale karti hai. Visit charge sirf ₹200 — usi mein
poora inspection, TDS test aur diagnosis. Kent, Aquaguard, Livpure,
Pureit, AO Smith, Aquafresh samet sabhi brand. Buddha Colony se poore
Patna mein same-day visit — Kankarbagh, Boring Road, Rajendra Nagar,
Patliputra, Danapur, Bailey Road, Ashiana Nagar aur baaki sab.
Filter aur membrane par 30 din warranty. Commercial RO plant bhi
lagate aur service karte hain. Call 8969821440.
```

---

# 📸 Photo — ye sabse zaroori pending kaam

Website pe abhi bhi **AI se banayi photo** hai (`public/service/`). Google reverse-image se pakadta hai. **GBP suspend ho sakta hai — aur tere 44 review chale jaayenge.**

**Aaj hi phone se khinch:**
- Technician kaam karte hue (chehra dikhe) — 5-6
- Khula hua RO, filter badalte hue — 4-5
- TDS meter ka reading — 2
- Purana vs naya filter side-by-side — 2
- Dukaan ka board / bahar ka view — 3 ← **address dikhana hai to ye zaroori**
- Naye purifier stock mein — 3
- Van/bike agar naam likha hai — 2

**Total 20-25.** GBP pe bhi daal, website pe bhi.

---

# 📋 Order mein karna — aaj

- [ ] **GBP naam** → `Aqua Perl RO Service Centre` (sirf naam, aur kuch nahi)
- [ ] 2-3 din ruko, naam settle ho jaaye
- [ ] **Category** → primary `Water Purifier Supplier` + 5 secondary
- [ ] **Address ka faisla** — customer aata hai? Haan = dikhao (behtar), Nahi = chhupao
- [ ] **16 service area** daalo
- [ ] **10 services** rate ke saath
- [ ] **Description** paste karo
- [ ] **20-25 asli photo**

## Website ka kaam

- [ ] Nayi zip download → files replace
- [ ] `git pull --rebase origin main` **pehle**
- [ ] `git add . && git commit -m "rename to Aqua Perl, fix NAP + real review count" && git push origin main`

## Vercel (abhi tak pending)

- [ ] `NEXTAUTH_URL` = `https://rokadoctor.in`
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://rokadoctor.in`
- [ ] Redeploy (cache tick hatao)

---

# 🎯 44 review — tu socha se aage hai

Yaad hai maine bola tha 30-40 chahiye? **Tere paas 44 already hain.**

Patna ka scene:

| Competitor | Reviews |
|---|---|
| **Aqua Perl (tu)** | **44** |
| R K Enterprises | 21 |
| Pal Water Solutions | 13 |
| Aqua Water Solution | 10 |
| Nishant RO | 433 |
| Apna RO Service | 5,117 |

**Chhote local walon se tu aage hai.** Bade do se peeche hai — par unke review purane hain.

**2026 ka rule:** naye review purane se zyada count karte hain. *200 purane review wala 80 naye review wale se peeche chala jaata hai.*

**Tera raasta:** har hafte 2-3 naye review. Teen mahine mein 80+ ho jaayenge, aur wo sab **fresh** honge.

---

# Har review ka jawab dena — abhi

44 review hain, kitno ka jawab diya hai? **Response rate bhi ranking factor hai.**

Aaj baith ke saare purane review ka jawab de. 44 review = 1 ghanta ka kaam, ek baar ka.

**Format:**
> "Dhanyawaad Rakesh ji! Kankarbagh mein aapke Kent RO ki service kar ke achha laga. Kabhi bhi zaroorat ho — 8969821440. — Aqua Perl"

Area aur brand ka naam dalna — usse SEO milta hai.

---

# ⚠️ Ek cheez yaad rakhna

Ab website, GBP, aur baaki jagah **teeno pe same likhna**:

```
Naam:  Aqua Perl RO Service Centre
Phone: 8969821440
Pata:  Sai Gali, Opp B-62, Buddha Colony, Patna 800001
```

JustDial, Sulekha, Facebook — jahan bhi listing hai, **ye teeno badal dena.** Copy-paste karna, type mat karna.
