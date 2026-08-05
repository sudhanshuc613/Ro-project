# rokadoctor.in pe Nayi Site Live Karo

**Purani site hategi, nayi lagegi. Domain wahi.**
**Time: ~30 minute + 30 minute DNS ka wait**

---

## Pehle ek cheez theek kar di

Aapki purani site pe likha tha `Basic Service ₹299`. Nayi site pe likha tha *"others charge ₹299–399"* — matlab **aapke hi purane rate ko competitor ka rate** bata rahi thi.

Ab theek kar diya — **₹350–399** kar diya (Mr Service Expert aur RO Care India dono ₹399 lete hain, ye asli aankda hai).

Poori site pe update ho gaya: hero, price table, area FAQs, homepage meta, admin hint.

---

# Ab process — 8 step

## STEP 1 — Purani site ka backup (5 min) 🛡️

**Ye skip mat karna.** 5 minute ka kaam, par galat kuch ho gaya to yahi bachayega.

1. Hosting panel (Hostinger/GoDaddy/cPanel) → **File Manager**
2. `public_html` folder pe right-click → **Compress** → ZIP
3. Download karo, laptop pe rakho

Database ho to: **phpMyAdmin** → database select → **Export** → Go

---

## STEP 2 — Purana A record note karo 📝

**Ye bhi skip mat karna. Rollback ke liye zaroori hai.**

1. Hosting panel → **DNS Zone Editor** (naam ye ho sakta hai: "DNS / Nameservers", "Manage DNS", "Zone Editor")
2. `rokadoctor.in` ka **A record** dhundo
3. Uska IP notepad mein likho:

```
Type: A   Name: @   Value: 103.___.___.___    ← YE LIKH LO
```

Rollback karna pada to yahi IP wapas daalna hoga.

---

## STEP 3 — Vercel mein domain add karo

1. `vercel.com` → **Choudhary** team → `ro-project`
2. **Settings** → **Domains**
3. Box mein: `rokadoctor.in` → **Add**
4. Phir: `www.rokadoctor.in` → **Add**

Vercel do record dikhayega, aise:

```
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
```

> ⚠️ **Jo screen pe dikhe wahi copy karo.** Naye projects ko alag IP milta hai (jaise `216.198.79.1`). Mera likha hua andaza mat maano.

---

## STEP 4 — DNS badlo 🔴 (yahan se switch hoga)

Hosting panel → DNS Zone Editor.

### 4a. A record EDIT karo (delete nahi — edit)

| | Purana | Naya |
|---|---|---|
| Type | A | A |
| Name | @ | @ |
| Value | 103.xxx.xxx.xxx | **Vercel wala IP** |
| TTL | 3600 | **300** |

### 4b. www ka record

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `www` |
| Value | Vercel se copy kiya (`cname.vercel-dns.com`) |
| TTL | 300 |

> Agar `www` ka pehle se **A record** hai → **delete** karo, phir CNAME banao. Ek naam pe A aur CNAME dono nahi ho sakte — traffic random fail hoga.

### 4c. 🛑 Ye records MAT chhedna

| Record | Chheda to kya hoga |
|---|---|
| **MX** | `support@rokadoctor.in` email **band** |
| **TXT** (SPF/DKIM) | Email spam folder mein |
| **AAAA** | Agar hai to **delete** — Vercel IPv6 support nahi karta, SSL atak jayega |

**Save**

---

## STEP 5 — Env vars update karo ⚠️

**Ye sabse zyada log bhoolte hain, aur phir login band ho jaata hai.**

Vercel → Settings → **Environment Variables**:

| Name | Value |
|---|---|
| `NEXTAUTH_URL` | `https://rokadoctor.in` |
| `NEXT_PUBLIC_SITE_URL` | `https://rokadoctor.in` |

> 🚨 `NEXTAUTH_URL` exactly aisa hi — **aakhir mein slash nahi**, **www nahi**. Galat hua to har login chupchaap fail hoga, bina koi error dikhaye.

Teeno environment (Production/Preview/Development) tick karo → **Save**

---

## STEP 6 — Redeploy

Vercel → **Deployments** → sabse upar wali → **⋯** → **Redeploy**

"Use existing Build Cache" ka tick **hatao** → Redeploy

> Bina redeploy naye env vars use nahi honge.

---

## STEP 7 — Wait (5–30 min)

Vercel → Settings → Domains:

```
rokadoctor.in        Invalid Configuration    ← abhi wait
rokadoctor.in        Valid Configuration ✅   ← ho gaya
```

Valid hote hi Vercel khud SSL certificate bana dega (Let's Encrypt, free).

---

## STEP 8 — Neon SQL (1 min) ⚠️

Database mein homepage ka purana SEO description pada hai. Update karo:

`console.neon.tech` → SQL Editor:

```sql
UPDATE seo_metadata SET
  meta_title = 'RO Service in Patna - Rs.200 Visit | Same-Day Repair',
  meta_description = 'Expert RO repair & installation across Patna at Rs.200 visit charge. All brands, 90-min response, 30-day warranty. Call 8969821440.',
  updated_at = now()
WHERE path = '/';
```

**Run** dabao.

---

# Test karo

Incognito window mein `https://rokadoctor.in`:

| Test | Dekhna kya hai |
|---|---|
| Homepage | Nayi site — "Now in Patna", ₹200 |
| 🔒 | Taala dikhna chahiye |
| `www.rokadoctor.in` | Redirect ho raha hai |
| Price table | **₹350–399** dikhe (₹299 nahi) |
| `/service-patna/kankarbagh` | Area page |
| `/service-patna/brand/aquafresh` | Brand page |
| **`/register` → `/login`** | ⚠️ **Sabse important** |
| `/products` → cart → checkout | COD order ban raha hai |
| `/admin` | Login, order dikhe, Manage se status badle |
| **Email** | `support@rokadoctor.in` pe mail bhejo — pahunche? |
| Mobile | Phone se poori site |

**Login fail ho** to → STEP 5 ka `NEXTAUTH_URL` galat hai.

---

# Agle din — Google ko batao

1. `search.google.com/search-console`
2. Property add: `rokadoctor.in`
3. Verify → **DNS TXT method** chuno (HTML file method Vercel pe kaam nahi karega)
4. **Sitemaps** → `sitemap.xml` → Submit

Nayi site pe **84 pages** hain (16 area + 21 brand + products). Google ko crawl karne mein 1-2 hafta lagega.

---

# 🔴 Rollback (agar kuch bada toot jaye)

1. DNS panel kholo
2. `A` record wapas purane IP pe (STEP 2 wala)
3. `www` CNAME delete
4. 5-30 min mein purani site wapas

**Isiliye STEP 2 zaroori tha.**

---

# Common problems

### ❌ 30 min baad bhi "Invalid Configuration"
- Purana A record edit nahi hua — **do A record** hain
- **AAAA record** hai → delete karo
- Cloudflare use karte ho → **orange cloud off** (grey = "DNS only")

### ❌ Site khul rahi hai par **login nahi ho raha**
`NEXTAUTH_URL` galat. Exactly `https://rokadoctor.in` — slash nahi, www nahi. Fix karke **Redeploy**.

### ❌ Email band ho gaya
MX record delete ho gaya. Hosting support se purana MX poochho, wapas add karo.

### ❌ SSL nahi ban raha
- AAAA record → delete
- CAA record kisi aur CA ko allow kar raha → `letsencrypt.org` add karo ya CAA delete

### ❌ Purani site abhi bhi dikh rahi
Browser cache. Incognito try karo. Ya `dnschecker.org` pe domain daal ke dekho DNS phaila ya nahi.

---

# Checklist

- [ ] Purani site ka backup ZIP
- [ ] 📝 **Purana A record IP note kiya**
- [ ] Vercel mein `rokadoctor.in` + `www.rokadoctor.in`
- [ ] A record → Vercel IP
- [ ] www → CNAME
- [ ] 🛑 MX/TXT nahi chhede
- [ ] AAAA delete (agar tha)
- [ ] `NEXTAUTH_URL` = `https://rokadoctor.in`
- [ ] `NEXT_PUBLIC_SITE_URL` = same
- [ ] **Redeploy** (cache off)
- [ ] Valid Configuration ✅
- [ ] Neon SQL chalaya
- [ ] Site khul rahi hai + 🔒
- [ ] **Login test** ⚠️
- [ ] Order test
- [ ] **Email test**
- [ ] Search Console

---

# 🔴 Live jaane se pehle — 3 cheezein

| # | Kya | Kyun |
|---|---|---|
| 1 | **Admin password badlo** | `ChangeMe@123` guide files mein publicly likha hai. Live hote hi koi bhi aapka admin panel khol sakta hai |
| 2 | **Payment on karo** | `/admin/settings` → UPI ID daalo. Warna sirf COD chalega |
| 3 | **Google Business Profile** | Local ranking ka 32%. Domain live hote hi bana lo — free hai |

Point 1 sabse urgent hai.

### Password badalne ka tarika

`/admin/settings` mein abhi option nahi hai, to Neon SQL se:

```sql
-- pehle naya bcrypt hash banao (Google: "bcrypt generator", rounds = 12)
UPDATE users SET password_hash = 'YAHAN_NAYA_HASH_PASTE_KARO'
WHERE phone = '8969821440';
```

Ya mujhe bolo — main hash bana ke de dunga.

---

## Purani hosting

**1 mahina extra rakho.** ₹200-300 ka kharcha hai, par rollback ka option rehta hai. Ek mahine mein sab theek chala to cancel kar dena.
