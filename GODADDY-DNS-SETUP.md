# GoDaddy DNS — Aapke Exact Values ke Saath

**Aapke Vercel screenshot se liye gaye values. Copy-paste kar sakte ho.**

---

## ⚠️ Pehle — mere purane guide ka IP galat tha

Maine guide mein `76.76.21.21` likha tha. **Aapke Vercel pe alag IP hai:**

```
A record  →  216.198.79.1
```

Vercel ne naya IP range diya hai. **Aapke screen waala hi sahi hai** — mera mat use karna.

---

## Aapke exact records

| Type | Name | Value |
|---|---|---|
| **A** | `@` | `216.198.79.1` |
| **CNAME** | `www` | `395086531ddfe15b.vercel-dns-017.com` |

> CNAME value ke **aakhir mein dot** ho sakta hai (`...vercel-dns-017.com.`) — GoDaddy khud handle kar lega, dot mat likhna.

---

# STEP 1 — GoDaddy mein DNS kholo

1. `godaddy.com` → login
2. Upar right mein apne naam pe click → **My Products**
3. **Domains** section mein `rokadoctor.in` dhundo
4. Uske aage **⋯** (teen dot) → **Edit DNS**

> Ya seedha: `dcc.godaddy.com/manage/rokadoctor.in/dns`

Ab **Records** ki list dikhegi.

---

# STEP 2 — 📝 Purana A record note karo

**Ye skip mat karna — rollback ke liye zaroori hai.**

List mein `A` type ka record dhundo jiska Name `@` hai:

```
Type: A    Name: @    Value: 103.___.___.___    ← YE NOTEPAD MEIN LIKHO
```

Ye aapki purani hosting ka IP hai. Kuch galat ho gaya to yahi wapas daalna hoga.

---

# STEP 3 — A record EDIT karo

**Delete nahi — edit karo.**

1. `A` record (Name = `@`) ke aage **pencil icon** ✏️ pe click
2. **Value** field mein purana IP hata ke likho:

```
216.198.79.1
```

3. **TTL** → dropdown se **Custom** → `600` (10 minute)
   - Ya `1 Hour` chhod do, bas thoda slow hoga
4. **Save**

---

# STEP 4 — www ka record

### Pehle check karo: `www` ka koi record pehle se hai?

List mein `Name = www` dhundo.

**Agar `www` ka A record hai:**
- Uske aage **pencil** ✏️ → phir **trash** 🗑️ → **Delete**
- Ek naam pe A aur CNAME dono nahi ho sakte

**Agar `www` ka CNAME hai** (GoDaddy default mein banata hai):
- Usko **edit** karo, naya banane ki zaroorat nahi

### Ab CNAME add/edit karo

**Add New Record** (ya pencil se edit):

| Field | Value |
|---|---|
| **Type** | `CNAME` |
| **Name** | `www` |
| **Value** | `395086531ddfe15b.vercel-dns-017.com` |
| **TTL** | Custom → `600` |

**Save**

---

# STEP 5 — 🛑 Ye records MAT chhedna

GoDaddy ki list mein aur bhi records honge. **Sirf upar wale do change karne hain.**

| Record | Chheda to |
|---|---|
| **MX** | `support@rokadoctor.in` email **band** ho jayega |
| **TXT** (SPF/DKIM/DMARC) | Email spam folder mein jayega |
| **NS** | Domain hi band ho jayega — **bilkul mat chhuo** |
| **SOA** | System ka hai, chhodo |

### Ek cheez DELETE karni hai (agar hai)

`AAAA` type ka koi record dikhe to **delete** kar do.

> Vercel IPv6 support nahi karta custom domains pe. AAAA rahega to traffic aadha-aadha bat jayega aur **SSL certificate atak jayega**.

### GoDaddy "Parked" record

Agar `Parked` ya `_domainconnect` naam ka record dikhe — usse koi farak nahi padta, chhod do.

---

# STEP 6 — Vercel mein apex ko PRIMARY banao ⚠️

**Ye zaroori hai — screenshot mein galat set hai.**

Aapke screenshot mein dikha:
```
rokadoctor.in       →  308 redirect  →  www.rokadoctor.in
www.rokadoctor.in   →  Production           ← ye primary hai
```

Par **code mein har jagah `https://rokadoctor.in`** (bina www) likha hai — canonical tags, sitemap, schema, sab.

**Mismatch rahega to:** har page Google ko bolega "asli URL apex hai", par site www pe chalegi. Google confuse hoga aur ranking bat jayegi.

### Theek karo

1. Vercel → Settings → **Domains**
2. `rokadoctor.in` (bina www) ke aage **⋯** → **Set as Primary**
3. Ab ulta ho jayega:

```
rokadoctor.in       →  Production      ✅
www.rokadoctor.in   →  308 → rokadoctor.in
```

---

# STEP 7 — Env vars

Vercel → Settings → **Environment Variables**:

| Name | Value |
|---|---|
| `NEXTAUTH_URL` | `https://rokadoctor.in` |
| `NEXT_PUBLIC_SITE_URL` | `https://rokadoctor.in` |

> 🚨 Exactly aisa hi — **aakhir mein slash nahi**, **www nahi**. Galat hua to login chupchaap band ho jayega, koi error nahi dikhega.

Teeno environment tick karo → **Save**

---

# STEP 8 — Redeploy

Vercel → **Deployments** → sabse upar → **⋯** → **Redeploy**

"Use existing Build Cache" ka tick **hatao** → **Redeploy**

---

# STEP 9 — Wait (10–30 min)

Vercel → Settings → Domains → **Refresh** button dabao thodi der baad.

```
Invalid Configuration    ← abhi wait karo
Valid Configuration ✅   ← ho gaya
```

Valid hote hi Vercel khud SSL certificate bana dega.

### Check karne ka tarika

`dnschecker.org` kholo → `rokadoctor.in` daalo → **A** chuno → Search

Duniya bhar ke servers pe `216.198.79.1` dikhne lagega.

---

# STEP 10 — Neon SQL

`console.neon.tech` → SQL Editor:

```sql
UPDATE seo_metadata SET
  meta_title = 'RO Service in Patna - Rs.200 Visit | Same-Day Repair',
  meta_description = 'Expert RO repair & installation across Patna at Rs.200 visit charge. All brands, 90-min response, 30-day warranty. Call 8969821440.',
  updated_at = now()
WHERE path = '/';
```

**Run**

---

# Test

Incognito mein `https://rokadoctor.in`:

- [ ] Nayi site khul rahi hai
- [ ] 🔒 taala
- [ ] `www.rokadoctor.in` → apex pe redirect ho raha hai
- [ ] Price table mein **₹350–399** (₹299 nahi)
- [ ] `/service-patna/kankarbagh` khulta hai
- [ ] `/service-patna/brand/aquafresh` khulta hai
- [ ] **`/register` → `/login`** ⚠️ sabse important
- [ ] Cart → checkout → COD order
- [ ] `/admin` login
- [ ] **Email:** `support@rokadoctor.in` pe mail bhejo — pahunche?
- [ ] Mobile se poori site

---

# 🔴 Rollback

Kuch bada toot jaye:

1. GoDaddy → Edit DNS
2. `A` record ka value wapas purane IP pe (STEP 2 wala)
3. `www` CNAME → delete
4. 10-30 min mein purani site wapas

---

# Problems

### ❌ GoDaddy: "Record already exists"
Us naam ka record pehle se hai. Naya banane ke bajaye **pencil se edit** karo.

### ❌ 30 min baad bhi Invalid Configuration
- **Do A record** hain — purana delete nahi hua
- **AAAA record** hai → delete
- GoDaddy ka **Forwarding** on hai → Domain Settings → Forwarding → off karo

### ❌ Site khul rahi hai par login nahi ho raha
`NEXTAUTH_URL` galat. `https://rokadoctor.in` exactly. Fix → **Redeploy**.

### ❌ Email band
MX record chhed gaya. GoDaddy support (1800-419-4816) se purana MX poochho.

### ❌ SSL nahi ban raha
AAAA record delete karo. CAA record ho to `letsencrypt.org` allow karo ya CAA hata do.

---

# Checklist

- [ ] Purani site ka backup ZIP
- [ ] 📝 **Purana A record IP likha**
- [ ] A record → `216.198.79.1`
- [ ] www CNAME → `395086531ddfe15b.vercel-dns-017.com`
- [ ] AAAA delete (agar tha)
- [ ] 🛑 MX/TXT/NS nahi chhede
- [ ] Vercel: apex **Set as Primary**
- [ ] `NEXTAUTH_URL` = `https://rokadoctor.in`
- [ ] Redeploy (cache off)
- [ ] Valid Configuration ✅
- [ ] Neon SQL
- [ ] Login test
- [ ] Email test

---

# 🔴 Live jaane se pehle

**Admin password abhi bhi `ChangeMe@123` hai** aur wo guide files mein publicly likha hai. Live hote hi koi bhi `/admin/login` pe jaake aapke orders, customer ke phone number aur address dekh sakta hai.

Badalne ke liye bcrypt hash chahiye — **bolo to main abhi bana ke de dunga**, aap bas Neon mein SQL paste kar dena.
