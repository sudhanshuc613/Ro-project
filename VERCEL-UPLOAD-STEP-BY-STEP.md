# Upload Karo — Step by Step

Total: **~15 minute**

---

# Is update mein kya hai

| # | Kya |
|---|---|
| 1 | 🆕 **Poora account section** — 10 pages, sidebar navigation, Flipkart/Amazon jaisa |
| 2 | 🆕 **My RO Machines** — filter age tracking (ye koi competitor ke paas nahi hai) |
| 3 | 🆕 **Admin "Service Due"** — kis customer ko aaj call karna hai, ready list |
| 4 | 🆕 Wishlist, Reviews, Addresses, Profile, Notifications |
| 5 | 🗑️ **Hata diya** — coins, gift card, plus zone, coupons, card details |
| 6 | 🆕 Navbar account dropdown |

---

# Part 1 — Account section

## Jo aapne hatane ko bola, hata diya

| Cheez | Status | Kyun sahi decision hai |
|---|---|---|
| SuperCoin / coins | ❌ Hataya | Points ka matlab tabhi hai jab lakhon customer ho. Khaali counter dekhke lagta hai dukaan chhoti hai |
| Gift Card | ❌ Hataya | Prepaid instrument — RBI compliance lagti hai |
| Plus Zone | ❌ Hataya | Membership tier bina scale ke bekaar |
| Coupons section | ❌ Hataya | Coupon checkout pe lagta hai, alag page ki zaroorat nahi |
| **Card details** | ❌ Hataya | **Sabse important** — card store karne pe PCI-DSS compliance aa jaati. Razorpay apne side pe safe rakhta hai, humein zaroorat hi nahi |

## Jo add kiya

**Sidebar mein 4 group:**

```
Overview   → Dashboard
Service    → Service History · My RO Machines · AMC Plans
Shopping   → My Orders · Wishlist · My Reviews
Account    → Addresses · Profile · Notifications
```

Har item pe count badge. Mobile pe scrollable chips (sidebar 360px phone pe content 2 screen neeche push kar deta).

## 🚰 My RO Machines — ye aapka asli hathiyaar hai

**Problem:** Customer ko yaad nahi rehta filter kab badla tha. Paani kharab hone pe Google pe search karta hai, jo pehle aaya usko call karta hai. **Har baar rishta zero se shuru.**

**Solution:** Customer apni machine add karta hai — brand, model, kab install hui, kaun sa filter kab badla. Website khud calculate karti hai:

| Part | Normal | Patna high-TDS mein |
|---|---|---|
| Sediment filter | 6 mahine | **4 mahine** (TDS 600+) / 3 mahine (TDS 900+) |
| Carbon filter | 8 mahine | 5-6 mahine |
| RO membrane | 24 mahine | 18 mahine |
| UV lamp | 12 mahine | 12 mahine |

Patna ka borewell paani 400-900 ppm TDS pe hota hai — isliye filter jaldi kharab hote hain. Ye code mein built-in hai.

Customer ko health score dikhta hai (100 mein se) + progress bar har filter ka. Overdue ho to laal + seedha "Book technician" button.

**Ek zaroori baat:** agar date pata nahi hai to **"Not recorded"** dikhta hai — jhoota alarm nahi. Galat warning se bharosa tootta hai.

## ⏰ Admin → Service Due — ye paisa banata hai

Naya page: `/admin/service-due`

Baaki poora admin panel **reactive** hai (customer aata hai, aap respond karte ho). Ye ek page **khud se paisa banata hai**.

Dikhta hai:
- Kis customer ka kaun sa filter kitne mahine overdue hai
- Uska phone number + address
- Us kaam ka daam (₹450-600 etc.)
- **📞 Call** aur **WA** button — WhatsApp message Hinglish mein khud ban jaata hai
- Upar: kitna revenue table pe pada hai

Test mein ye message auto-bana:
> *"Namaste Prince ji, AquaNexa se. Aapke Kent RO ka Sediment filter aur RO membrane change karne ka time ho gaya hai..."*

**Competitor ye copy nahi kar sakta** — pehle unhe har customer ka machine data collect karna padega, jisme mahine lagenge.

---

# Part 2 — Testing (28 test, sab pass)

## Machine health

| Test | Result |
|---|---|
| Sediment 9 mahine purana, TDS 650 | Interval auto 4 mahine hua → **5 mahine overdue** ✓ |
| Health score | **28/100 "Overdue"** ✓ |
| Dashboard pe alert | "Needs your attention" + Book visit ✓ |
| Admin Service Due | 1 customer, **₹2,350 revenue** (450+1200+700) ✓ |
| Date nahi di to | "Not recorded" — fake alarm nahi ✓ |

## 🔒 Security (sabse important)

Doosra customer bana ke Prince ka data chhune ki koshish ki:

| Attack | Result |
|---|---|
| Uski machine edit | **404 blocked** ✓ |
| Uski machine delete | **404 blocked** ✓ |
| Uska address edit | **404 blocked** ✓ |
| Uska address delete | **404 blocked** ✓ |
| Default address hijack | **404 blocked** ✓ |

Prince ka data check kiya — **bilkul intact**.

## Review integrity

| Test | Result |
|---|---|
| Bina khareede review | **403 blocked** — "only after delivered" ✓ |
| Delivered order ke baad | Ban gaya, `verified: true` ✓ |
| Do baar review | **409 blocked** ✓ |
| Unapproved review rating badalta hai? | **Nahi** — 0.00 hi raha ✓ |

## Validation

| Test | Message |
|---|---|
| Future date | "Date cannot be in the future" ✓ |
| TDS 99999 | "must be ≤ 5000" ✓ |
| Brand missing | "Required" ✓ |
| Khaali date `""` | Crash nahi, handle ho gaya ✓ |
| Galat password | "Current password is incorrect" ✓ |
| Duplicate email | "That email is already in use" ✓ |
| Address: 4 field galat | Chaaron ka alag message ✓ |
| Sirf ek default address | DB mein verify kiya ✓ |

## Regression

**29 pages → sab 200** ✓ · TypeScript clean ✓ · Invoice print clean ✓

## Hatai gayi cheezein — verify

5 pages scan kiye "supercoin", "gift card", "plus zone", "saved card", "coupon" ke liye → **sab CLEAN** ✓

---

# Part 3 — Upload steps

## STEP 1 — Node band

```cmd
taskkill /F /IM node.exe
```

## STEP 2 — `.env` backup

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```
```cmd
copy .env ..\env-backup.txt
```

## STEP 3 — Zip extract — REPLACE mode

Right-click → Extract All → destination `C:\Users\SUDHA\Downloads\ro-Project\Ro-project` → **"Replace the files in the destination"**

## STEP 4 — Verify

```cmd
dir src\app\account
```
Ye folders dikhne chahiye: `addresses  amc  machines  notifications  orders  profile  reviews  services  wishlist` ✅

## STEP 5 — ⚠️ npm install

```cmd
npm install
```

## STEP 6 — Push

```cmd
git add .
```
```cmd
git commit -m "Full account section, RO machine tracking, service due admin"
```

### 🛑 Safety
```cmd
git remote -v
```
`sudhanshuc613/Ro-project.git` — doosra naam dikhe to **RUKO**

```cmd
git status
```
`.env` nahi dikhna chahiye

```cmd
git push --force
```

## STEP 7 — Vercel build (4 min)

vercel.com → `ro-project` → Deployments → **Ready**

## STEP 8 — ⚠️ Neon SQL — naya table

```sql
CREATE TABLE IF NOT EXISTS customer_machines (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname           VARCHAR(80),
    brand              VARCHAR(80) NOT NULL,
    model              VARCHAR(120),
    serial_number      VARCHAR(80),
    purchase_date      DATE,
    installed_date     DATE,
    warranty_ends_on   DATE,
    address_id         UUID REFERENCES addresses(id) ON DELETE SET NULL,
    capacity_litres    NUMERIC(6,2),
    purification_tech  TEXT[] NOT NULL DEFAULT '{}',
    inlet_tds          SMALLINT,
    outlet_tds         SMALLINT,
    tds_checked_on     DATE,
    sediment_changed_on DATE,
    carbon_changed_on   DATE,
    membrane_changed_on DATE,
    uv_changed_on       DATE,
    next_service_due   DATE,
    notes              TEXT,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_machines_user ON customer_machines(user_id);
CREATE INDEX IF NOT EXISTS idx_machines_due  ON customer_machines(next_service_due) WHERE is_active;
```

**Agar pichhli baar `media_assets` wala SQL nahi chalaya tha**, to wo bhi chalao (pichhle guide mein hai) — warna `/admin/media` 500 dega.

**Run** dabao.

### Verify
```sql
SELECT count(*) FROM customer_machines;
```
`0` aayega — table ban gaya ✅

## STEP 9 — Redeploy

Deployments → latest → **⋯** → Redeploy → cache tick **hatao**

---

# STEP 10 — Test

## Account section
```
1. /register → account banao
2. /account → sidebar dikhega (10 sections)
3. Har section click karke dekho — koi 404 nahi
4. Coins/gift card/plus zone kahin nahi dikhna chahiye
```

## Machine tracking (sabse important)
```
1. /account/machines → "Add your first machine"
2. Brand: Kent
3. Sediment filter changed on: 9 mahine pehle ki date daalo
4. Inlet TDS: 650
5. Add machine
```
Dikhna chahiye: laal "Overdue" bar, health score kam, "Book a technician" button.

Phir `/account` kholo → **"Needs your attention"** box upar dikhega.

## Admin Service Due
```
/admin/service-due
```
Wahi customer list mein dikhega, phone number ke saath, ₹ amount ke saath, Call aur WA button ke saath. **WA button daba ke dekho** — Hinglish message ready milega.

## 🛑 Aur
**rokadoctor.in** — purani PHP site chal rahi hai? ✅

---

# Checklist

- [ ] `taskkill /F /IM node.exe`
- [ ] `.env` backup
- [ ] Zip extract — **Replace**
- [ ] `dir src\app\account` → 9 folders
- [ ] ⚠️ `npm install`
- [ ] `git add .` + commit
- [ ] 🛑 `git remote -v`
- [ ] 🛑 `git status` → `.env` nahi
- [ ] `git push --force`
- [ ] Vercel → Ready
- [ ] ⚠️ Neon SQL (`customer_machines`)
- [ ] Redeploy (cache off)
- [ ] `/account` test
- [ ] `/account/machines` pe machine add karke dekho
- [ ] `/admin/service-due` check

---

# Troubleshooting

### ❌ `/account/machines` pe 500
STEP 8 ka SQL nahi chala.

### ❌ `/admin/media` pe 500
Pichhle update ka `media_assets` SQL nahi chala.

### ❌ Build fail: `Property 'customerMachine' does not exist`
`npm install` ke baad Prisma client regenerate nahi hua:
```cmd
npx prisma generate
git add . && git commit -m "regen" && git push
```

### ❌ Sidebar nahi dikh raha
Mobile pe sidebar nahi hota — upar scrollable chips hote hain. Desktop pe hi sidebar aata hai.

### ❌ Push reject
```cmd
git push --force origin main
```

---

# ⚠️ Ab bhi pending (sach)

| # | Kya | Kyun |
|---|---|---|
| 1 | **Google Business Profile** | Local ranking ka **32%**. Competitor ke 5,117 review, aapke 0. Free hai |
| 2 | **AI photos** `public/service/*.jpg` | GBP suspend kar sakta hai. Ab `/admin/media` se khud badal sakte ho |
| 3 | **Admin password `ChangeMe@123`** | Guide files mein publicly likha hai |
| 4 | **Razorpay mock mode** | Asli paisa nahi aata |
| 5 | **Vercel Hobby** | Payment gateway = commercial use, allowed nahi |

---

# 💡 Machine tracking ka poora fayda kaise uthayein

Ye feature tabhi kaam karta hai jab **data ho**. Isliye:

1. **Har visit ke baad** — technician se bolo customer ki machine `/admin` se add kare, ya customer ko bolo khud add kare
2. **Purane customers ko** — ek WhatsApp broadcast: *"apni RO ki detail add kar dijiye, hum aapko filter change ka reminder bhej denge"*
3. **3 mahine baad** — `/admin/service-due` khud bharne lagega, aur aapke paas har din call karne ki ready list hogi

Yahi wo cheez hai jo Eureka Forbes ko 23% market share deti hai — product nahi, **service relationship**.
