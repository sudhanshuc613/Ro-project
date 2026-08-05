# Meta WhatsApp Setup — Step by Step

**Kya milega:** ₹0 wala phone verification chalu ho jayega
**Time:** 30–40 minute (+ business verification ka wait, agar zaroorat padi)
**Kharcha:** ₹0

---

## Aakhir mein ye 4 cheezein Vercel pe daalni hain

Poore process ka maqsad sirf ye chaar values nikalna hai:

| Kya | Kahan se milega | Dikhta kaisa hai |
|---|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | Step 5 | `123456789012345` |
| `WHATSAPP_ACCESS_TOKEN` | Step 7 | `EAAxxxxx…` (bahut lamba) |
| `WHATSAPP_APP_SECRET` | Step 8 | `a1b2c3d4e5f6…` (32 char) |
| `WHATSAPP_VERIFY_TOKEN` | aap khud banate ho | `aquanexa_verify_token` |

Ek notepad khol lo, har step pe copy karte jao.

---

## ⚠️ Sabse pehle — ek zaroori decision

WhatsApp API ke liye jo number use karoge, **wo number normal WhatsApp se hat jayega. Permanently.**

| Number | Use karein? |
|---|---|
| 8969821440 (aapka main number) | ❌ **Nahi** — customer isi pe WhatsApp karte hain, wo band ho jayega |
| 9661288308 ya 9534037266 | ⚠️ Tabhi jab uspe WhatsApp use nahi karte |
| **Naya SIM (₹100–200)** | ✅ **Best** — bas isi kaam ke liye |

**Mera suggestion:** ek sasta naya SIM le lo. Ek baar ka ₹150 kharcha, aur aapka main number safe rahega.

> Wajah: Cloud API number "consumer WhatsApp" se register nahi ho sakta. Register karte hi purana WhatsApp us number pe **delete** ho jayega — chats, groups, sab.

---

# STEP 1 — Meta Business Account

1. `business.facebook.com` kholo
2. Facebook account se login (personal chalega)
3. **Create account** dabao (agar pehle se nahi hai)
4. Bharo:
   - **Business name:** `AquaNexa Water Solutions`
   - **Your name** aur **business email**
5. **Submit**

✅ Business Manager ban gaya.

---

# STEP 2 — Developer account

1. `developers.facebook.com` kholo
2. **Wahi Facebook account** se login (STEP 1 wala)
3. Upar right mein **Get Started** → terms accept karo
4. Phone/email verify karo agar maange

---

# STEP 3 — App banao

1. `developers.facebook.com/apps` pe jao
2. **Create App** (green button)
3. **"What do you want your app to do?"** → **Other** → **Next**
4. App type: **Business** → **Next**
5. Bharo:
   - **App name:** `AquaNexa WhatsApp`
   - **Contact email:** aapka email
   - **Business account:** dropdown se `AquaNexa Water Solutions` chuno
6. **Create app** → Facebook password dobara maangega

---

# STEP 4 — WhatsApp product add karo

1. App dashboard pe **Add products to your app** dikhega
2. **WhatsApp** card dhundo → **Set up**
3. Business account confirm → **Continue**

✅ Left sidebar mein **WhatsApp** aa gaya, uske andar **API Setup**.

---

# STEP 5 — Apna number add karo 📱

`WhatsApp → API Setup` kholo.

Yahan pehle se ek **test number** dikhega. **Us se kaam nahi chalega** — wo sirf 5 numbers ko message bhej sakta hai.

1. **From** dropdown ke neeche **Add phone number**
2. Bharo:
   - **Display name:** `AquaNexa` (customer ko yahi dikhega — approval lagti hai)
   - **Category:** Business
   - **Business description:** `RO water purifier sales and service in Patna`
3. **Next**
4. Naya number daalo **+91 format mein** → `+919876543210`
5. **Text message** ya **Voice call** chuno → **Next**
6. 6-digit OTP aayega → daalo → **Verify**

## 🔑 Ab PHONE_NUMBER_ID copy karo

Verify hone ke baad `API Setup` pe wapas aao. **From** ke neeche number ke saath ek lamba number dikhega:

```
Phone number ID:  123456789012345    ← YE COPY KARO
```

> ⚠️ Ye **phone number nahi hai**. Ye 15-digit ka ID hai. Notepad mein save karo.

---

# STEP 6 — Business verification

**Ye kab chahiye:** roz 250 se zyada customer ko message karne pe. Shuruaat mein **skip kar sakte ho** — bina verification ke bhi reverse-OTP chalega.

Karna ho to:
1. `business.facebook.com/settings` → **Security Centre**
2. **Start verification**
3. India ke liye documents: **GST certificate** ya **Udyam registration**, **PAN**, address proof, website URL

Meta 2–5 din leta hai.

---

# STEP 7 — Permanent token 🔑

**Ye step sabse zyada log galat karte hain.**

`API Setup` page pe jo **Temporary access token** dikhta hai — wo **24 ghante mein mar jayega**. Uske baad sab band. Permanent chahiye.

### 7a. System user banao

1. `business.facebook.com/settings` kholo
2. Left sidebar → **Users** → **System users**
3. **Add** dabao
4. Bharo:
   - **Name:** `aquanexa-api`
   - **Role:** **Admin** ← zaroori hai
5. **Create system user**

### 7b. Assets assign karo ⚠️

**Ye step skip mat karna — 80% log yahi bhoolte hain aur token kaam nahi karta.**

1. Abhi bane system user pe click
2. **Assign assets** dabao
3. **Apps** tab → `AquaNexa WhatsApp` tick karo → **Full control** toggle on
4. **Save changes**
5. Phir se **Assign assets**
6. **WhatsApp accounts** tab → apna WABA tick → **Full control** on
7. **Save changes**

### 7c. Token generate karo

1. Usi system user pe **Generate new token**
2. **App:** `AquaNexa WhatsApp`
3. **Token expiration:** **Never** ← dhyan se
4. Permissions mein ye **do** tick karo:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
5. **Generate token**

```
EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...   ← ABHI COPY KARO
```

> 🚨 Ye token **ek hi baar dikhega**. Window band ki to dobara nahi milega — naya banana padega. Notepad mein turant paste karo.

---

# STEP 8 — App Secret

1. `developers.facebook.com/apps` → apna app
2. Left sidebar sabse neeche → **App settings** → **Basic**
3. **App secret** ke aage **Show** → password maangega
4. Copy karo

```
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6   ← YE COPY KARO
```

> Iske bina reverse-OTP **bilkul nahi chalega**. Maine jaan-boojh kar aisa rakha hai — bina signature check ke koi bhi fake "message" bhej ke kisi ka bhi number verify kar leta.

---

# STEP 9 — Vercel pe 4 values daalo

1. `vercel.com` → `ro-project` → **Settings** → **Environment Variables**
2. Ek-ek karke **Add New**:

| Name | Value |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | Step 5 wala 15-digit ID |
| `WHATSAPP_ACCESS_TOKEN` | Step 7 wala `EAA…` token |
| `WHATSAPP_APP_SECRET` | Step 8 wala secret |
| `WHATSAPP_VERIFY_TOKEN` | `aquanexa_verify_token` |

Har ek pe **Production + Preview + Development** teeno tick karo.

3. **Deployments** → latest → **⋯** → **Redeploy** (cache off)

> ⚠️ Redeploy zaroori hai — bina iske naye variables use nahi honge.

---

# STEP 10 — Webhook jodo 🔗

**Ab tak sirf outgoing setup hua. Ye step incoming ke liye hai — yahi reverse-OTP ka dil hai.**

1. `developers.facebook.com/apps` → app → **WhatsApp** → **Configuration**
2. **Webhook** section → **Edit**
3. Bharo:

| Field | Value |
|---|---|
| **Callback URL** | `https://ro-project.vercel.app/api/webhooks/whatsapp` |
| **Verify token** | `aquanexa_verify_token` |

4. **Verify and save**

> ✅ Turant save ho gaya = kaam ho gaya
> ❌ "The URL couldn't be validated" = Step 9 ka redeploy nahi hua, ya token match nahi kar raha

5. Save hone ke baad **Webhook fields** mein **messages** ke aage **Subscribe** ✓

> Sirf **messages** chahiye. Baaki mat chuno — bekaar traffic aayega.

---

# STEP 11 — Chalu karo

1. `https://ro-project.vercel.app/admin/settings`
2. **🔐 Phone Verification**
3. **"WhatsApp — customer sends us the code"** chuno
4. Neeche on karo:
   - ✅ Cash on Delivery orders
   - ✅ Service bookings
   - ✅ Don't re-verify a known number
5. **Save**

---

# STEP 12 — Test 🧪

1. Homepage pe booking form bharo — **apna** number daalo
2. Screen pe 4-letter code dikhega, jaise `YX89`
3. **Open WhatsApp & send** dabao
4. WhatsApp khulega, code pehle se typed hoga → **Send**
5. 3 second mein website khud aage badh jayegi ✅
6. WhatsApp pe reply aayega: *"✅ Number verified"*

### Fake number se test karo

Booking form mein `9999999999` daalo → code to dikhega, par WhatsApp bhej hi nahi paoge → **booking block ho jayegi**.

**Yahi poori baat hai.**

---

# Troubleshooting

### ❌ "The URL couldn't be validated"
- Step 9 ka **Redeploy** nahi kiya
- `WHATSAPP_VERIFY_TOKEN` aur webhook wala token alag hain
- URL mein typo — `/api/webhooks/whatsapp` exactly hona chahiye

### ❌ Code bheja par kuch nahi hua
- **messages** field subscribe nahi kiya (Step 10.5)
- `WHATSAPP_APP_SECRET` galat — webhook chupchaap reject kar raha hai
- Aap **kisi aur number** pe bhej rahe ho. Business number pe bhejo — button use karo

### ❌ "Access token expired"
Temporary token use kar liya. Step 7 dobara karo, **expiration: Never**.

### ❌ Token banaya par "permission denied"
Step 7b nahi kiya — assets assign nahi hue. System user → Assign assets → App **aur** WhatsApp account, dono pe Full control.

### ❌ Number add karte waqt "already registered"
Us number pe WhatsApp chal raha hai. Pehle usse delete karo (WhatsApp → Settings → Account → Delete my account), ya naya SIM lo.

### ❌ Display name approve nahi hua
Legal business name se milta-julta rakho. `AquaNexa` chalega, `Best RO Service Patna` reject hoga.

---

# Checklist

- [ ] Naya SIM liya (ya confirm kiya ki us number pe WhatsApp nahi hai)
- [ ] `business.facebook.com` — Business account bana
- [ ] `developers.facebook.com` — Developer account
- [ ] App banaya (type: **Business**)
- [ ] WhatsApp product add kiya
- [ ] Number add + OTP verify
- [ ] 📋 **PHONE_NUMBER_ID** copy kiya
- [ ] System user banaya (role: **Admin**)
- [ ] ⚠️ **Assets assign** kiye — App + WhatsApp account, Full control
- [ ] 📋 **Token** copy kiya (expiration: **Never**)
- [ ] 📋 **App Secret** copy kiya
- [ ] Vercel pe 4 variables
- [ ] **Redeploy** kiya
- [ ] Webhook add + **Verify and save**
- [ ] **messages** field subscribe
- [ ] `/admin/settings` se chalu kiya
- [ ] Apne number se test
- [ ] Fake number se test — block hua?

---

# Agar atak jao

Us screen ka **screenshot bhejo** jahan atke ho. Error ka exact text bhi. Main dekh ke bata dunga.

Aur agar ye poora process bhaari lag raha hai — **koi baat nahi**. Verification abhi off rakho, site chalti rahegi. Jab fake order/booking pareshaan karne lagein, tab ye setup kar lena. Tab tak baaki sab kaam karta rahega.
