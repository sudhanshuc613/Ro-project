# Upload Karo — Step by Step

Total: **~15 minute**

---

# Is update mein kya hai

| # | Kya | Detail |
|---|---|---|
| 1 | 🆕 **Image upload — computer se** | Aapki shikayat sahi thi. Ab drag-drop, file picker, phone camera, Ctrl+V — sab chalta hai |
| 2 | 🆕 **Premium UI** | Poora colour system badla — deep navy + refined teal + gold accent + warm off-white |
| 3 | 🆕 **Media Library page** | `/admin/media` — saari photos ek jagah, copy link, delete |
| 4 | 🆕 **GST Invoice** | `/account/orders/.../invoice` — pehle 404 tha |
| 5 | 🔧 **`updated_at` error permanent fix** | Wo Neon wala error dobara kabhi nahi aayega |

---

# Part 1 — Image upload (aapki shikayat)

## Aapki baat bilkul sahi thi

Purane form mein sirf **URL paste karne ka box** tha. Matlab aapko GitHub pe file
daalni padti, commit karna padta, redeploy ka wait karna padta, phir path copy karke
paste karna padta. **Ye developer ka tareeka hai, dukaandaar ka nahi.** Meri galti.

## Ab kya hai

**`/admin/media`** — naya page, sidebar mein "🖼️ Images" ke naam se.
Product form ke **Images tab** mein bhi wahi uploader lagaya hai.

Chaar tareeke se photo daal sakte ho:

| Tareeka | Kaise |
|---|---|
| **Drag-drop** | Desktop se photo utha ke box mein chhod do |
| **Click** | Box pe click → file chuno |
| **📷 Camera** | Phone pe button dikhta hai — seedha camera khulta hai |
| **Ctrl+V** | Screenshot copy karke paste kar do |

## Ek zaroori baat — Vercel ki technical majboori

Vercel pe **`public/` folder mein likhna possible hi nahi hai**. Next.js team ne khud
likha hai: *"you cannot dynamically add more images to the public folder and have them
accessible to the end user"*. File save hoti dikhti hai, phir 404 de deti hai.

Isliye maine do raste banaye, code khud chunta hai:

| Situation | Kya hota hai |
|---|---|
| **Abhi (kuch setup nahi)** | Photo database mein jaati hai, `/api/media/<id>` se serve hoti hai. **Aaj se kaam karta hai** |
| **Baad mein (Blob token add karo)** | Nayi photos CDN pe jaati hain. Purani chalti rehti hain, kuch nahi tootta |

Blob chahiye to: Vercel → Storage → Create → Blob → Connect. Bas. Code mein kuch nahi badalna.

## Compression — aur aapki purani shikayat ka permanent hal

Pichli baar maine bina pooche images chhoti kar di thi. **Ab aisa nahi hoga.**

Uploader mein ek **checkbox** hai — *"Make web-ready (recommended)"*:

| Checkbox | Kya hota hai | Test result |
|---|---|---|
| ✅ On (default) | 1600px + WebP | **1.64 MB → 111 KB (94% kam)** |
| ⬜ **Off** | Kuch nahi chhedta | **1716569 bytes → 1716569 bytes, 4000×3000 as-is** |

Off wala maine byte-by-byte verify kiya — **ek bhi byte nahi badla**. Faisla aapka hai, code ka nahi.

Aur upload ke baad screen pe saaf likha aata hai: `4.2 MB → 210 KB (95% smaller)`. Chhupa kuch nahi.

## Testing jo maine ki

| Test | Result |
|---|---|
| 1.64 MB / 4000×3000 photo upload | ✅ 111 KB, 1600×1200 |
| compress off | ✅ byte-for-byte identical |
| Image publicly load hoti hai | ✅ 200, `image/webp`, 1-year cache |
| Thumbnail | ✅ 15 KB |
| Bina login upload | ✅ 401 blocked |
| Customer account se upload | ✅ 401 blocked |
| **Nakli image** (text file ko .jpg naam diya) | ✅ *"That file is not a readable image"* |
| Wahi photo dobara | ✅ pehchan li, storage waste nahi |
| 3 photo ek saath | ✅ teeno |
| Upload → product banao → storefront | ✅ poora chain kaam karta hai |

---

# Part 2 — Premium UI

## Purane design ki dikkat

Purana colour tha `#06B6D4` — ye Tailwind ka **default cyan** hai. Har sasta
RO/plumber template yahi use karta hai. Dekhne wale ko turant lagta hai
"template se bani hai". Aur aapke business mein customer ko **ghar mein ajnabi
aadmi bulana hai** — wahan trust sabse pehle chahiye.

## Naya palette — aur har colour ka reason

| Colour | Hex | Kyun |
|---|---|---|
| **Navy** | `#0A1F3C` | Authority. Purane se gehra — white text pe 14:1 contrast, WCAG AA se kaafi upar |
| **Teal** | `#1590A5` | Paani ka feel, par neon nahi. Cyan se 35% desaturated — **premium palettes hamesha mute karte hain, saturate nahi** |
| **Gold** | `#C09A3E` | Sirf trust marks pe — rating, warranty seal. Poori site pe **sirf 2 jagah**. Kam use hi isse mehnga dikhata hai |
| **Sand** | `#FAF8F5` | Warm off-white. Pura `#FFF` sabse bada "template" signal hai |

## Colour ke alawa jo badla

1. **Layered depth** — hero mein ab 4 layers: gradient + radial light + teal glow + SVG grain. Grain isliye ki sasta Android screen pe bade gradient mein **stripes** dikhte hain
2. **Typography** — fluid sizing (screen ke saath badhta hai), tight `-0.022em` tracking bade headings pe. Default tracking hi amateur lagta hai
3. **Coloured shadows** — navy-tinted, kaala nahi. Kaala shadow light UI pe **gandagi** jaisa lagta hai
4. **Price anchor upgrade** — ab framed card with gold hairline. Wahi ek cheez hai jo job dilati hai, to weight bhi usi ko
5. **SVG icons** — TrustBar mein emoji hata diye. Emoji har phone pe alag dikhte hain (Samsung ≠ Apple ≠ Windows), isliye ek "designed set" kabhi nahi lag sakte
6. **Rings, not borders** — hard grey border spreadsheet jaisa lagta hai; hairline ring layered lagta hai
7. **Tabular numbers** — price update pe width nahi hilti

**Verify:** purane palette ke hex ab code mein **0 baar** hain. Poori site consistent.

---

# Part 3 — Upload steps

## ⚠️ Pehle padho

GitHub pe aapke direct edits hain, isliye `git push` reject hoga. **`git push --force`** karna hai.
Safe hai — aapke saare changes (₹200, ₹450-600, ₹1500-2000, ₹350-600) is code mein pehle se hain.

---

## STEP 1 — Node band karo

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

1. `aquanexa-project.zip` download karo
2. Right-click → **Extract All**
3. Destination: `C:\Users\SUDHA\Downloads\ro-Project\Ro-project`
4. **"Replace the files in the destination"** chuno

## STEP 4 — Verify

```cmd
type .env | findstr DATABASE_URL
```
Nahi dikha to → `copy ..\env-backup.txt .env`

```cmd
dir src\components\admin\ImageUploader.tsx
```
File milni chahiye ✅

```cmd
dir src\app\admin\(dashboard)\media
```
Folder milna chahiye ✅

## STEP 5 — ⚠️ npm install — IS BAAR ZAROORI

Naya package add hua hai (`@vercel/blob`). **Ye step skip mat karna warna build fail hoga.**

```cmd
npm install
```

## STEP 6 — Push

```cmd
git add .
```
```cmd
git commit -m "Image upload from computer, premium UI, GST invoice"
```

### 🛑 Safety check
```cmd
git remote -v
```
`sudhanshuc613/Ro-project.git` dikhna chahiye. Doosra naam dikhe to **RUKO**.

```cmd
git status
```
`.env` **nahi** hona chahiye.

```cmd
git push --force
```

## STEP 7 — Vercel build (4 min)

vercel.com → `ro-project` → Deployments → Building → **Ready**

Fail ho to Build Logs ka screenshot bhejo. Live site nahi tootegi.

## STEP 8 — ⚠️ Neon SQL — naya table

Naya `media_assets` table chahiye. Neon SQL Editor mein ye chalao:

```sql
CREATE TABLE IF NOT EXISTS media_assets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename     VARCHAR(255) NOT NULL,
    mime_type    VARCHAR(64)  NOT NULL,
    bytes        INTEGER      NOT NULL,
    width        INTEGER,
    height       INTEGER,
    data         BYTEA,
    thumb_data   BYTEA,
    external_url TEXT,
    alt_text     VARCHAR(200),
    folder       VARCHAR(40)  NOT NULL DEFAULT 'products',
    checksum     VARCHAR(64)  NOT NULL UNIQUE,
    uploaded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_folder ON media_assets(folder, created_at DESC);

-- Wo "updated_at null" error ka PERMANENT fix.
-- Prisma ka @updatedAt code mein chalta hai, database mein nahi — isliye
-- Neon console se raw SQL likhne pe reject hota tha. Ab nahi hoga.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','addresses','categories','products','pincodes','carts',
    'orders','service_requests','seo_metadata','site_settings'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name=t AND column_name='updated_at') THEN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN updated_at SET DEFAULT now()', t);
    END IF;
  END LOOP;
END $$;

-- Settings (ab updated_at ke bina bhi chal jayega)
INSERT INTO site_settings (key, value, description) VALUES
('contact', '{"primaryPhone":"8969821440","secondaryPhone":"9661288308","tertiaryPhone":"9534037266","whatsapp":"918969821440","email":"support@rokadoctor.in","hours":"Mon-Sun 08:00-21:00"}', 'Contact'),
('service', '{"visitCharge":200,"emergencyCharge":399,"responseTime":"90 minutes","warrantyDays":30,"city":"Patna","state":"Bihar"}', 'Service'),
('banner',  '{"heroHeadline":"RO Service in Patna","heroSubline":"Visit Charge Only 200","heroImage":"/banners/service-tech.png","announcementText":"RO Service in Patna - Visit charge only Rs.200 - Same-day visit","announcementActive":true}', 'Banner')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

UPDATE pincodes SET visit_charge = 200 WHERE is_service_available = true AND city = 'Patna';
UPDATE pincodes SET visit_charge = 250 WHERE pincode IN ('801503','801505','801506','801105');
```

**Run** dabao.

### Verify
```sql
SELECT count(*) FROM media_assets;
```
`0` aana chahiye (table ban gaya, khaali hai) ✅

## STEP 9 — CRON_SECRET (agar pehle nahi kiya)

Vercel → Settings → Environment Variables → Add New

| Name | Value |
|---|---|
| `CRON_SECRET` | `aqn_cron_2026_xk9m2p` |

## STEP 10 — Redeploy

Deployments → latest → **⋯** → **Redeploy** → "Use existing Build Cache" ka tick **hatao**

---

# STEP 11 — Test

## Image upload (sabse important)

```
1. /admin/media kholo
2. Koi photo drag karke box mein daalo
3. Progress bar chalega
4. Neeche result: "2.1 MB → 180 KB (91% smaller)"
5. Grid mein photo dikhegi
6. "Copy link" dabao
```

Phir product mein:
```
1. /admin/products/new
2. Basic tab → naam, SKU, category bharo
3. Pricing tab → MRP, selling price
4. Images tab → photo drag karo (2 chahiye)
5. Save
6. /products pe photo dikhni chahiye
```

## Compression off test

Uploader mein *"Make web-ready"* ka tick **hatao** → photo daalo →
result mein original aur final size **same** hone chahiye.

## Naya UI

| Kahan | Kya dikhega |
|---|---|
| Homepage hero | Gehra navy-teal gradient, gold "You save ₹99" strip |
| Price anchor | Do-column card — ₹299-399 kata hua vs ₹200 |
| TrustBar | Line icons (emoji nahi) |
| Photo ke neeche | Caption bar + gold warranty seal |
| Top strip | Gold hairline neeche |
| Scroll karo | Header blur ho jaata hai |

## Invoice

```
/account/orders → "📄 Invoice" → CGST+SGST + Print/PDF button
```

## 🛑 Aur ye zaroor
**rokadoctor.in** — purani PHP site chal rahi hai? ✅

---

# Checklist

- [ ] `taskkill /F /IM node.exe`
- [ ] `.env` backup
- [ ] Zip extract — **Replace**
- [ ] `dir src\components\admin\ImageUploader.tsx`
- [ ] ⚠️ **`npm install`** ← is baar zaroori
- [ ] `git add .` + commit
- [ ] 🛑 `git remote -v`
- [ ] 🛑 `git status` → `.env` nahi
- [ ] `git push --force`
- [ ] Vercel → Ready
- [ ] ⚠️ Neon SQL (media_assets table)
- [ ] `CRON_SECRET`
- [ ] Redeploy (cache off)
- [ ] `/admin/media` pe photo upload karke dekho
- [ ] rokadoctor.in chal rahi hai

---

# Troubleshooting

### ❌ Build fail: `Cannot find module '@vercel/blob'`
STEP 5 skip hua. `npm install` chalao, commit, push.

### ❌ `/admin/media` pe 500 error
STEP 8 ka SQL nahi chala. `media_assets` table nahi bana.

### ❌ Upload pe "Failed to fetch"
Photo 12 MB se badi hai. Chhoti karo ya phone pe quality kam karke kheencho.

### ❌ Photo upload ho gayi par product page pe nahi dikhti
Product **Save** nahi hua. Images tab ke baad Save dabana zaroori hai.

### ❌ `EPERM: operation not permitted`
```cmd
taskkill /F /IM node.exe
rmdir /s /q node_modules\.prisma
```

### ❌ Push reject
```cmd
git push --force origin main
```

---

# ⚠️ Ab bhi pending (sach)

| # | Kya | Kyun important |
|---|---|---|
| 1 | **Google Business Profile nahi bana** | Local ranking ka **32%**. Competitor ke 5,117 reviews, aapke 0. **Free hai, aaj ban sakta hai** |
| 2 | **AI photos** `public/service/*.jpg` | GBP suspend kar sakta hai. **Ab aap khud upload kar sakte ho** — `/admin/media` se |
| 3 | **Admin password `ChangeMe@123`** | Guide files mein publicly likha hai |
| 4 | **Razorpay mock mode** | Checkout chalta hai, asli paisa nahi aata |
| 5 | **Vercel Hobby** | Payment gateway = commercial use, Hobby pe allowed nahi |

Priority: **1 → 2 → 3**. Teeno free hain aur aaj ho sakte hain.

> Point 2 ab aasan ho gaya — apne kaam ki 3 photo kheencho, `/admin/media` pe daalo,
> "Copy link" karo, `/admin/settings` mein banner image badal do. GitHub ki zaroorat nahi.
