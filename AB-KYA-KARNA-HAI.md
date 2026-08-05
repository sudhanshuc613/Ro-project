# ✅ SITE LIVE HO GAYI — ab sirf 3 kaam bache hain

**Date:** 6 Aug 2026
**Status:** `rokadoctor.in` pe nayi Next.js site chal rahi hai. Purani PHP site hat gayi.

---

## Pehle ye samajh le — tune kya kiya

Tune GoDaddy mein `A @ 216.198.79.1` daal diya. **Wo bilkul sahi hai.**

Maine khud check kiya, ye result aaya:

```
GoDaddy ka nameserver (ns27.domaincontrol.com) bolta hai:
   rokadoctor.in      A       216.198.79.1     ✅
   www.rokadoctor.in  CNAME   rokadoctor.in.   ✅ (ye bhi chalta hai)

Vercel se site aa rahi hai:
   server: Vercel
   <title>RO Service in Patna — ₹200 Visit | Same-Day Repair
   
SSL certificate ban gaya (Let's Encrypt):
   rokadoctor.in       — valid till 3 Nov 2026  ✅
   www.rokadoctor.in   — valid till 3 Nov 2026  ✅
```

Vercel screen pe abhi bhi "Invalid Configuration" dikh sakta hai — **usko ignore kar.**
Wo isliye dikh raha hai kyunki tune `www` ke liye CNAME `rokadoctor.in.` rakha hai,
Vercel `395086531ddfe15b.vercel-dns-017.com` maang raha tha.

**Par dono kaam karte hain.** Cert ban gaya, site khul rahi hai. Bas **Refresh** dabana Vercel mein.

---

## Maine poori site test ki — sab 200 OK

| Page | Status |
|---|---|
| `/` homepage | 200 ✅ |
| `/service-patna` | 200 ✅ |
| `/service-patna/brand` | 200 ✅ |
| `/service-patna/brand/aquafresh` | 200 ✅ |
| `/service-patna/brand/lg`, `whirlpool`, `panasonic`, `faber`, `v-guard`, `konvio-neer`, `aquaultra`, `zero-b`, `tata-swach` | sab 200 ✅ |
| `/service-patna/kankarbagh` | 200 ✅ |
| `/products` | 200 ✅ |
| `/amc-plans` | 200 ✅ |
| `/cart` | 200 ✅ |
| `/login` `/register` | 200 ✅ |
| `/track-order` | 200 ✅ |
| `/admin/login` | 200 ✅ |
| `/sitemap.xml` `/robots.txt` | 200 ✅ |

Rate check bhi kiya — homepage pe **₹200 visit** aur **₹350–399 competitor** dikh raha hai. Sahi hai.
(₹299 jo mila wo purana cache tha browser ka, code mein nahi hai — verify kiya.)

---

# 🔴 KAAM 1 — LOGIN ABHI TOOTA HUA HAI (sabse urgent)

Maine test kiya. Site ka login system abhi bhi **purana Vercel URL** bol raha hai:

```
callbackUrl : https://ro-project.vercel.app     ← GALAT
signinUrl   : https://ro-project.vercel.app/api/auth/signin/password
```

**Iska matlab:** koi customer login/register karne jayega → login hoga hi nahi,
ya `ro-project.vercel.app` pe phenk dega. **Admin panel bhi nahi khulega.**

Koi error message nahi aayega — chupchaap fail hoga. Isliye ye sabse zaroori hai.

### Theek karne ka tarika

1. Vercel kholo → project **`ro-project`** → **Settings** → **Environment Variables**
2. `NEXTAUTH_URL` dhundo → **Edit** (pencil)
3. Value badal ke ye karo:

```
https://www.rokadoctor.in
```

4. `NEXT_PUBLIC_SITE_URL` bhi dhundo → wahi value:

```
https://www.rokadoctor.in
```

> ⚠️ **`www` ke saath** likhna hai. Aakhir mein slash `/` **nahi**.
> Reason neeche KAAM 2 mein hai.

5. Teeno checkbox tick karo (Production, Preview, Development) → **Save**
6. **Deployments** tab → sabse upar wale ke aage **⋯** → **Redeploy**
7. "Use existing Build Cache" ka tick **HATAO** → **Redeploy**

3-4 minute lagega. Uske baad `/login` aur `/admin/login` chalu ho jayenge.

---

# 🟡 KAAM 2 — www ya bina www, ek chuno

Abhi ye halat hai:

```
rokadoctor.in        →  308 redirect  →  www.rokadoctor.in
www.rokadoctor.in    →  site khulti hai
```

Par **code ke andar har jagah bina-www likha hai.** Maine live page se nikala:

```html
<link rel="canonical" href="https://rokadoctor.in"/>
<meta property="og:url" content="https://rokadoctor.in"/>
```

Sitemap mein bhi:
```
<loc>https://rokadoctor.in/</loc>
<loc>https://rokadoctor.in/service-patna</loc>
```

**Problem:** site `www` pe chalti hai, par Google ko bolti hai "meri asli address bina-www hai".
Google confuse hoga. Ranking baant jayegi. SEO ka nuksan.

### Do raaste hain — koi ek chuno

#### 🟢 Raasta A — `www.rokadoctor.in` rakho (AASAAN, 5 minute)

Kuch bhi DNS mein nahi chhedna. Bas code mein 1 line badalni hai.

1. GitHub kholo → `Ro-project` repo
2. File: `src/lib/constants.ts` → **pencil** icon (Edit)
3. Line 10 pe ye milega:
   ```ts
   url: 'https://rokadoctor.in',
   ```
4. Badal ke:
   ```ts
   url: 'https://www.rokadoctor.in',
   ```
5. **Commit changes** → Vercel khud redeploy kar dega

Iske baad canonical, sitemap, schema sab `www` bolenge. Match ho jayega.

#### 🔵 Raasta B — `rokadoctor.in` (bina www) rakho — SEO ke liye thoda behtar

Code mein kuch nahi chhedna, par Vercel mein setting badalni hai.

1. Vercel → **Settings** → **Domains**
2. `rokadoctor.in` (bina www) ke aage **⋯** → **Set as Primary**
3. Ab ulta ho jayega:
   ```
   rokadoctor.in        →  Production        ✅
   www.rokadoctor.in    →  308 → rokadoctor.in
   ```
4. Phir KAAM 1 wale env vars mein **bina www** likhna:
   ```
   NEXTAUTH_URL         = https://rokadoctor.in
   NEXT_PUBLIC_SITE_URL = https://rokadoctor.in
   ```

**Mera suggestion: Raasta B.** URL chhota hai, code already waisa hai, aur
`rokadoctor.in` type karna customer ke liye aasaan hai.

**Par agar jaldi hai to Raasta A kar le — 5 minute ka kaam hai.**

> ⚠️ Jo bhi chuno, **KAAM 1 ke env vars usi ke hisaab se bharna.** Mismatch = login toot jayega.

---

# 🔴 KAAM 3 — ADMIN PASSWORD BADAL (site live hai, khatra hai)

Abhi admin password `ChangeMe@123` hai. Ye guide files mein likha hua hai.
Site live hai — koi bhi `/admin/login` pe jaake tere saare orders,
customer ke phone number aur ghar ka address dekh sakta hai.

Maine naya password bana diya hai:

### 🔑 Naya password (kahin safe likh le)

```
Aqua#OithaQ5276@
```

### Neon mein ye SQL chala

1. `console.neon.tech` → login → **SQL Editor**
2. Ye paste kar → **Run**

```sql
UPDATE users
SET password_hash = '$2b$12$Tuf8g1GMhn.uUQM4SHnnfONyslx0FXrJPItNWhgZTMl3eUnLgFcRG',
    updated_at = now()
WHERE phone = '8969821440';
```

3. Ye chala ke confirm kar (1 row aana chahiye):

```sql
SELECT phone, role, left(password_hash, 10) AS hash_start
FROM users WHERE phone = '8969821440';
```

Ab login:
- Phone: `8969821440`
- Password: `Aqua#OithaQ5276@`

> Hash verify kiya maine — naya password chalega, purana `ChangeMe@123` band ho jayega.

---

# 📧 EMAIL — ek baat pooch raha hoon

Tere GoDaddy DNS mein abhi **koi MX record nahi hai**. Sirf 7 records hain:
A, 2× NS, 2× CNAME, SOA, aur `_dmarc` TXT.

Purane cPanel server pe MX record tha:
```
rokadoctor.in.  MX  0  rokadoctor.in.     (mail khud usi server pe)
mail.rokadoctor.in     → 65.108.44.247
webmail.rokadoctor.in  → 65.108.44.247
```

**Matlab:** agar tera koi email chalta tha jaise `info@rokadoctor.in` ya
`support@rokadoctor.in` — **wo ab band ho gaya hai.**

### Agar email chahiye

GoDaddy DNS mein wapas add kar:

| Type | Name | Value | Priority |
|---|---|---|---|
| MX | `@` | `rokadoctor.in` | 0 |
| A | `mail` | `65.108.44.247` | — |
| A | `webmail` | `65.108.44.247` | — |

⚠️ **Par ye tabhi karna jab purani hosting ka account abhi chalu ho.**
Agar hosting band kar di hai to MX daalne ka fayda nahi.

### Agar email nahi chahiye
Kuch mat kar. Abhi jaisa hai theek hai. Business ke liye WhatsApp
(`8969821440`) hi kaafi hai — Patna mein customer WhatsApp hi karta hai, email nahi.

**Bata dena — email chahiye ya nahi.**

---

# ✅ Checklist — order mein kar

- [ ] **KAAM 2 decide kar** — www ya bina www (mera vote: bina www)
- [ ] **KAAM 1** — `NEXTAUTH_URL` + `NEXT_PUBLIC_SITE_URL` set kar → Redeploy (cache off)
- [ ] **KAAM 3** — Neon mein password SQL chala
- [ ] Vercel Domains pe **Refresh** daba — Valid ✅ ho jayega
- [ ] Incognito mein `rokadoctor.in` khol ke test kar:
  - [ ] site khulti hai, 🔒 taala dikhta hai
  - [ ] **`/register` pe naya account ban raha hai** ← sabse zaroori
  - [ ] `/admin/login` pe naye password se login ho raha hai
  - [ ] cart mein product daal ke COD order kar ke dekh
  - [ ] mobile se poori site scroll kar

---

# 🕐 Google wale ko thoda time lagega

Maine 6 alag DNS servers se check kiya:

```
Cloudflare  216.198.79.1   NAYA ✅
Quad9       216.198.79.1   NAYA ✅
OpenDNS     216.198.79.1   NAYA ✅
AdGuard     216.198.79.1   NAYA ✅
Level3      216.198.79.1   NAYA ✅
Google      65.108.44.247  PURANA (cache) — 1-2 ghante mein theek
```

**5 out of 6 ho gaye.** Google DNS purana cache pakde hue hai, apne aap theek ho jayega.

Agar tere phone/laptop pe abhi bhi purani site dikhe:
- WiFi off/on kar
- Ya browser mein incognito khol
- Ya mobile data pe try kar

Ye normal hai, ghabrane ki baat nahi.

---

# 🔴 Rollback (agar kuch bada toot jaye)

GoDaddy → DNS → A record `@` ka value wapas:

```
65.108.44.247
```

10 minute mein purani PHP site wapas aa jayegi.
**Ye IP note kar ke rakh le** — maine live server se nikala hai.

---

# Baad mein karne wale kaam (abhi urgent nahi)

1. **Google Business Profile** banana — local ranking ka 32% weight isi ka hai.
   Competitor ke 5,117 review hain, tere 0. Ye sabse bada gap hai.
2. **Neon ka password rotate** kar — chat mein expose ho gaya tha.
3. **AI-generated photos hatana** — `public/service/*.jpg`. GBP suspend kar sakta hai.
   Asli technician ki photo daal.
4. **Vercel Pro** — Hobby plan pe payment gateway chalana rules ke against hai.
5. **WhatsApp verification** — code ready hai, bas Meta app aur 4 env vars chahiye.
