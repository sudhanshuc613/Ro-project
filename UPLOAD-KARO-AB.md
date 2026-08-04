# Ab Upload Karo — Step by Step

**Total: ~12 minute**

> ✅ Aapke ₹200 wale changes is zip mein **already daal diye hain**.
> Merge conflict ka jhanjhat khatam — bas force push karna hai.

---

## Is update mein kya hai

### Aapke changes (GitHub se liye)
| Kya | Ab |
|---|---|
| Visit charge | **₹200** (poori site pe — 34 jagah) |
| Danapur/Khagaul | **₹250** (base se upar) |
| Filter change | ₹450 – ₹600 |
| Booster pump | ₹1,500 – ₹2,000 |
| New installation | ₹350 – ₹600 |

### Naye features
- AMC engine (purchase form + auto-schedule + WhatsApp reminders + admin panel)
- Product add/edit form (5 tabs)
- SEO Manager (har page ka meta edit)
- Site Settings (phone/charge/banner — code chhue bina)
- Customer login/register + real account dashboard

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
3. Destination:
   ```
   C:\Users\SUDHA\Downloads\ro-Project\Ro-project
   ```
4. **"Replace the files in the destination"** chuno

### 1.4 Verify
```cmd
type .env | findstr DATABASE_URL
```
Neon string dikhni chahiye. Nahi to: `copy ..\env-backup.txt .env`

```cmd
findstr "visitCharge" src\lib\constants.ts
```
`visitCharge: 200,` dikhna chahiye ✅

---

# STEP 2 — Push (2 min)

```cmd
git add .
```
```cmd
git commit -m "Visit charge Rs200, AMC engine, product CRUD, SEO manager"
```

### 🛑 Safety check
```cmd
git remote -v
```
`sudhanshuc613/Ro-project.git` dikhna chahiye.

```cmd
git status
```
`.env` **nahi** hona chahiye.

### Push — force lagega

```cmd
git push --force
```

> **Force kyun?** GitHub pe aapke 2 purane commits hain (`Update constants.ts`,
> `Update PriceComparison.tsx`). Wo changes maine **already is zip mein daal diye**
> hain — ₹200, ₹450-600, ₹1500-2000, ₹350-600 sab. Isliye unhe overwrite karna
> safe hai, kuch loss nahi hoga.
>
> Verify karna ho to pehle `findstr "450" src\components\home\PriceComparison.tsx`
> chala lo — `₹450 – ₹600` dikhega.

---

# STEP 3 — Vercel build (4 min)

vercel.com → `ro-project` → **Deployments** → Building → Ready

> Build fail ho to live site nahi tootegi. Failed build → **Build Logs** → screenshot bhejna.

---

# STEP 4 — Database update (1 min) ⚠️

Neon SQL Editor mein ye chalao (₹200 ke saath):

```sql
INSERT INTO site_settings (key, value, description) VALUES
('contact', '{"primaryPhone":"8969821440","secondaryPhone":"9661288308","tertiaryPhone":"9534037266","whatsapp":"918969821440","email":"support@rokadoctor.in","hours":"Mon–Sun 08:00–21:00"}', 'Public contact channels'),
('service', '{"visitCharge":200,"emergencyCharge":399,"responseTime":"90 minutes","warrantyDays":30,"city":"Patna","state":"Bihar"}', 'Local service config'),
('banner', '{"heroHeadline":"RO Service in Patna","heroSubline":"Visit Charge Only ₹200","heroImage":"/banners/service-tech.png","announcementText":"RO Service in Patna — Visit charge only ₹200 · Same-day visit","announcementActive":true}', 'Homepage banner')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

UPDATE pincodes SET visit_charge = 200 WHERE is_service_available = true AND city = 'Patna';
UPDATE pincodes SET visit_charge = 250 WHERE pincode IN ('801503','801505','801506','801105');

UPDATE seo_metadata SET
  meta_title = 'RO Service in Patna — ₹200 Visit | Same-Day Repair',
  meta_description = 'Expert RO repair & installation across Patna at ₹200 visit charge — others charge ₹299+. All brands, 90-min response, 30-day warranty. Call 8969821440.'
WHERE path = '/';
```

**Run** dabao.

### Verify
```sql
SELECT visit_charge, count(*) FROM pincodes
WHERE is_service_available = true GROUP BY visit_charge;
```
₹200 aur ₹250 dikhne chahiye.

---

# STEP 5 — CRON_SECRET add karo (1 min) ⚠️

1. Vercel → `ro-project` → **Settings** → **Environment Variables**
2. **Add New**:

| Name | Value |
|---|---|
| `CRON_SECRET` | `aqn_cron_2026_xk9m2p` (ya koi bhi random) |

3. Save → **Deployments** → latest → **⋯** → **Redeploy**

---

# STEP 6 — Test (3 min)

## ₹200 check
| URL | Kya dikhna chahiye |
|---|---|
| `/` | "Visit Charge Only ₹200" |
| `/service-patna/danapur` | ₹200 (Danapur pincode pe ₹250) |
| `/amc-plans` | ₹200 mentions |

Kahin bhi ₹200 dikhe → Step 4 skip hua hai.

## Naye features
| URL | Test |
|---|---|
| `/register` | Account banao |
| `/account` | Real dashboard (placeholder nahi) |
| `/amc-plans` | "Choose Gold" → **form khulega** |
| `/admin/products/new` | 5 tabs wala form |
| `/admin/amc` | AMC contracts + "Mark visit done" |
| `/admin/settings` | Phone/charge yahan se badlo |

## 🛑 Aur ye zaroor
**rokadoctor.in** — purani PHP site chal rahi hai? ✅

---

# ⚠️ Aage se: daam kaise badlein

Ab **code chhune ki zaroorat nahi**. Admin panel se:

```
/admin/settings → Visit Charge field → badlo → Save
```

Turant poori site pe badal jayega. `PriceComparison` table abhi code mein hai —
wo GitHub se badalni padegi (`src/components/home/PriceComparison.tsx`).

---

# Checklist

- [ ] `taskkill /F /IM node.exe`
- [ ] `.env` backup
- [ ] Zip extract — **Replace** mode
- [ ] `findstr "visitCharge" src\lib\constants.ts` → 200
- [ ] `git add .` + `commit`
- [ ] `git remote -v` 🛑
- [ ] `git status` → `.env` nahi
- [ ] `git push --force`
- [ ] Vercel → Ready
- [ ] Neon SQL chalao ⚠️
- [ ] `CRON_SECRET` add ⚠️
- [ ] Redeploy
- [ ] ₹200 dikh raha hai?
- [ ] rokadoctor.in chal rahi hai?
- [ ] Admin password badlo

---

# Troubleshooting

### ❌ `EPERM: operation not permitted`
```cmd
taskkill /F /IM node.exe
rmdir /s /q node_modules\.prisma
```

### ❌ Site pe abhi bhi ₹200
Step 4 ka SQL nahi chala. Chalao → Vercel Redeploy.

### ❌ AMC form submit pe error
Step 4 skip hua. `site_settings` table khaali hai.

### ❌ Push phir bhi reject
```cmd
git push --force origin main
```
