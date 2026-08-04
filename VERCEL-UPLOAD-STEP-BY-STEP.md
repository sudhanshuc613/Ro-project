# Vercel pe Upload — Step by Step (Aaj ka Guide)

Total time: **~15 minute**

---

# Part A — Pehle sawaal ka jawab: "login nahi chahiye" ka matlab kya?

## Chhota jawab

Customer ko **account banane ki zaroorat nahi** hai apni service ki status dekhne ke liye.

## Lamba jawab (kaise kaam karta hai)

```
Customer form bharta hai (naam, phone, area, problem)
          ↓
Website turant ek TICKET NUMBER deti hai → SRV-2026-00001
          ↓
Uska link: rokadoctor.in/track/SRV-2026-00001
          ↓
Wo link kabhi bhi kholo → status dikhega
```

**Us page pe login screen nahi aayegi.** Na email, na password, na OTP. Bas link kholo, status saamne.

## Jo dikhta hai us page pe

| Cheez | Detail |
|---|---|
| 5-step progress bar | Request received → Confirmed by phone → Technician assigned → Work in progress → Completed |
| Technician card | Naam, rating (★), kitne jobs kiye, aur **📞 Call button** |
| Charges | Visit ₹200 + parts + labour = total |
| "What we fixed" | Kaam poora hone ke baad technician ka note + 30-day warranty |
| Activity log | Har status change ka time-stamp |
| Auto-refresh | Har **20 second** mein page khud update ho jaata hai — customer ko refresh nahi dabana padta |

## Ye feature kyun business ke liye zaroori hai

Patna mein RO service ki **sabse badi complaint** yahi hai:

> "bola tha aa raha hoon, 4 ghanta ho gaya, koi phone nahi utha raha"

Aapke customer ko wo feeling nahi aayegi. Wo khud dekh lega ki technician assign ho gaya hai. **Aapke phone pe "kahan ho aap" wale calls 70% kam ho jayenge.**

## Security ka sawaal — koi aur to nahi dekh lega?

| Cheez | Kya hai |
|---|---|
| Ticket number guess karna | `SRV-2026-00001` sequential hai — theory mein guess ho sakta hai |
| Kya dikhega agar koi guess kar le | Customer ka naam nahi dikhta, sirf ticket + status + technician ka naam |
| Google pe index hoga? | ❌ Nahi — page pe `robots: noindex` laga hua hai |
| Order invoice bhi aise khulti hai? | ❌ Nahi — **invoice ke liye login zaroori hai** (usme address + phone hota hai) |

**Design decision:** Service tracking = public (convenience jeetti hai), Invoice/Address = login-protected (privacy jeetti hai).

## Do alag cheezein confuse mat karna

| Page | Login chahiye? | Kis liye |
|---|---|---|
| `/track/SRV-2026-00001` | ❌ Nahi | Service status — sabse zyada use hoga |
| `/track-order` | ❌ Nahi | Purana WhatsApp/call wala page |
| `/account` | ✅ Haan | Customer dashboard |
| `/account/orders` | ✅ Haan | Order history |
| `/account/orders/AQN-.../invoice` | ✅ Haan | **GST invoice (aaj naya bana)** |
| `/admin/...` | ✅ Haan | Aapka admin panel |

---

# Part B — Is update mein naya kya hai

| Kya | Detail |
|---|---|
| 🆕 **GST Invoice page** | Pehle "📄 Invoice" button 404 deta tha. Ab poori invoice banti hai — CGST/SGST (Bihar) ya IGST (bahar), amount-in-words, print/PDF button |
| 🆕 Print button | Browser ka apna "Save as PDF" — koi extra library nahi, isliye site slow nahi hoti |
| 🆕 Ownership check | Customer sirf apni invoice dekh sakta hai, admin sabki |

Baaki sab pehle jaisa hai.

---

# Part C — Upload karo (Step by Step)

## ⚠️ Pehle ye padho

Aapne GitHub website se do baar direct edit kiya tha. Isliye `git push` reject hoga. Solution: **`git push --force`**.

Force safe hai **kyunki aapke saare changes (₹200, ₹450-600, ₹1500-2000, ₹350-600) is code mein pehle se hain.** Kuch loss nahi hoga.

---

## STEP 1 — Node band karo (10 second)

Command Prompt kholo, ye paste karo:

```cmd
taskkill /F /IM node.exe
```

> Error aaye "not found" to koi baat nahi — matlab pehle se band tha.

---

## STEP 2 — `.env` ka backup (20 second)

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

```cmd
copy .env ..\env-backup.txt
```

> `.env` mein aapka Neon database password hai. Ye file GitHub pe **kabhi nahi** jaati. Backup isliye ki zip extract karte waqt galti se delete na ho.

---

## STEP 3 — Zip extract karo — REPLACE mode (2 min)

1. Naya `aquanexa-project.zip` download karo
2. Right-click → **Extract All…**
3. Destination box mein exactly ye likho:
   ```
   C:\Users\SUDHA\Downloads\ro-Project\Ro-project
   ```
4. **Extract** dabao
5. Windows poochhega → **"Replace the files in the destination"** chuno

> ⚠️ "Skip these files" mat chunna. Replace hi karna hai.

---

## STEP 4 — Verify (30 second)

```cmd
type .env | findstr DATABASE_URL
```
Neon ki string dikhni chahiye. **Agar kuch nahi dikha:**
```cmd
copy ..\env-backup.txt .env
```

```cmd
dir src\app\account\orders
```
`[orderNumber]` naam ka folder dikhna chahiye ✅ (yahi naya invoice page hai)

```cmd
findstr "visitCharge" src\lib\constants.ts
```
`visitCharge: 200,` dikhna chahiye ✅

---

## STEP 5 — GitHub pe push (2 min)

```cmd
git add .
```

```cmd
git commit -m "GST invoice page, print to PDF"
```

### 🛑 Safety check 1 — sahi repo?

```cmd
git remote -v
```

Dikhna chahiye:
```
origin  https://github.com/sudhanshuc613/Ro-project.git (fetch)
origin  https://github.com/sudhanshuc613/Ro-project.git (push)
```

**Agar koi doosra naam dikhe — RUKO, mujhe batao.** Aapka doosra Vercel project hai, usme galti se push nahi karna.

### 🛑 Safety check 2 — `.env` leak nahi ho raha?

```cmd
git status
```

Is list mein `.env` **nahi** hona chahiye. Agar dikh raha hai:
```cmd
git rm --cached .env
git commit -m "remove env"
```

### Push karo

```cmd
git push --force
```

> Username poochhega → `sudhanshuc613`
> Password poochhega → **GitHub password nahi chalega.** Personal Access Token chahiye.
> Token nahi hai to: github.com → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → `repo` tick karo → copy karke paste karo.

---

## STEP 6 — Vercel khud build karega (4 min)

1. `vercel.com` kholo
2. **Choudhary** team → `ro-project` project
3. **Deployments** tab
4. Sabse upar wali entry: **Building** (yellow dot) → **Ready** (green dot)

### ✅ Ready ho gaya
Aage badho.

### ❌ Failed ho gaya
**Ghabrao mat — live site nahi tooti.** Vercel purana working version chalata rehta hai.

Failed deployment pe click → **Build Logs** → jo laal error dikhe uska screenshot mujhe bhejo.

---

## STEP 7 — Neon database SQL (1 min) ⚠️ ZAROORI

Pehle aapko ye error aaya tha:
```
ERROR: null value in column "updated_at" of relation "site_settings"
violates not-null constraint (SQLSTATE 23502)
```

Ye **theek kar diya gaya SQL** hai. Isme `updated_at = now()` add hai:

1. `console.neon.tech` kholo
2. Apna project → **SQL Editor**
3. Jo likha ho wo saaf karo (`Ctrl+A` → `Delete`)
4. Ye **poora** paste karo:

```sql
INSERT INTO site_settings (key, value, description, updated_at) VALUES
('contact', '{"primaryPhone":"8969821440","secondaryPhone":"9661288308","tertiaryPhone":"9534037266","whatsapp":"918969821440","email":"support@rokadoctor.in","hours":"Mon-Sun 08:00-21:00"}', 'Public contact channels', now()),
('service', '{"visitCharge":200,"emergencyCharge":399,"responseTime":"90 minutes","warrantyDays":30,"city":"Patna","state":"Bihar"}', 'Local service config', now()),
('banner', '{"heroHeadline":"RO Service in Patna","heroSubline":"Visit Charge Only 200","heroImage":"/banners/service-tech.png","announcementText":"RO Service in Patna - Visit charge only Rs.200 - Same-day visit","announcementActive":true}', 'Homepage banner', now())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = now();

UPDATE pincodes SET visit_charge = 200, updated_at = now()
  WHERE is_service_available = true AND city = 'Patna';

UPDATE pincodes SET visit_charge = 250, updated_at = now()
  WHERE pincode IN ('801503','801505','801506','801105');

UPDATE seo_metadata SET
  meta_title = 'RO Service in Patna - Rs.200 Visit | Same-Day Repair',
  meta_description = 'Expert RO repair & installation across Patna at Rs.200 visit charge. All brands, 90-min response, 30-day warranty. Call 8969821440.',
  updated_at = now()
WHERE path = '/';
```

5. **Run** dabao

> **Kya badla:** har statement ke aakhir mein `updated_at = now()` hai. Pehle wo missing tha, isliye database ne reject kar diya tha.

### Verify

```sql
SELECT key, updated_at FROM site_settings;
```
3 rows dikhne chahiye: `contact`, `service`, `banner` ✅

```sql
SELECT visit_charge, count(*) FROM pincodes
WHERE is_service_available = true GROUP BY visit_charge;
```
`200` aur `250` dono dikhne chahiye ✅

---

## STEP 8 — CRON_SECRET add karo (1 min) ⚠️

Iske bina AMC reminders aur abandoned-cart emails nahi chalenge.

1. Vercel → `ro-project` → **Settings** tab
2. Left menu → **Environment Variables**
3. **Add New**:

| Name | Value |
|---|---|
| `CRON_SECRET` | `aqn_cron_2026_xk9m2p` |

4. Environments: **Production, Preview, Development** — teeno tick karo
5. **Save**

---

## STEP 9 — Redeploy (1 min)

Environment variable add karne ke baad **redeploy zaroori hai** — warna naya variable use nahi hoga.

1. Vercel → **Deployments** tab
2. Sabse upar wali (Ready wali) → right side **⋯** (teen dot) → **Redeploy**
3. "Use existing Build Cache" ka tick **hata do**
4. **Redeploy** dabao → 3-4 min

---

## STEP 10 — Test karo (3 min)

`https://ro-project.vercel.app` kholo.

### Pehle basic check

| Kahan | Kya dikhna chahiye |
|---|---|
| Homepage top | "Visit Charge Only ₹200" |
| Price anchor | "Others charge ₹299–₹399" |
| Scroll neeche | 6 Hindi problem cards (पानी नहीं आ रहा…) |
| Aur neeche | 3 asli photos |
| Area section | 16 areas + TDS levels |
| Sabse neeche | Shop strip |

### Naya invoice test — ye sabse important hai aaj

```
1. /register  → account banao (apna phone number)
2. /products  → koi bhi product → Add to Cart
3. /cart      → Checkout
4. Address bharo → Review → Payment → COD chuno → Place Order
5. /account/orders kholo
6. "📄 Invoice" button dabao
```

Dikhna chahiye:
- AquaNexa Water Solutions ka header + aapka Kankarbagh address
- Bill To / Ship To
- Item table with **CGST + SGST** (kyunki Bihar mein ho)
- Grand Total
- "Two Thousand Five Hundred Rupees Only" type line
- **🖨️ Print / Save as PDF** button

Print button dabao → Chrome ka print dialog khulega → Destination mein **"Save as PDF"** chuno → file save ho jayegi.

### Tracking test (login ke bina)

```
1. Homepage → booking form bharo
2. Ticket number milega: SRV-2026-00001
3. "📍 Track this request live" dabao
```

Ab **logout karke ya incognito window mein** wahi link kholo:
```
https://ro-project.vercel.app/track/SRV-2026-00001
```
Login screen **nahi** aani chahiye. Direct status dikhna chahiye ✅

### 🛑 Aur ye zaroor

**rokadoctor.in** kholo — purani PHP site chal rahi hai na? ✅
Chalni chahiye. DNS ko haath nahi lagaya gaya.

---

# Checklist

- [ ] `taskkill /F /IM node.exe`
- [ ] `copy .env ..\env-backup.txt`
- [ ] Zip extract — **Replace** mode
- [ ] `type .env | findstr DATABASE_URL` → dikha?
- [ ] `dir src\app\account\orders` → `[orderNumber]` folder
- [ ] `git add .` + `git commit`
- [ ] 🛑 `git remote -v` → sudhanshuc613/Ro-project
- [ ] 🛑 `git status` → `.env` nahi
- [ ] `git push --force`
- [ ] Vercel → **Ready**
- [ ] ⚠️ Neon SQL (`updated_at = now()` wala)
- [ ] ⚠️ `CRON_SECRET` add
- [ ] Redeploy (cache off)
- [ ] Invoice test
- [ ] Tracking test incognito mein
- [ ] rokadoctor.in chal rahi hai

---

# Troubleshooting

### ❌ `EPERM: operation not permitted` (extract ke waqt)
```cmd
taskkill /F /IM node.exe
rmdir /s /q node_modules\.prisma
```
Phir dobara extract.

### ❌ `! [rejected] main -> main (non-fast-forward)`
```cmd
git push --force origin main
```

### ❌ Site pe abhi bhi purana ₹100 / purana title
STEP 7 ka SQL nahi chala. Chalao → phir STEP 9 redeploy.

### ❌ Invoice pe 404
STEP 3 mein "Skip" chun liya tha. Dobara extract karo — **Replace** chuno.

### ❌ Invoice pe "Page not found" jabki order exist karta hai
Aap us order ke owner nahi ho. Jis account se order kiya tha usi se login karo.

### ❌ Build fail — `Module not found: @/components/account/PrintButton`
Zip poori extract nahi hui. Check:
```cmd
dir src\components\account
```
`PrintButton.tsx` aur `SignOutButton.tsx` dono hone chahiye.

---

# ⚠️ Ab bhi jo pending hai (honest list)

| # | Kya | Kyun matter karta hai |
|---|---|---|
| 1 | **Google Business Profile nahi bana** | Local ranking ka **32%** yahi hai. Sabse bada gap. Competitor ke 5,117 reviews hain, aapke 0 |
| 2 | **Razorpay mock mode mein hai** | Checkout chalta hai par **asli paisa nahi aata**. Keys chahiye |
| 3 | **Admin password `ChangeMe@123` hai** | Guide files mein publicly likha hai. Badlo |
| 4 | **Vercel Hobby plan** | Payment gateway = commercial use. Hobby pe allowed nahi. Pro ₹1,700/mo ya VPS ₹700/mo |
| 5 | **AI-generated photos** | `public/service/*.jpg` — Google Business Profile suspend kar sakta hai. Apne asli kaam ki photo daalo (same filename) |
| 6 | **Domain connect nahi hua** | `rokadoctor.in` abhi purani PHP site pe hai |

**Priority order (mera suggestion):** 1 → 5 → 3 → 2 → 4 → 6

Google Business Profile pehle isliye ki wo **free** hai, **aaj** ban sakta hai, aur ranking ka sabse bada hissa hai. Website perfect ho aur GBP na ho to Patna mein koi nahi dhundhega.
