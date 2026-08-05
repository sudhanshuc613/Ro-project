# Phone Verification — Padho

**Aapka sawaal:** *"screen pe OTP dikha dein, agar number real hua to check ho jayega?"*

**Seedha jawab: nahi.** Par ₹0 mein asli verification ka raasta hai — wo bana diya.

---

## Screen pe OTP kyun kaam nahi karta

```
Fraud karne wala:
  1. Daala:        9999999999      ← bilkul fake number
  2. Screen boli:  "OTP: 483920"
  3. Type kiya:    483920
  4. Result:       ✅ VERIFIED

Number check hua?  NAHI.
Usne bas aapki hi di hui cheez wapas type ki.
```

Ye taala hai jiski chaabi taale pe hi tangi hai. OTP ka poora security **do raaste** hone mein hai — code ek raaste jaaye (phone pe), wapas dusre raaste aaye (website pe). Ek hi screen pe dono = zero security.

Isliye maine **DEV mode** rakha hai (aapke testing ke liye), par:
- Screen pe laal warning: **"NOT SECURE"**
- Live site pe chalane se **code khud mana kar deta hai**
- Admin panel mein DEV + koi requirement on karo to **save hi nahi hoga**

---

## ✅ Jo ₹0 mein SACH MEIN kaam karta hai

**WhatsApp reverse-OTP** — code screen pe hi dikhta hai, bas ulta:

```
Screen:  "WhatsApp pe ye code bhejein → 2QB3"
         [WhatsApp kholo] button

User:    apne WhatsApp se 2QB3 bhejta hai

Server:  Meta batata hai "9876543210 se 2QB3 aaya"
         ✅ Number ASLI — WhatsApp ne khud bataya
```

Fake number wala message bhej hi nahi sakta. Aur **incoming message Meta free rakhta hai** — ₹0 per verification.

---

## Chaar mode — admin panel se switch

`/admin/settings` → **🔐 Phone Verification**

| Mode | Kharcha | Setup | Safe? |
|---|---|---|---|
| Test mode | ₹0 | kuch nahi | ❌ **NOT SECURE** — sirf testing |
| **WhatsApp reverse** | **₹0** | webhook 1 baar | ✅ asli |
| WhatsApp OTP | ₹0.115 | template approval ~24h | ✅ asli + smooth |
| SMS (MSG91) | ₹0.15 + ₹5,900 DLT | 1-5 din | ✅ 100% coverage |

Aaj ₹0 wala chalao. Volume badhe to admin panel se ek click mein switch — **code dobara nahi chhedna**.

---

## 🎯 Sabse zaroori baat — OTP kahan lagana hai

Maine socha ki **paisa kahan jaata hai**:

| Kya hua | Aapka nuksan | OTP zaroori? |
|---|---|---|
| Fake account bana, kuch nahi kiya | **₹0** | ❌ bekaar |
| Fake **prepaid** order | **₹0** — paisa aa gaya | ❌ bekaar |
| Fake **COD** order | ₹200-400 shipping | ✅ **haan** |
| Fake **service booking** | ₹150-250 + technician ka ghanta | ✅ **haan** |

**Isliye default:**
- ✅ COD order pe verification
- ✅ Service booking pe verification
- ❌ Prepaid order pe **nahi** (paisa to aa hi gaya — extra step = kam sale)
- ❌ Verified number se **dobara nahi** poocha jaayega

Service booking pe **pehle koi check hi nahi tha** — koi bhi form bhar ke technician bula sakta tha. Ab ye band.

---

## 🐛 Teen bugs jo isi kaam mein pakde

### Bug 1: OTP kabhi kaam kar hi nahi sakta tha
Purana code Redis mein OTP save karta tha:
```js
await redis?.setex(`otp:${phone}`, TTL, otp);   // redis null → kuch nahi hota
```
Aapke Vercel pe `REDIS_URL` set hi nahi hai. Matlab OTP **save hi nahi hota**, aur verify hamesha fail — bina koi error dikhaye.

**Fix:** ab Postgres mein store hota hai (jo already chal raha hai).

### Bug 2: Rate limiting bilkul band thi
```js
if (!redis) return true;   // Redis nahi → sab allowed
```
Poori site pe koi limit lag hi nahi rahi thi — koi 10,000 booking daal sakta tha.

**Fix:** memory fallback + database counting.

### Bug 3: OTP endpoint tha hi nahi
Code mein `/api/auth/send-otp` ka zikr tha, **file exist hi nahi karti thi**.

---

## ✅ Testing — 16 test

| Test | Result |
|---|---|
| DEV mode + live requirement save | ✅ **rejected** |
| Service booking bina verify | ✅ **428 blocked** |
| COD order bina verify | ✅ **428 blocked** |
| Webhook **bina signature** | ✅ **401** — fake message se verify nahi ho sakta |
| Webhook valid signature → verify | ✅ kaam kiya |
| **Token replay** (dobara use) | ✅ **blocked** |
| **Token chori** (dusre number se) | ✅ **blocked** |
| Verified number dobara book kare | ✅ **verification skip** hua |
| Send cap 5/hour | ✅ 6th pe **429** |
| Wrong code 5 baar | ✅ **"Too many wrong attempts"** |
| `devCode` reverse mode mein leak? | ✅ **nahi** |
| Full regression | ✅ **37/37 pages** |

---

## Setup — WhatsApp reverse (₹0)

### 1. Meta app secret nikalo
developers.facebook.com → aapka app → **Settings → Basic** → **App Secret** → Show

Vercel → Settings → Environment Variables:
```
WHATSAPP_APP_SECRET = wo secret
WHATSAPP_VERIFY_TOKEN = aquanexa_verify_token
```

> ⚠️ `WHATSAPP_APP_SECRET` **zaroori hai**. Iske bina webhook har request reject karega — jaan-boojh kar aisa rakha hai, kyunki bina signature check ke koi bhi fake "message" bhej ke number verify kar sakta tha.

### 2. Webhook add karo
Meta app → **WhatsApp → Configuration → Webhook → Edit**

| Field | Value |
|---|---|
| Callback URL | `https://ro-project.vercel.app/api/webhooks/whatsapp` |
| Verify token | `aquanexa_verify_token` |

**Verify and save** → phir **messages** field pe Subscribe ✓

### 3. Admin panel se on karo
`/admin/settings` → Phone Verification → **WhatsApp — customer sends us the code** → COD aur Service dono on → Save

---

## Upload

```cmd
taskkill /F /IM node.exe
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
copy .env ..\env-backup.txt
rmdir /s /q node_modules
del package-lock.json
```

Zip extract → **Replace the files**

```cmd
npm install
npm run build          REM ← zaroor chalao, fail ho to mujhe bhejo
git add .
git commit -m "Phone verification: 4 channels, COD + service gating"
git remote -v
git status
git push --force
```

### ⚠️ Neon SQL — naya table

```sql
CREATE TABLE IF NOT EXISTS otp_challenges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone       VARCHAR(15) NOT NULL,
    code_hash   TEXT NOT NULL,
    purpose     VARCHAR(24) NOT NULL DEFAULT 'LOGIN',
    channel     VARCHAR(24) NOT NULL DEFAULT 'DEV',
    attempts    SMALLINT NOT NULL DEFAULT 0,
    verified_at TIMESTAMPTZ,
    poll_token  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    ip          VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone   ON otp_challenges(phone, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_challenges(expires_at);
```

Phir Redeploy (cache off).

---

## Kab kya chunein

**Abhi (kam order):** WhatsApp reverse — ₹0, aaj se chalu

**Order badhein (50+/mahina):** WhatsApp OTP — ₹0.115. 100 verification = **₹11.50/mahina**. Ek fake COD order roka = 20 mahine ka bill nikal aaya

**Jab WhatsApp na rakhne wale customer aane lagein:** SMS — ₹0.15 + ₹5,900 DLT one-time

---

## ⚠️ Pending

| # | Kya |
|---|---|
| 1 | **Google Business Profile** — local ranking ka 32%, free |
| 2 | **Admin password `ChangeMe@123`** |
| 3 | `WHATSAPP_APP_SECRET` — iske bina reverse-OTP chalega hi nahi |
| 4 | Razorpay keys — manual UPI se kaam chal jaayega |
| 5 | Vercel Hobby → Pro (payment lene lage to) |
