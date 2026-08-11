# 1 saal ka Google Ads data — kaise nikale aur mujhe kya bheje

**7 Aug 2026 · Aqua Perl**

---

# Pehle samajh — ye data sona hai

1 saal chalane ka matlab **hazaaron search terms ka data** tere account mein pada hai.
Usme saaf likha hai:

- kaun se shabd pe paisa gaya aur **kuch nahi mila**
- kaun se shabd pe **call aaya**
- kaun se din/time pe paisa barbaad hua

**Naya ad banane se pehle ye dekhna zaroori hai.** Warna wahi galti dobara hogi.

---

# 📥 PART 1 — 4 report nikalni hain

Sab jagah: **Google Ads** kholo → `ads.google.com`

---

## Report 1 — Search Terms (SABSE ZAROORI)

**Ye batayega ki log kya type karke tere ad pe click kar rahe hain.**

### Steps

1. Left menu → **Campaigns**
2. Upar tabs mein → **Insights and reports**
3. → **Search terms**
4. Upar **date range** pe click (top-right corner)
5. **Custom** chuno → **1 Aug 2025 se 7 Aug 2026** (poora saal)
6. Upar **download icon** (⬇️ ya ⤓) dabao
7. **.csv** chuno

**File download hogi.** Mujhe bhej dena.

> Agar 1 saal ka na aaye to **last 6 months** kar lena — kaam chal jayega.

---

## Report 2 — Keywords

**Ye batayega ki kaun se keyword pe kitna kharch hua.**

1. Left menu → **Campaigns** → **Audiences, keywords and content**
2. → **Search keywords**
3. Same date range (1 saal)
4. **Download** → **.csv**

---

## Report 3 — Campaigns (overview)

1. Left menu → **Campaigns**
2. Same date range
3. **Download** → **.csv**

---

## Report 4 — Time report (kab paisa barbaad hua)

1. Left menu → **Campaigns**
2. Upar **Insights and reports** → **When and where ads showed**
3. Ya: **Reports** → **Predefined reports** → **Time** → **Hour of day**
4. Date range → 1 saal
5. **Download** → **.csv**

---

# 📸 PART 2 — Agar CSV nahi nikal paa raha

**Koi baat nahi — screenshot bhej de.** Ye 5 screen chahiye:

## Screen 1 — Search terms (sabse zaroori)

**Campaigns → Insights and reports → Search terms**

1. Date range: **last 12 months**
2. **Cost** column pe click karke **sort descending** (sabse mehnga upar)
3. Screenshot lo — **top 20-30 rows**

> Isme dikhega ki kis search pe sabse zyada paisa gaya.

## Screen 2 — Keywords

**Campaigns → Audiences, keywords and content → Search keywords**

Cost se sort karo → screenshot

## Screen 3 — Campaign overview

**Campaigns** → main table
Columns dikhne chahiye: **Cost · Clicks · Impressions · CTR · Avg CPC · Conversions**

## Screen 4 — Settings

**Campaigns → Settings** — ye 4 cheez dikhni chahiye:
- **Locations** (kahan target kar raha hai)
- **Bidding** (kaunsi strategy)
- **Ad schedule**
- **Networks** (Search Partners on/off?)

## Screen 5 — Conversions

**Goals → Conversions → Summary**

---

# 🔍 PART 3 — Khud bhi dekh sakta hai — 5 minute mein

Report kholte hi ye 5 cheez check kar:

## 1. Search terms mein faltu shabd

Ye dikhen to samajh paisa barbaad ho raha hai:

```
❌ ro service job         ❌ ro technician salary
❌ ro repair training     ❌ ro dealership
❌ ro price list          ❌ how to repair ro at home
❌ ro service delhi       ❌ ro service mumbai
❌ free ro                ❌ ro machine olx
```

**Har aisa shabd = paisa gaya, call nahi aaya.**

## 2. Kaunse sheher se click aa raha hai

**Campaigns → Settings → Locations**

Agar **India** ya **Bihar** likha hai (sirf Patna nahi) — **wahi sabse badi galti hai.**
Kerala se click aa raha hoga, aur tu paisa de raha hoga.

## 3. Search Partners on hai?

**Campaigns → Settings → Networks**

Agar **"Search Network partners"** pe tick hai — **hata do.**
Ye Google ke alawa doosri site pe ad dikhata hai, quality bahut kharab hoti hai.

## 4. Match type kya hai

**Keywords** report mein har keyword ke aage likha hoga:

| Dikhega | Matlab |
|---|---|
| `ro service patna` (bina quotes) | **Broad** — 🔴 sabse zyada paisa yahin barbaad |
| `"ro service patna"` | Phrase — ✅ theek |
| `[ro service patna]` | Exact — ✅ sabse safe |

**Agar sab broad hai — wahi problem hai.**

## 5. Conversions column

**Campaigns** table mein **Conversions** column dekho.

Agar **0** ya khali hai → **tracking hi nahi lagi.**
Matlab Google ko 1 saal se pata hi nahi ki koi call aaya ya nahi.

**Isliye wo optimize nahi kar paya.** Ye sabse badi wajah hai.

---

# 🔴 PART 4 — Jo maine ABHI check kiya

Tere website pe:

```
Landing page speed    0.53 sec  ✅ (competitor 3.58 sec)
Page size             240 KB    ✅
Click-to-call links   25        ✅
WhatsApp links        15        ✅
GA4 tracking          LIVE      ✅

Google Ads conversion tag (AW-)   NAHI ❌
```

**Website ka side bilkul theek hai.** Speed to competitor se **7 guna tez** hai — ye Quality Score badhata hai, matlab CPC sasta hoga.

**Problem sirf ek:** Google Ads ka conversion tag nahi laga.

---

# ⚠️ Ek baat — naya ad mat banana

Log aksar sochte hain "purana kaam nahi kar raha, naya banate hain".

**Ye galti mat karna.** Reason:

- 1 saal ka data us campaign mein hai — Google ne thoda-bahut seekha hai
- Naya banaya to **wo seekh khatam**, phir se zero se shuru
- Purane campaign ko **theek karna** hamesha behtar hai

**Sirf tab naya banana** jab structure hi galat ho — jaise Display campaign chal raha ho Search ke bajaye. Wo report dekh ke bataunga.

---

# 📋 Ab kya karna — order mein

## Aaj (15 min)

- [ ] Upar wali **4 report** download karo (ya 5 screenshot lo)
- [ ] Mujhe bhej do

## Report dekhne ke baad main bataunga

- Kitna paisa barbaad hua aur kis shabd pe
- Exact negative keyword list (copy-paste ready)
- Kaunse keyword rakhne hain, kaunse hatane
- Settings mein kya badalna
- Budget kitna aur kahan lagana
- Naya campaign chahiye ya purana theek ho jayega

## Saath mein (5 min)

- [ ] **Conversion action** banao (Goals → Conversions → New)
- [ ] **Conversion ID** (`AW-XXXXXXXXX`) aur **Label** mujhe bhejo
- [ ] Main website mein tracking laga ke zip dunga

---

# 🎯 Ek sach jo pehle bata deta hoon

**1 saal chalane ke baad bhi call nahi aaye — iska matlab kuch bada galat hai.**

Meri 90% guarantee hai ki inme se koi ek hoga:

| Sambhavna | Kitna common |
|---|---|
| **Conversion tracking nahi lagi** | 🔴 Sabse zyada — Google andhere mein chal raha |
| **Location poora India/Bihar** | 🔴 Bahut common |
| **Broad match keywords** | 🔴 Bahut common |
| **Budget itna kam ki ad dikhta hi nahi** | 🔴 ₹31.8 se yahi hoga |
| **Search Partners on** | 🟡 Common |
| **Ad Display campaign hai, Search nahi** | 🟡 Kabhi-kabhi |

**Report dekh ke exact bata dunga — guess nahi karunga.**

---

**Bas report ya screenshot bhej de. Main poora audit kar ke exact fix list dunga.**
