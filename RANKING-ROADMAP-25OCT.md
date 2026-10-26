# 🔴 "Ye har keyword pe top-5 me hai, hum kyun nahi?" — poora jawab

**25 Oct 2026** · Owner ne 3 URL bheje. Maine unhe resolve kiya:

```
1 → rocareindia.com/ro-water-purifier-service-patna
2 → rosaleandservices.com/ro-service-in-patna/
3 → roservicecentrepatna.in/
```

Phir teenon ko aur apni site ko ek hi tool se naapa — `tools/why-they-rank.py`.
Ye tool andaaz nahi lagata. Ye wahi 4 cheez ginta hai jo keyword-level ranking
tay karti hain, aur dono ko aamne-saamne rakhta hai.

---

## 1. Sabse pehle: wo "trick" kya hai

🔴 **Koi trick nahi hai. Ek purana, boring, bahut asardaar mechanism hai —
aur wo hai ANDARUNI LINK + ANCHOR TEXT.**

Google ke liye aapki site ke andar ka har link ek vote hai. Aur us link ka
**text** batata hai ki vote kis cheez ke liye hai.

### Naap — Google #1 wali site (roservicecentrepatna.in)

```
kul andaruni link           : 372
homepage ko mile            : 134  (36.0%)
us link ka anchor text      : "ro service centre patna @7880004551/ro repair"  ×134
doosra sabse bada anchor    : "ro service"              ×30
teesra                      : "ro service centre"       ×24
chautha                     : "water purifier service"  ×24
paanchva                    : "ro repair"               ×22
title me "patna" AUR "ro"   : 67/67 page
```

Matlab: unki **har page** ka logo/header homepage par link karta hai, aur us
link ka text unka **poora target keyword** hai. 67 page × ~2 = 134 vote,
sab ek hi page par, sab ek hi keyword ke saath.

Isliye unka **ek hi page** (homepage) har variation par aata hai —
"ro service in patna", "ro repair near me", "ro service centre patna" — sab.

### Naap — AQUA PERL (hum)

```
kul andaruni link           : 12,837     ← unse 34 guna zyada
sabse zyada link paane wala : /contact   746  (5.8%)   🔴
us link ka anchor text      : "shipping policy"  ×145   🔴
doosra                      : /          723  (5.6%)  anchor "home" ×288  🔴
teesra                      : /ro-repair-patna  510 (4.0%)  "ro repair" ×146  ✅
```

🔴 **Hamari sabse badi link-power `/contact` par ja rahi thi, aur Google ko
bataya ja raha tha ki wo page "shipping policy" ke baare me hai.**

---

## 2. Teen asli wajah (naap ke saath)

### Wajah A — 725 link ek galat jagah, galat naam se

Footer me 5 link the, paanchon `/contact` par:

```
Shipping Policy    -> /contact
Returns & Refunds  -> /contact
Warranty Terms     -> /contact
Privacy Policy     -> /contact
Contact Us         -> /contact
```

145 page × 5 = **725 andaruni link**. Ye hamari site ka sabse bada link-cluster
tha — aur poora bekaar.

Aur ek aur baat: jo customer "Privacy Policy" dabata tha use **policy milti hi
nahi thi**, ek contact page khulta tha. Paisa lene wali site ke liye ye seedha
bharose ka nuksan hai.

**✅ AB THEEK HO GAYA** — niche "Kya kiya" me detail hai.

### Wajah B — keyword cannibalization

Ek hi keyword par hamare kitne page hain:

| keyword | **hum** | Google #1 |
|---|---:|---:|
| `ro service in patna` | **19 page** 🔴 | 5 |
| `ro service patna` | **5 page** 🔴 | 0 |
| `ro repair in patna` | 1 | 0 |

19 page ek hi keyword par matlab Google ko chunna padta hai, aur hamara signal
19 tukdon me bat jaata hai. Unka ek hi page sab kuch le jaata hai.

🔴 **Ye abhi theek NAHI kiya.** 19 title ek saath badalna bahut bada risk hai —
wo title abhi rank kar rahe hain. Iska phased plan neeche hai.

### Wajah C — jin keyword par owner ne poochha, un par title/H1 me ZERO coverage

| keyword | title/H1 me | body me |
|---|---:|---:|
| `ro repair near me` | **0** 🔴 | 25 |
| `water purifier service near me` | **0** 🔴 | 87 |
| `water purifier service patna` | **0** 🔴 | 24 |
| `ro service centre patna` | **0** 🔴 | 3 |
| `ro technician patna` | **0** 🔴 | 1 |
| `ro amc patna` | **0** 🔴 | 3 |

Body me shabd hone se rank nahi hota. **Title aur heading me hona padta hai.**

---

## 3. Jo baat sach me hairan karne wali hai

```
                        page   sitemap   words   TTFB   area-heading
roservicecentrepatna.in   67        67    2,285  2.15s        0
AQUA PERL                145       144    6,434  0.13s       13
```

**Hum content me 3 guna aage hain. Speed me 16 guna tez. Heading me area naam
sirf hamare paas hai.**

Phir bhi wo #1 hai. Kyunki:
1. Unki link-power **ek jagah** jamaa hai, hamari **148 page** me bikhri hai
2. Unka domain purana hai, hamara **13.5 mahine**
3. Unke paas backlink hain, hamare paas **0**

🔴 **Content hamari kamzori nahi hai. Link ka dhaancha aur domain ki umar hai.**

---

## 4. Aaj kya kiya (is zip me)

### ✅ 4 asli policy page bane
```
/shipping-policy     delivery charge, time, installation, damage
/returns-refunds     kya wapas ho sakta hai, kya nahi, paisa kab
/warranty-terms      30 din labour + 12 mahine parts, kab nahi lagti
/privacy-policy      kya lete hain, kya nahi karte, data hatwana
```
Content ka ek hi source — `src/lib/seo/policy-data.ts`. `/contact` ka summary
wahi se padhta hai, isliye number kabhi alag nahi ho sakte.

### ✅ Footer ke 4 link ab sahi jagah
`Shipping Policy` ab `/shipping-policy` par jaata hai, `/contact` par nahi.
**580 andaruni link ek galat signal se hata kar sahi page par pahunch gaye.**
`Contact Us` abhi bhi `/contact` par — wo sahi tha.

🔴 **Koi link hataya nahi gaya. Label waise ke waise hain.** Sirf manzil sahi hui.

### ✅ Chaaron page sitemap me
Google ko bhi pata chale.

---

## 5. Aage ka roadmap — phase wise

### PHASE 1 — ab (is zip me) ✅
- 4 policy page + footer link theek
- 580 link galat anchor se hate

### PHASE 2 — agla zip (keyword gap bharna)
Jin keyword par title/H1 me **0** coverage hai, unhe **naye H2** se bharna
(title chhede bina — zero risk):

| keyword | kahan H2 banega |
|---|---|
| `ro repair near me` | `/ro-repair-patna` |
| `water purifier service near me` | `/ro-services-patna` |
| `water purifier service patna` | `/ro-service-in-patna` |
| `ro service centre patna` | `/ro-customer-care-patna` |
| `ro technician patna` | `/ro-services-patna` |

🔴 Har H2 ke neeche asli kaam ki baat likhni hai, sirf keyword nahi. Khali
keyword daalna spam hai aur ulta nuksan karta hai.

### PHASE 3 — cannibalization theek karna (sabse savdhani se)
19 page `ro service in patna` target kar rahe hain. Ek-ek karke, **ek hafte me
ek**, GSC me asar dekh kar:

1. Tay karo ki is keyword ka **ek hi maalik page** hoga — `/ro-service-in-patna`
2. Baaki 18 page ke title se wo exact phrase hatao, unka apna keyword do
3. Un 18 page se maalik page par **keyword anchor** ke saath link do
4. Har badlav ke baad 7 din GSC dekho — girne lage to turant wapas

🔴 **Ye ek saath 19 page par NAHI karna. Ek baar me ek.**

### PHASE 4 — link-power ek jagah jamaa karna
Abhi hamara sabse strong page `/contact` tha. Hona chahiye `/ro-service-in-patna`.
Footer aur body links ko dheere-dheere us par mod'na — par **natural rakhna**,
har jagah ek hi anchor nahi (wo spam dikhta hai).

### PHASE 5 — jo code se nahi hota (sabse bada bacha hua kaam)
```
backlinks 0 -> 20     local organic ka 24%     Udyam · Bing Places · JustDial ·
                                               IndiaMART · Sulekha
GBP primary category  Map Pack ka #1 factor    "Water purifier repair service"
GBP hours             #5 factor                24h -> 08:00-21:00
reviews 60 -> 200     Map Pack ka 20%          5-10 har mahine
```

---

## 6. Imaandari se — kitna time lagega

| kaam | asar kab dikhega |
|---|---|
| policy page + link fix | 2–4 hafte (Google ko dobara crawl karna padega) |
| H2 se keyword gap bharna | 3–6 hafte |
| cannibalization theek karna | 4–8 hafte, ek-ek page |
| backlinks | 4–12 hafte |
| GBP category + hours | **2–7 din** (sabse tez asar) |

🔴 **Domain 13.5 mahine ka hai. Google naye domain ko pura bharosa dene me
6–12 mahine leta hai. Ye sach hai aur isko koi code badal nahi sakta.**

Sabse tez natija GBP se aayega — wo 10 minute ka kaam hai aur Map Pack ka
32% usi se chalta hai.
