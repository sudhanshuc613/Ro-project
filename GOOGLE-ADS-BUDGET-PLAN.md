# ₹31.8/din — kyun call nahi aa rahe, aur kitna lagana chahiye

**7 Aug 2026 · Aqua Perl**

---

# 🔴 Seedhi baat pehle

**₹31.8/din se call nahi aayenge. Ye technically possible hai, practically bekaar hai.**

Ye tera dosh nahi — Google khud ₹100/din se allow karta hai, isliye lagta hai kaam karega. **Karta nahi.**

---

# Math — kyun kaam nahi kar raha

India mein local service ka CPC **₹10–₹50** hai (2026 data). Patna mein RO keyword realistically **₹15–₹35**.

Tere ₹31.8/din se:

| Agar CPC | Roz click | Mahine mein click | Mahine mein call |
|---|---|---|---|
| ₹15 | **2.1** | 64 | ~4 |
| ₹25 | **1.3** | 38 | ~3 |
| ₹35 | **0.9** | 27 | ~2 |

**Matlab roz sirf 1-2 log click kar rahe hain.** Aur unme se har 100 mein se 7 call karte hain (home services ka average).

**1-2 click/din se call aana lottery jaisa hai.**

---

## Isse bhi badi problem — Google seekh hi nahi paata

Google ka system **data se seekhta hai** — kaun click karta hai, kaun call karta hai. Usko seekhne ke liye chahiye:

```
Minimum: 10-15 click/din
Tere paas: 1-2 click/din
```

**Itne kam data se Google guess karta rehta hai.** Isliye ad kabhi dikhta hai kabhi nahi, aur galat logon ko dikhta hai.

> Research mein saaf likha hai: *"A budget that only generates one or two clicks per day is unlikely to produce reliable results."*

---

# 💰 Kitna lagana chahiye — target ke hisaab se

Patna RO ke liye (CPC ₹25, call rate 7%):

| Chahiye | Roz kitna | Mahine mein |
|---|---|---|
| 5 call/mahina | **₹60** | ₹1,800 |
| 10 call/mahina | **₹120** | ₹3,600 |
| 20 call/mahina | **₹240** | ₹7,200 |
| 30 call/mahina | **₹357** | ₹10,700 |

---

# 🎯 Mera saaf suggestion

## Pehla mahina: ₹150/din (₹4,500)

**Kyun ₹150:**
- 6 click/din — Google ko seekhne layak data milega
- Mahine mein ~180 click → **10-13 call**
- Har call ₹200 visit + parts = ₹500-1,200

**Kyun ₹500/din nahi (jo sab bolte hain):**
Tere paas abhi conversion tracking nahi hai. Bina uske ₹500/din matlab **andhere mein paisa phekna**. Pehle 1 mahina data collect karo.

## Kya kamayega ₹150/din pe

```
Kharch:  ₹4,500/mahina
Call:    ~12
Job:     ~6 (50% close hota hai)
Kamai:   6 × ₹700 = ₹4,200
```

**Pehle mahine barabar rahega — profit nahi.** Ye normal hai, ye seekhne ka mahina hai.

## Doosra mahina: ₹250/din (₹7,500)

Data aa chuka hoga. Ab jo keyword call la raha hai sirf uspe kharch:

```
Kharch:  ₹7,500
Call:    ~22
Job:     ~13
Kamai:   13 × ₹800 = ₹10,400
```

**Ab ₹3,000 profit.** Aur AMC bech diya to aur zyada.

---

# 🔴 Par ruko — ads badhane se pehle 3 kaam

**₹31.8 se ₹150 karne se pehle ye theek karo, warna wo paisa bhi barbaad hoga.**

## 1. Conversion tracking lagao (SABSE ZAROORI)

Maine abhi check kiya:
```
Google Ads conversion tag (AW-):  NAHI HAI ❌
GA4 phone_call_click:             HAI ✅
```

**Matlab abhi Google ko pata hi nahi ki kaunse click se call aaya.** Isliye wo optimize nahi kar paa raha.

**Ye main laga sakta hoon** — tujhe bas Google Ads se **Conversion ID** lena hai:

1. Google Ads → **Goals** → **Conversions** → **+ New conversion action**
2. **Website** chuno → `rokadoctor.in` daalo → Scan
3. **Add a conversion action manually**:
   - Category: **Contact** (ya Phone call lead)
   - Name: `Phone Call Click`
   - Value: **₹700** (ek job ka average)
   - Count: **One**
4. Save → **Tag setup** → **Use Google Tag Manager** nahi, **Install the tag yourself** chuno
5. Wahan **Conversion ID** (`AW-XXXXXXXXX`) aur **Conversion Label** dikhega

**Wo dono mujhe bhej dena — main code mein laga dunga.** Phir Google khud seekh jayega ki kaunse log call karte hain.

## 2. Sirf Patna target karo

Google Ads → Campaign → **Settings** → **Locations**

- ❌ India / Bihar mat rakhna
- ✅ **Patna** + 15 km radius

> Poora India target hoga to Kerala se click aayenge — paisa gaya.

Aur ek chhupi hui setting:
**Location options** → **"Presence: People in or regularly in your targeted locations"** chuno
(default "interest" hota hai — matlab jo Patna ke baare mein search kar raha ho, wo bhi. Wo bekaar hai.)

## 3. Negative keywords daalo

Campaign → **Keywords** → **Negative keywords** → ye paste karo:

```
free
job
jobs
vacancy
salary
naukri
training
course
dealership
franchise
wholesale
second hand
used
price list pdf
how to repair
diy
```

**Ye ₹31.8 ka aadha bacha lega** — abhi shayad "ro repair job patna" jaise search pe paisa ja raha hai.

---

# ⏰ Ek aur cheez — ad kab dikhe

Campaign → Settings → **Ad schedule**

```
Sirf: 8 AM – 9 PM
```

**Kyun:** raat 2 baje click aaya to tu call nahi utha payega. Lead barbaad, paisa barbaad.

---

# 📋 Ab kya karna — order mein

## Aaj (30 min)

- [ ] **Negative keywords** daalo (upar wali list)
- [ ] **Location** sirf Patna + 15km, "Presence" wala option
- [ ] **Ad schedule** 8 AM – 9 PM
- [ ] Budget **₹31.8 → ₹150** karo

## Is hafte

- [ ] **Conversion action** banao, ID + Label mujhe bhejo
- [ ] Main tracking laga ke zip dunga
- [ ] 7 din chalne do — kuch mat chhedna

## Agle hafte

- [ ] **Search terms report** dekho (Keywords → Search terms)
- [ ] Jo faltu search dikhe, usko negative mein daal do
- [ ] Jo keyword call la raha hai, uska bid badhao

---

# 🔴 Sabse important — ads sabse mehnga rasta hai

Sach ye hai bhai:

| Channel | Cost | Tere paas |
|---|---|---|
| **GBP (Map Pack)** | **₹0** | 44 review, live ✅ |
| **Website SEO** | **₹0** | 35 area pages ✅ |
| **Reviews** | **₹0** | Har hafte 2-3 badha sakta hai |
| **Google Ads** | ₹4,500+/mahina | 1-2 click/din |

**Map Pack 44% clicks leta hai — ads sirf 19%.**

Aur tera GBP already live hai, 44 review hain. **Wo kaam kar raha hai, muft mein.**

## Isliye mera asli suggestion

**Ads pe ₹150/din lagao, PAR usse zyada mehnat GBP pe karo:**

| Roz | Kaam | Cost |
|---|---|---|
| 10 min | GBP post (hafte mein 2-3) | ₹0 |
| 10 min | Review ka jawab | ₹0 |
| 5 min | Us din ke customer se review maango | ₹0 |

**Ye 25 minute roz, ₹150/din ke ad se zyada call layega — 2-3 mahine mein.**

Ads turant call laate hain par paisa lagta hai. GBP time leta hai par muft hai aur permanent.

**Dono chalao. Par GBP pe mehnat zyada.**

---

# ❌ Ye mat karna

| Galti | Kyun |
|---|---|
| ₹31.8 pe chalte rehna | Paisa waste, data bhi nahi milega |
| Ekdum ₹1,000/din karna | Bina tracking ke = andhere mein phenkna |
| Roz settings badalna | Google ko 7 din chahiye seekhne ko |
| "Maximize clicks" bidding | Faltu click layega. **"Maximize conversions"** rakhna — par tracking lagne ke baad |
| Poora India target | Kerala se click = paisa gaya |
| Broad match keywords | Sabse zyada paisa yahin barbaad hota hai. **Phrase match** use karo: `"ro service patna"` |

---

# Keywords — inhi pe kharch karo

**Phrase match mein** (quotes ke saath):

```
"ro repair patna"
"ro service patna"
"water purifier repair patna"
"ro service near me"
"ro filter change patna"
"kent ro service patna"
"aquaguard service patna"
"ro installation patna"
"ro service kankarbagh"
"ro service boring road"
```

> **Broad match mat use karna** — `ro service patna` (bina quotes) likhoge to Google "water purifier price" jaise search pe bhi dikha dega. Paisa barbaad.

---

# Ek line mein

**₹31.8 → ₹150/din karo, par pehle negative keywords + Patna-only + conversion tracking.**

**Aur ads se zyada bharosa GBP pe rakho — wo muft hai aur 44% clicks wahan hain.**

---

**Conversion ID mil jaye to bhej dena — main tracking laga ke zip de dunga.**
