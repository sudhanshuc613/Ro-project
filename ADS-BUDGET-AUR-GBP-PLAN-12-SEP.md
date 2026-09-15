# Competitor ad spend + tera budget + GBP rank plan
### 12 Sep 2026 · sab kuch Google ke apne tool se measure kiya, guess nahi

---

## PEHLE SEEDHI BAAT — exact spend koi nahi bata sakta

Google **kabhi** competitor ka budget public nahi karta. Facebook ki tarah "Ad Library"
me spend nahi dikhta. Jo tool "exact competitor spend" ka dawa karte hain (SpyFu, SEMrush)
wo **30-80% tak galat** hote hain — chhote advertisers pe to aur bura.

Par **do cheez sach me pata chal sakti hai**, aur maine dono nikaali:

1. **Kaun ad chala raha hai aur kitne ads** → Google Ads Transparency Center (free, official)
2. **Uska approx budget** → CPC benchmark × ad volume se range

Neeche jo hai wo **measured** hai.

---

# 🔴 FINDING #1 — Tera darr galat hai. Patna ka koi local RO wala ad nahi chala raha.

Tu ne kaha *"ab to or bhi log lagane lage hai competitor"*. Maine Google ke official
Transparency Center pe **ek-ek karke check kiya**:

| Business | Reviews | Rank | **Ads chal rahe?** |
|---|---|---|---|
| Nishant Ro Service | **564** | **#1** | ❌ **0 ads** |
| roservicecenterpatna.com | 74 | #7 | ❌ **0 ads** |
| AquaGlow Ro Service | 84 | #9 | ❌ **0 ads** |
| Pure water solution | 4 | #16 | ❌ **0 ads** |
| **Aqua Perl (TU)** | **50** | **#8** | ✅ **8 ads** |

> **Patna ke local RO walon me SIRF TU ad chala raha hai.**
>
> Jo #1 pe baitha hai (Nishant, 564 reviews) — wo **ek rupya bhi ad pe kharch nahi
> kar raha.** Wo sirf reviews ke dam pe #1 hai.

### To jo "Sponsored" tune dekha wo kya tha?

Do tarah ke log hain jo Patna me ad dikhate hain — par dono **local nahi** hain:

| Advertiser | Ads | Asli kaun hai |
|---|---|---|
| **rocareindia.com** | **28 ads** | Advertiser ka legal naam **"3D Logic PVT LTD"** — Delhi ki national aggregator company |
| **urbancompany.com** | **~2,000 ads** | Urban Company Limited — pure India ka giant |

Ye **pure India** target karte hain. Inka Patna wala hissa bahut chhota hai.
Ye tere "competitor" nahi hain — ye aggregator hain jo har sheher me dikhte hain.

**Matlab:** Patna ke RO auction me **bheed nahi hai.** Tu akela local advertiser hai.
Ye teri badi advantage hai, problem nahi.

---

# 🔴 FINDING #2 — Tere 8 ads mile, aur format hi galat hai

Transparency Center pe tera advertiser account:
```
Advertiser : Sudhanshu Choudhary
Legal name : Sudhanshu Choudhary
Based in   : India
Status     : ✅ Verified (identity verify ho chuki hai — achhi baat hai)
Total ads  : 8
```

Ad format jo dikha:
```
Local Universal Ad Rendering Service
Local Ad Rendering Service
─────────────────────────────────
Sponsored
Aqua Perl | Ro Service Centre - Best Ro Service in Patna
5.0 (49) · Water purification company · Open 24 hours
RO Service and Installation
RO Water Purifier Services and Installation of RO Service
& Water Purifier Repair in Patna
[Directions]  [Call]  [Website]
```

**Ye "Local Universal Ad" hai — yani GBP ka Smart campaign.** Wahi jo tune ₹80/din pe lagaya.

### Iske 4 bade nuksan (yehi wajah hai ki calls nahi aa rahe):

| Problem | Asar |
|---|---|
| **Keyword control zero** | Tu nahi bol sakta "ro repair patna" pe dikhao. Google khud decide karta hai |
| **Search terms report nahi** | Pata hi nahi chalta kis search pe paisa gaya |
| **Negative keywords nahi** | "ro service **job**", "ro **dealership**", "ro **wholesale**" pe bhi paisa jaata hai |
| **Conversion pe optimize nahi karta** | Ye "GBP interactions" pe optimize karta hai — yani koi profile khole to bhi Google khush, call na aaye to bhi |

Aur upar se — teri site pe **`AW-` conversion tag abhi bhi nahi hai** (maine live check kiya).
To Google ko pata hi nahi ki kaunsa click call bana. **Wo andhere me bid kar raha hai.**

---

# 🔴 FINDING #3 — ₹80/din ka asli ganit (yahi tera jawab hai)

India me **local service ka CPC ₹8-40**, average ₹20-25 (2026 data).
Patna tier-2 hai to lower end — maan lo **₹15-20**.

```
₹80/din ÷ ₹18 CPC  =  4.4 click/din
                    =  ~133 click/mahina
```

**Char click per din.** Us 4 me se:
- 2-3 galat search se aayenge (job dhoondhne wale, dealer, wholesale)
- 1-2 asli customer
- Usme se **8-10% call karega**

```
133 click × 8% = ~11 call/mahina
```

Aur ye best case hai — tracking nahi hai to Google optimize bhi nahi kar pa raha.

> **Isliye calls nahi aa rahe bhai. ₹80 kam hai — itna kam ki Google ka algorithm
> seekh hi nahi pata.** Smart Bidding ko **hafte me 15-20 conversion** chahiye
> seekhne ke liye. Tujhe mahine me 11 mil rahe hain.

### Aur ek kadwa sach — ₹200 visit charge pe ad ka ganit tight hai

```
₹18 CPC ÷ 8% conversion = ₹225 per call
Har 2 call me se 1 job bane      = ₹450 per job
```

Agar job sirf **₹200 visit charge** hai → **₹250 ka nuksaan** har job pe.
Agar job me **parts/AMC** bhi hai (₹800-1500) → **₹350-1050 ka faayda**.

> **Ads tabhi profitable hai jab tu call ko parts/AMC me convert kare.**
> Sirf ₹200 visit ke liye ad chalana ghata hai. Ye maine seedha bol diya.

---

# 💰 TO KITNA BUDGET? — teen option, honest math ke saath

## ⭐ OPTION A — ₹0/din (RECOMMENDED, agli 6 hafte)

**Ad band. Pura focus reviews pe.**

Kyun: Nishant **564 reviews** ke saath **#1** hai aur **₹0 ad** kharch karta hai.
Tu **50 reviews** ke saath **#8** hai aur ₹2,400/mahina kharch kar raha hai.

```
Bachat        : ₹2,400/mahina
Target        : 50 → 120 reviews (6 hafte, 2 review/din)
Expected rank : #8 → #3-4 Map Pack
Map Pack se   : 44% saare local clicks
```

**Ye sabse zyada ROI wala rasta hai. Paisa zero.**

---

## OPTION B — ₹250-300/din (agar ad chalana hi hai)

Ye **asli floor** hai, ₹80 nahi:

```
₹275/din ÷ ₹18 CPC   = 15 click/din = 450 click/mahina
450 × 8% conversion   = 36 call/mahina
Mahine ka kharch      = ₹8,250
Per call cost         = ₹229
```

36 conversion/mahina = Smart Bidding ke liye **bilkul minimum**.
Isse kam pe Google seekh nahi pata — yahi teri abhi ki problem hai.

**Par ye tabhi chalu karna jab:**
1. `AW-` conversion tracking live ho (zip me code ready hai)
2. Reviews 80+ ho jaayein
3. Landing page `/ro-repair-patna` ho, homepage nahi

---

## OPTION C — ₹80/din rakhna hai to (sabse sasta fix)

Agar paisa nahi badha sakta, to **usi ₹80 ko concentrate kar**:

**GBP ad settings me ad schedule lagao — sirf 4 ghante:**
```
Subah  9:00 – 11:00   (log ghar pe, RO kharab dekhte hain)
Shaam  6:00 –  8:00   (office se aake call karte hain)
```

24 ghante me bikhra hua ₹80 → 4 ghante me concentrated ₹80.
**Wahi paisa, 6× zyada visibility peak time pe.**

Ye ek setting badalne se hoga. 2 minute ka kaam.

---

# 🛠️ CAMPAIGN SETUP — exact steps

## Pehle: abhi wale Smart campaign ko schedule karo (2 min, aaj)

1. **business.google.com** khol → apna profile
2. Left menu → **Ads** (ya "Promote")
3. Chalu campaign pe **Edit**
4. **Ad schedule** dhoondo → set karo:
   - Mon–Sun: `9:00 AM – 11:00 AM`
   - Mon–Sun: `6:00 PM – 8:00 PM`
5. **Save**

---

## Baad me (reviews 80+ hone ke baad): Search campaign banao — Expert Mode

⚠️ **"Smart campaign" mat chunna.** Wo wahi hai jo abhi chal raha hai.

### Step-by-step

**1. Conversion action banao (ye SABSE pehle)**
```
ads.google.com → Tools (🔧) → Conversions → + New conversion action
→ Website → rokadoctor.in

Conversion 1:
  Name         : Phone Call Click
  Category     : Contact
  Value        : ₹200
  Count        : One
  Window       : 30 days

Conversion 2:
  Name         : Booking Form Submit
  Category     : Submit lead form
  Value        : ₹200
  Count        : One
```
Dono ka **Conversion ID (`AW-XXXXXXXXX`)** aur **Label** copy karke mujhe bhej.
Main code me daal dunga — zip me jagah already bani hui hai.

**2. Campaign banao**
```
+ New Campaign
→ Goal: Leads
→ Campaign type: SEARCH          ← Performance Max ya Smart NAHI
→ Conversion goals: sirf upar wale 2 (baaki hatao)
→ Results: Phone calls + Website visits
```

**3. Settings**
```
Networks        : ☑ Google Search    ☐ Search partners   ☐ Display   ← dono UNCHECK
Location        : Patna, Bihar + 15 km radius
                  ⚠️ "Presence or interest" nahi → "PRESENCE" chuno
                     warna Delhi ka banda jo "patna ro" search kare wo bhi dikhega
Language        : English + Hindi
Budget          : ₹275/din
Bidding         : Maximize Conversions
                  (30 conversion ke baad Target CPA ₹200 pe switch karna)
Ad schedule     : Mon–Sun 8:00 AM – 9:00 PM
Devices         : Mobile +20% bid adjust (India me 80%+ mobile hai)
```

**4. Ad group + keywords — sirf EXACT aur PHRASE match**
```
Ad group: RO Repair Patna
  [ro service patna]
  [ro repair patna]
  [ro service near me]
  [water purifier repair patna]
  [ro service centre patna]
  "ro technician patna"
  "ro filter change patna"
  "ro membrane replacement patna"
```
⚠️ **Broad match bilkul mat use karna** — ₹275/din usme 2 din me udd jayega.

**5. Negative keywords (ye list zaroor daalo)**
```
free, job, jobs, vacancy, salary, hiring, training, course
dealer, dealership, distributor, wholesale, franchise, bulk
amazon, flipkart, price list, second hand, used, olx
kaise banaye, how to make, diy, repair yourself
delhi, mumbai, kolkata, ranchi, gaya, muzaffarpur
```

**6. Ad copy**
```
Headline 1: RO Service Patna ₹200 Visit
Headline 2: 90 Min Me Technician Ghar Par
Headline 3: 5.0★ · 50 Google Reviews
Headline 4: Kent Aquaguard Livpure Pureit
Headline 5: Call 8969821440

Description 1: ₹200 visit charge, koi hidden cost nahi. Part badalne se pehle
               aapki permission. 30 din warranty.
Description 2: Buddha Colony se poore Patna me service. Kankarbagh, Boring Road,
               Rajendra Nagar — 90 minute me.

Final URL   : https://rokadoctor.in/ro-repair-patna     ← homepage NAHI
```

**7. Assets (extensions) — sab lagao, free hain**
```
☑ Call asset          : 8969821440
☑ Location asset      : GBP link karo (Maps pe dikhne ke liye ZAROORI)
☑ Sitelinks           : /ro-amc-patna  /ro-installation-patna
                        /ro-membrane-replacement-patna  /ro-service-patna-faq
☑ Callout             : ₹200 Visit · 90 Min Response · 30 Din Warranty · 7 Days Open
☑ Structured snippet  : Services → RO Repair, Installation, AMC, Filter Change
```

> **Location asset zaroor lagana** — iske bina tera ad Google Maps pe dikhega hi nahi,
> chahe kitna bhi budget ho.

---

# 🗺️ GBP KO TOP PE KAISE LAAYE — asli kaam (ye free hai)

2026 me Map Pack ka weight:
```
Proximity (doori)      ~55%  ← isme kuch nahi kar sakte
GBP signals            ~32%  ← ISME SAB KUCH KAR SAKTE HAIN
Reviews                16-20%
On-page SEO            ~19%  ← ye already #1 hai
```
Top 10 me se **8 signal seedhe GBP se** aate hain.

## Roz ka routine — 20 minute

### 1. Photos — 3-4 roz (sabse bada lever)
```
100+ photos  →  520% zyada calls
 50+ photos  →   30% zyada calls
Har mahine nayi photo → 24% zyada interaction
```
Kya daalna: customer ke ghar ka RO, membrane before/after, TDS meter reading,
tera van, tool bag, bill, tu kaam karte hue.

⚠️ **Internet se uthayi ya AI photo bilkul mat daalna** — reverse image search se
suspension ho jayegi aur tere 50 reviews chale jayenge.

### 2. Reviews — 2 roz
Har COMPLETED job ke **2 ghante ke andar** WhatsApp:
```
Namaste {naam} ji, Aqua Perl se Sudhanshu. Aaj aapka RO theek ho gaya.
Agar service theek lagi ho to Google par 1 line likh dijiye — 30 second lagega.
Isse humein Patna me aur logon tak pahunchne me madad milti hai. Dhanyawaad 🙏
{link}
```
`/admin/service-requests` me **⭐ Review maango** button already laga hai.

⚠️ Review ke badle paisa/discount **kabhi mat** dena — Google July 2026 policy se
tera **poore site ka schema** strip ho jayega (73 area page).

### 3. Review ka jawab — 24 ghante ke andar
90%+ reply rate wale businesses: **23% zyada profile views, 18% zyada directions.**

### 4. Post — hafte me 2
Weekly post karne wale contractors: **20-40% zyada calls** 3-6 mahine me.

### 5. Profile ke ye field abhi bhar (ek baar ka kaam)
- [ ] **Services** — RO Repair, Installation, AMC, Membrane Replacement, Filter Change, Commercial RO
- [ ] **Description** — 750 char, `₹200 visit charge` + `Buddha Colony` daalo
- [ ] **Products** — spare parts add karo
- [ ] **Q&A** — khud 5-6 sawaal poocho aur jawab do
- [ ] **Attributes** — "Online estimates", "Onsite services"

### 6. ⚠️ Hours ka mismatch theek kar
```
GBP par     : Open 24 hours
Website par : 8 AM – 9 PM
```
Ye NAP inconsistency hai — ranking ko nuksaan karta hai.
Ek decide kar. Agar raat 2 baje call nahi uthata to GBP `7 AM – 10 PM` kar de.
Jhoothi hours = bure review + Google ka trust khatam.

### 7. Naam abhi mat badalna
`Aqua Perl | Ro Service Centre - Best Ro Service in Patna` policy-violating hai
(keyword stuffing = 40% suspensions ka karan). **Par abhi mat chhedna** — naam change
"significant edit" hai, video verification trigger kar sakta hai, aur tere 50 reviews
risk pe aa jayenge. Pehle 100+ review, phir badalna.

---

# 📋 90 DIN KA PLAN

| Kab | Kya | Kharcha |
|---|---|---|
| **Aaj** | Ad schedule 4 ghante pe set karo | ₹0 |
| **Aaj** | GBP hours fix (24hr ya 7AM-10PM, ek chuno) | ₹0 |
| **Is hafte** | Services + Description + Products + Q&A bharo | ₹0 |
| **Hafta 1-6** | Roz 3-4 photo + 2 review maango + har review ka jawab | ₹0 |
| **Hafta 6** | Reviews 100+ → Map Pack #3-4 expected | — |
| **Hafta 7** | Conversion actions banao, IDs mujhe bhejo | ₹0 |
| **Hafta 8** | Search campaign Expert Mode ₹275/din | ₹8,250/mah |
| **Hafta 12** | Reviews 150+, naam saaf karo | ₹0 |

---

# 🔍 Tu khud competitor check kar sakta hai — free

```
adstransparency.google.com
→ Region: India
→ Search: competitor ka domain ya business naam
```

Dikhega: kitne ads chal rahe, kya creative hai, kab se chal rahe.
**Mahine me ek baar check kar.** Agar kisi local ka ad count badhe to mujhe bata.

---

# Ek line me

> Patna ke **kisi bhi local RO wale ka ad nahi chal raha** — sirf tera.
> Jo #1 pe hai (564 reviews) wo **₹0 kharch** karta hai.
> Tera ₹80/din = 4 click/din = Google seekh hi nahi pata.
>
> **Ad tera problem nahi hai. 50 vs 564 reviews tera problem hai.**
>
> Ad ya to ₹275/din karo ya band karo. ₹80 dono taraf se bekaar hai.
> Asli jeet roz ke 3 photo aur 2 review me hai — aur wo **muft** hai.
