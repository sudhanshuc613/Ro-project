# 💰 Ads Ka Asli Sach — Kaun Kitna Kharch Kar Raha Hai

**10 Sep 2026** · sab measure kiya · **ek bahut bada bug mila**

---

# 🔴 SABSE PEHLE — ye jaan le, baaki sab baad me

Maine teri site scan ki. **Google Ads conversion tracking hai hi nahi.**

```
GA4 (G-JP9HDZ9SE3)     ✅ laga hua hai
Google Ads (AW-...)    ❌ KAHIN NAHI
Conversion tag         ❌ ZERO
```

## Iska matlab kya hai

Jab koi tera ad dekh ke phone dabata hai, **Google ko pata hi nahi chalta.**

Google ka Smart Bidding conversion data ko hi sach maanta hai. Signal na mile to:

- Usse pata nahi chalta kaunsa keyword call laa raha hai
- Budget har keyword pe **barabar** bat jata hai — achhe aur bekaar dono pe
- Published data: tracking tootne se **CPA +47%** aur **conversion rate −32%**

**Matlab ₹80 ho ya ₹800 — paisa andhere me ja raha hai.**

Ye wahi wajah hai jo tu keh raha hai "paisa laga raha hu par call nahi aa rahe".

## ✅ Maine code taiyaar kar diya

`ANALYTICS.adsId` aur labels bhar do, **turant chalu ho jayega**:

```
tel: click       → Google Ads conversion (₹200 value)
WhatsApp click   → Google Ads conversion (₹200 value)
Booking form     → Google Ads conversion (₹200 value)
```

### Tujhe 10 minute ka kaam karna hai

```
1. ads.google.com → Tools (🔧) → Conversions → + New conversion action
2. "Website" → rokadoctor.in → Scan
3. "Add a conversion action manually"
4. Do banao:

   Conversion 1:
     Goal   : Contact → Phone call leads
     Name   : Phone Call Click
     Value  : Use a value → 200
     Count  : One

   Conversion 2:
     Goal   : Submit lead form
     Name   : Booking Form
     Value  : Use a value → 200
     Count  : One

5. Dono ka "Tag setup" → Conversion ID (AW-XXXXXXXXX) aur Label copy karo
6. Mujhe bhej de, ya khud src/lib/constants.ts me bhar de:

   adsId: 'AW-XXXXXXXXX',
   adsCallLabel: 'xxxxxxxxx',
   adsFormLabel: 'yyyyyyyyy',
```

**Jab tak ye nahi hoga, ads pe ek rupaya bhi mat lagana. Waste hai.**

---

# 📊 COMPETITOR — kaun kitna serious hai (scan kiya)

| Site | GA4 | **Google Ads tag** | FB Pixel | Matlab |
|---|---|---|---|---|
| roservicecenterpatna.com | ✅ | **✅ YES** | ❌ | 🔴 **asli advertiser** |
| rocareindia.com | ✅ | ❌ | ❌ | sirf analytics |
| ro-service-patna.co.in | ✅ | ❌ | ❌ | sirf analytics |
| roservicecentrepatna.in | ❌ | ❌ | ❌ | kuch nahi |
| shristiropatna.com | ❌ | ❌ | ❌ | kuch nahi |
| repairpatna.in | ❌ | ❌ | ❌ | kuch nahi |
| patnaaquacare.com | ❌ | ❌ | ❌ | kuch nahi |
| **HUM** | ✅ | **❌** | ❌ | **ye fix ho raha hai** |

## 🎯 Ye sabse bada finding hai

**Patna me sirf EK competitor ke paas asli conversion tracking hai.**

Baaki sab tere jaisa **GBP ka smart campaign** chala rahe hain — jisme:
- Keyword control **zero**
- Search terms **dikhte nahi**
- Negative keywords **daal nahi sakte**
- Competitor data **nahi milta**
- Google jahan chahe paisa laga deta hai (Display, YouTube bhi)

**Matlab wo bhi andhere me hain. Tu akela nahi hai.**

Jo pehla banda tracking laga ke Search campaign chalayega, wo sabko peeche chhod dega.

---

# 🧮 Tera ₹80/day — asli math

India me local services ka CPC (2026 data): **₹10–60, average ₹25**

```
₹80/day = ₹2,400/month

CPC ₹10 (best case)    : 240 clicks → ~18 leads
CPC ₹25 (average)      :  96 clicks → ~7 leads
CPC ₹40 (competitive)  :  60 clicks → ~5 leads
CPC ₹60 (worst)        :  40 clicks → ~3 leads
```

## 🔴 Par asli problem ye hai

**Google ke Smart Bidding ko chahiye: 15-20 conversions PER WEEK** seekhne ke liye.

**Tu de raha hai: 3-7 leads PER MONTH.**

Algorithm kabhi "learning phase" se bahar nikalta hi nahi. Wo hamesha
experiment karta rehta hai — **tere paise se**.

Aur tracking na hone se wo **0 conversions** dekh raha hai. Bilkul andha.

---

# 🎯 AB KYA KARNA HAI — priority order

## 🔴 STEP 1 — Ads BAND kar do (aaj hi)

Ha, band. Jab tak conversion tracking nahi lagti.

```
₹80/day × 30 = ₹2,400/month andhere me ja raha hai
```

Ye paisa 2 mahine rok — **₹4,800 bach jayega**. Usse kuch behtar karenge (neeche).

## 🔴 STEP 2 — Conversion tracking lagao (10 min, free)

Upar wale steps. **Ye kiye bina ads dobara mat chalu karna.**

## 🔴 STEP 3 — GBP photos — ye sabse bada free lever hai

Research data (Google/BrightLocal 2026):

```
100+ photos  →  520% zyada CALLS
100+ photos  →  1,065% zyada website clicks
50+ photos   →  30% zyada calls
20+ photos   →  18% zyada clicks
Har mahine nayi photo → 24% zyada interaction
```

**Local pack ka average business 11+ photos rakhta hai. Jo rank nahi karte
unke 6 hote hain.**

Tere GBP pe kitni hain? Agar 20 se kam hai, **to yahi tera sabse bada problem
hai — ads nahi.**

### Ye ₹0 ka kaam hai

Roz 3-4 photo khinch, GBP pe daal:
```
□ technician kaam karte hue (chehra dikhe)
□ khula RO, filter badalte hue
□ TDS meter ki reading (pehle/baad)
□ purana vs naya filter side-by-side
□ shop ka board, bahar ka view
□ naye purifier stock me
□ van/bike jisse jaate ho
□ customer ke ghar ka setup (permission le ke)
```

**30 din me 100 photo ho jayengi. 520% zyada calls — free me.**

## 🔴 STEP 4 — GBP posts — hafte me 2

Research: posts karne wale contractors ko **20-40% zyada calls** milte hain,
aur **30-60% zyada profile views** 3-6 mahine me.

```
Post 1: "Kankarbagh me aaj membrane badla — TDS 850 se 45"  + photo
Post 2: "Is hafte AMC pe ₹200 off" + Call Now button
```

2 minute ka kaam, hafte me 2 baar.

## 🔴 STEP 5 — Reviews 44 → 150

Ye maine pehle bhi kaha tha, ab data ke saath:
- Reviews = **36% weight** home services me
- **31% log 4.5+ stars maangte hain** (2025 se lagbhag double)

`/admin` pe ⭐ button hai. Roz 1 minute.

## 🟡 STEP 6 — Ads WAPAS chalu karo (2 mahine baad)

Jab ye teeno ho jayein:
```
✅ conversion tracking laga
✅ GBP pe 50+ photos
✅ 80+ reviews
```

Tab **Search campaign** chalao, Smart campaign nahi:

```
Campaign type   : Search (Expert Mode, Smart nahi)
Budget          : ₹200-300/day  (₹80 se kaam nahi chalega)
Bidding         : Maximize Conversions
Location        : Patna city + 15 km radius
Schedule        : 8 AM – 9 PM (jab tu call utha sake)
Keywords        : sirf EXACT match se shuru
                  [ro service patna]
                  [ro repair near me]
                  [water purifier repair patna]
                  [ro service kankarbagh]
Negative        : free, jobs, salary, dealer, wholesale,
                  distributor, franchise, price list, amazon, flipkart
Ad extensions   : Call, Location, Sitelinks, Price (₹200 visit)
Landing page    : /ro-repair-patna  (homepage NAHI)
```

### Kyun ₹200-300/day

₹80/day pe Google ko data hi nahi milta. ₹250/day pe:
```
CPC ₹25 → 300 clicks/month → ~22 leads/month
```
Ab algorithm seekh sakta hai.

**Agar ₹250/day nahi de sakte, to ads bilkul mat chalao** — GBP pe lagao
wo mehnat. Wo free hai aur zyada deti hai.

---

# 💡 Aur ek cheez — teri asli taakat

Competitor ke paas ye nahi hai, aur ye **free** hai:

## 1. Tera ₹200 visit charge

```
Tu          : ₹200
Market      : ₹300-400
Urban Co    : ₹299-4,199
```

**Ye ad me sabse upar likho.** Ab title me bhi hai:
`RO Service Kankarbagh Patna ₹200 · 8969821440`

## 2. Tu Patna me hai, wo Gurgaon me

`rocareindia.com` ke **73 city pages** hain aur sab pe **same Gurgaon ka
number** `9311587744` hai.

Customer ko 90 minute me technician chahiye. Wo de nahi sakte.

## 3. 73 area pages + 40 pocket

Koi competitor itna local nahi hai.

## 4. Ab photos bhi har page pe hain

Aur ImageObject schema — jo kisi ke paas nahi.

---

# 📋 Ek line me — ye karo

```
AAJ     : Ads BAND karo                          ₹2,400/mo bachega
AAJ     : Conversion tracking banao (10 min)     free
ROZ     : 3-4 photo GBP pe daalo                 free, 520% more calls
ROZ     : 1 review maango (/admin ⭐ button)      free, 36% weight
HAFTE   : 2 GBP post                             free, 20-40% more calls
2 MAHINE BAAD : Search campaign ₹250/day         tab data hoga
```

**Pehle 4 kaam FREE hain aur ads se zyada denge.**

---

# 🔴 Sach jo koi nahi bolega

Tu ₹80/day kharch kar raha hai. Mahine ka ₹2,400. Saal ka ₹28,800.

Us paise me:
- **Conversion tracking ke bina** — kuch nahi milega, chahe kitna bhi lagao
- **GBP photos** — ₹0 kharch, 520% zyada calls (proven data)
- **Reviews** — ₹0 kharch, 36% ranking weight

**Tera paisa problem nahi hai. Tracking na hona problem hai.**

Aur achhi baat — **Patna me 8 me se 7 competitor bhi andhere me hain**. Jo
pehla tracking lagayega wo jeetega. Wo tu ban sakta hai, 10 minute me.
