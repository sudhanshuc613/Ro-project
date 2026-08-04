# Ab Upload Karo — Step by Step

**Total: ~12 minute**

---

## ⚠️ Pehle 2 baatein

### 1. Delete MAT karna — overwrite karna

Zip mein ye 2 cheezein **nahi** hain (jaan-boojh kar):

| Cheez | Kyun nahi | Delete kiya to |
|---|---|---|
| `.env` | Secrets zip mein nahi daalte | Neon string udd jayegi |
| `node_modules` | 400 MB | `npm install` dobara, 10 min |

**Overwrite karne se dono bach jayenge.**

### 2. Is baar database change NAHI chahiye

Maine check kiya — **koi naya table nahi bana**. Sirf ek chhota seed update hai
(teesra phone number). Wo Neon SQL Editor se 1 line mein ho jayega.

---

# STEP 1 — Zip replace (3 min)

### 1.1 Node band karo

```cmd
taskkill /F /IM node.exe
```

### 1.2 `.env` backup

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
copy .env ..\env-backup.txt
```

### 1.3 Extract — REPLACE mode

1. Naya `aquanexa-project.zip` download karo
2. Right-click → **Extract All**
3. Destination bilkul yahi:
   ```
   C:\Users\SUDHA\Downloads\ro-Project\Ro-project
   ```
4. Windows poochhega → **"Replace the files in the destination"** chuno

### 1.4 Verify (30 second)

```cmd
type .env | findstr DATABASE_URL
```
Neon string dikhni chahiye. Nahi dikhi to:
```cmd
copy ..\env-backup.txt .env
```

Nayi files aayin?
```cmd
dir src\components\admin
```
Ye 3 nayi dikhni chahiye: `ProductForm.tsx`, `SeoEditor.tsx`, `SettingsForm.tsx`

```cmd
dir src\server\services
```
`amc.service.ts` dikhni chahiye.

---

# STEP 2 — Push (2 min)

```cmd
git add .
```

```cmd
git commit -m "AMC engine, product CRUD form, SEO manager, customer login"
```

### 🛑 Safety check

```cmd
git remote -v
```

Dikhna chahiye:
```
origin  https://github.com/sudhanshuc613/Ro-project.git (fetch)
origin  https://github.com/sudhanshuc613/Ro-project.git (push)
```

### 🛑 `.env` leak check

```cmd
git status
```
`.env` list mein **nahi** hona chahiye.

### Push

```cmd
git push
```

---

# STEP 3 — Vercel build (4 min)

vercel.com → `ro-project` → **Deployments** → Building → Ready

> Build fail ho to live site nahi tootegi — Vercel purana version chalata rahega.
> Failed build pe click → **Build Logs** → screenshot bhejna.

---

# STEP 4 — Database mein 1 line (1 min)

Teesra phone number (`9534037266`) DB mein daalna hai.

1. console.neon.tech → `aquanexa` → **SQL Editor**
2. Jo likha hai saaf karo (`Ctrl+A` → `Delete`)
3. Ye paste karo:

```sql
INSERT INTO site_settings (key, value, description) VALUES
('contact', '{"primaryPhone":"8969821440","secondaryPhone":"9661288308","tertiaryPhone":"9534037266","whatsapp":"918969821440","email":"support@rokadoctor.in","hours":"Mon–Sun 08:00–21:00"}', 'Public contact channels'),
('service', '{"visitCharge":100,"emergencyCharge":299,"responseTime":"90 minutes","warrantyDays":30,"city":"Patna","state":"Bihar"}', 'Local service config'),
('banner', '{"heroHeadline":"RO Service in Patna","heroSubline":"Visit Charge Only ₹100","heroImage":"/banners/service-tech.png","announcementText":"RO Service in Patna — Visit charge only ₹100 · Same-day visit","announcementActive":true}', 'Homepage banner')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

4. **Run** → `INSERT 0 3` aana chahiye

> Ye safe hai — `ON CONFLICT DO UPDATE` hai, purana data corrupt nahi hoga.

---

# STEP 5 — Environment variable add karo (1 min)

AMC reminder cron ke liye ek secret chahiye.

1. Vercel → `ro-project` → **Settings** → **Environment Variables**
2. **Add New**:

| Name | Value |
|---|---|
| `CRON_SECRET` | koi bhi lamba random text, jaise `aqn_cron_2026_xk9m2p` |

3. **Save**
4. **Deployments** → latest → **⋯** → **Redeploy**

> Ye nahi kiya to cron 401 dega aur AMC reminders nahi jayenge.

---

# STEP 6 — Test karo (3 min)

Apna Vercel URL kholo:

## Customer side

| URL | Kya check karo |
|---|---|
| `/register` | Account banao, apna number daalo |
| `/login` | Wahi number + password se login |
| `/account` | Ab **real dashboard** dikhega (placeholder nahi) |
| `/amc-plans` | "Choose Gold" dabao → **form khulega** (WhatsApp nahi) |

**AMC test:** form bharo → submit → "Gold AMC Activated" + first visit date dikhna chahiye.

## Admin side

`/admin/login` → `8969821440` / `ChangeMe@123`

| Page | Kya check karo |
|---|---|
| `/admin/products/new` | 5 tabs — Basic, Pricing, Images, Specs, SEO |
| `/admin/amc` | Jo AMC abhi banaya wo dikhega + "Mark visit done" button |
| `/admin/seo` | Har page ka meta edit, live Google preview |
| `/admin/settings` | Phone numbers, visit charge — **yahan se badal sakte ho** |

**Product test:** `/admin/products/new` → Basic tab bharo → Pricing → Images mein
`/products/ro-domestic.png` daalo (2 baar) → Status **Active** → Create.

Phir `/products` pe jaake dekho, naya product dikhna chahiye.

## 🛑 Aur ye zaroor

**rokadoctor.in** kholo — purani PHP site chal rahi hai? ✅
Chalni chahiye, DNS ko haath nahi lagaya.

---

# Password badlo (zaroori)

Admin password abhi `ChangeMe@123` hai — public guide mein likha hai.

Neon SQL Editor mein:
```sql
-- Pehle apna naya password bcrypt hash karo:
-- https://bcrypt-generator.com pe jaake rounds=12 rakho
UPDATE users SET password_hash = 'YAHAN_NAYA_HASH'
WHERE phone = '8969821440';
```

Ya mujhe bolo, main hash bana ke de dunga.

---

# Checklist

- [ ] `taskkill /F /IM node.exe`
- [ ] `.env` backup
- [ ] Zip extract — **Replace** mode
- [ ] `type .env | findstr DATABASE_URL` → Neon string
- [ ] `dir src\components\admin` → 3 nayi files
- [ ] `git add .` + `commit`
- [ ] `git remote -v` 🛑
- [ ] `git status` → `.env` nahi
- [ ] `git push`
- [ ] Vercel → Ready
- [ ] Neon SQL → 3 settings insert ⚠️
- [ ] Vercel → `CRON_SECRET` env var ⚠️
- [ ] Redeploy
- [ ] `/register` + `/amc-plans` test
- [ ] `/admin/products/new` test
- [ ] rokadoctor.in → purani site chal rahi hai?
- [ ] Admin password badlo

---

# Troubleshooting

### ❌ `EPERM: operation not permitted`
```cmd
taskkill /F /IM node.exe
rmdir /s /q node_modules\.prisma
```
Phir dobara try. Ya OneDrive pause karo.

### ❌ Vercel build fail
Build Logs ka screenshot bhejo.

### ❌ AMC form submit pe error
Neon SQL wala step (Step 4) skip ho gaya. Chalao phir Redeploy.

### ❌ `/admin/settings` khaali dikh raha
Same — Step 4 chalao.

### ❌ Product create pe "Add at least 2 images"
Images tab mein dono slots mein path daalo, jaise `/products/ro-domestic.png`
