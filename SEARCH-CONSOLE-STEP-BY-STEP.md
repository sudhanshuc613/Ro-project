# Search Console — bilkul step by step

**Kaun sa browser:** Chrome (ya koi bhi — Edge, Firefox, sab chalega)
**Kitna time:** 15 minute
**Kya chahiye:** apna Gmail ID aur GoDaddy ka login

---

# ✅ Pehle achhi khabar

Maine abhi check kiya — **tera code deploy ho gaya hai:**

```
/service-patna/buddha-colony   → 200 ✅
/service-patna/kurji           → 200 ✅
/service-patna/anisabad        → 200 ✅
/service-patna/rukanpura       → 200 ✅
/service-patna/khajpura        → 200 ✅
/service-patna/mahendru        → 200 ✅

sitemap.xml → 73 URLs (pehle 54 the)
```

**Saare 19 naye page live hain.** Ab bas Google ko batana hai.

---

# 🔴 PART A — Search Console setup (ek baar ka kaam)

## Step 1 — Website kholo

1. **Chrome kholo**
2. Address bar mein type karo:
   ```
   search.google.com/search-console
   ```
3. Enter dabao

## Step 2 — Gmail se login

- **Wahi Gmail use karo jisse tera Google Business Profile bana hai**
- Agar pehle se login hai to seedha aage badhega

## Step 3 — Property add karo

Do box dikhenge — **Domain** aur **URL prefix**

```
┌─────────────────┬─────────────────┐
│    Domain       │   URL prefix    │
│                 │                 │
│  ← YE WALA      │                 │
└─────────────────┴─────────────────┘
```

**LEFT wala "Domain" chuno**

Usme type karo (bilkul yahi, `https://` mat lagana):
```
rokadoctor.in
```

**CONTINUE** dabao

## Step 4 — Google ek code dega

Ek popup khulega jisme aisa likha hoga:
```
google-site-verification=abc123xyz456...
```

**Us code ko COPY karo** (uske aage "Copy" button hoga, wo dabao)

> ⚠️ Ye page **band mat karna**. Doosra tab kholna hai.

---

# 🔴 PART B — GoDaddy mein code daalo

## Step 5 — Naya tab kholo

**Ctrl + T** dabake naya tab kholo, usme:
```
dcc.godaddy.com
```

## Step 6 — DNS kholo

1. GoDaddy mein login karo
2. `rokadoctor.in` dhundo
3. Uske aage **DNS** ya **Manage DNS** pe click

*(Ye wahi page hai jahan tune pehle A record daala tha — `216.198.79.1` wala)*

## Step 7 — Naya record add karo

1. **Add New Record** button dabao
2. Ye bharo:

| Field | Kya daalna |
|---|---|
| **Type** | `TXT` |
| **Name** | `@` |
| **Value** | Google wala code paste karo (`google-site-verification=...`) |
| **TTL** | `1 Hour` (default rehne do) |

3. **Save** dabao

> ⚠️ **A record ko haath mat lagana.** Wo `216.198.79.1` waisa hi rehna chahiye. Sirf naya TXT record add karna hai.

---

# 🔴 PART C — Verify karo

## Step 8 — Search Console wale tab pe wapas jao

Pehla tab (jo khula chhoda tha) — wahan **VERIFY** button dabao

**Do mein se ek hoga:**

| Result | Kya karna |
|---|---|
| ✅ **"Ownership verified"** | Ho gaya! Step 9 pe jao |
| ❌ **"Verification failed"** | Normal hai. **5 minute ruko**, phir dobara VERIFY dabao |

> DNS ko phailne mein kabhi-kabhi 1 ghanta lagta hai. Agar abhi na ho to shaam ko dobara try karna — code GoDaddy mein saved rahega.

---

# 🔴 PART D — Sitemap submit karo

## Step 9 — Sitemap

1. Verify hone ke baad Search Console khulega
2. **LEFT side** mein menu hoga, usme **"Sitemaps"** pe click
3. Ek box dikhega: *"Add a new sitemap"*
4. Usme type karo (sirf itna, poora URL nahi):
   ```
   sitemap.xml
   ```
5. **SUBMIT** dabao

**Success dikhna chahiye.** 1-2 din mein "73 discovered" jaisa dikhega.

---

# 🔴 PART E — 5 zaroori page ka indexing maango

## Step 10 — URL Inspection

**LEFT menu** mein sabse upar **"URL Inspection"** hota hai (ya upar ek search bar hoti hai).

Ab ye 5 URL **ek-ek karke** karna hai:

### URL 1
Search bar mein **poora URL** paste karo:
```
https://rokadoctor.in/service-patna
```
Enter dabao → thoda ruko → **"REQUEST INDEXING"** button dikhega → dabao → 1-2 min wait → "Added to queue" aayega

### URL 2
```
https://rokadoctor.in/service-patna/buddha-colony
```
Same tarika

### URL 3
```
https://rokadoctor.in/service-patna/kurji
```

### URL 4
```
https://rokadoctor.in/service-patna/anisabad
```

### URL 5
```
https://rokadoctor.in/service-patna/rukanpura
```

> **Roz sirf 10 URL** kar sakte ho. Isliye 5 aaj, 5 kal.
> Baaki 14 area pages apne aap sitemap se crawl ho jaayenge — 1-2 hafte lagenge.

---

# 📅 Baaki 14 pages — kal ke liye

Kal ye 5 karna:
```
https://rokadoctor.in/service-patna/khajpura
https://rokadoctor.in/service-patna/mahendru
https://rokadoctor.in/service-patna/lohia-nagar
https://rokadoctor.in/service-patna/shastri-nagar
https://rokadoctor.in/service-patna/kidwaipuri
```

Parso ye 5:
```
https://rokadoctor.in/service-patna/mithapur
https://rokadoctor.in/service-patna/bankipur
https://rokadoctor.in/service-patna/gardanibagh
https://rokadoctor.in/service-patna/keshri-nagar
https://rokadoctor.in/service-patna/hanuman-nagar
```

Uske parso ye 4:
```
https://rokadoctor.in/service-patna/raja-bazar
https://rokadoctor.in/service-patna/rajapur
https://rokadoctor.in/service-patna/sheikhpura
https://rokadoctor.in/service-patna/new-punaichak
https://rokadoctor.in/service-patna/lodipur
```

---

# 🔴 Ek aur cheez — GA abhi live nahi hai

Maine check kiya — `G-JP9HDZ9SE3` live site pe nahi mila.

**Matlab:** GA wala code push nahi hua, ya purana build cache hai.

**Ye kar:**
1. Vercel kholo → **Deployments**
2. Sabse upar wale ke aage **⋯** → **Redeploy**
3. **"Use existing Build Cache" ka tick HATAO**
4. **Redeploy** dabao

3-4 min baad mujhe bata dena — main check kar dunga.

---

# ✅ Aaj ka checklist

- [ ] `search.google.com/search-console` khola
- [ ] **Domain** property banayi (`rokadoctor.in`)
- [ ] Google ka TXT code copy kiya
- [ ] GoDaddy DNS mein TXT record daala (Name = `@`)
- [ ] Search Console mein **VERIFY** dabaya → green tick
- [ ] **Sitemaps** → `sitemap.xml` submit kiya
- [ ] 5 URL ka **Request Indexing** kiya
- [ ] Vercel pe **Redeploy** kiya (GA ke liye)

---

# 🕐 Uske baad kya hoga

| Time | Kya dikhega |
|---|---|
| Aaj | Kuch nahi — normal hai |
| 2-3 din | Sitemap mein "73 discovered" |
| 1 hafta | **Performance** tab mein pehla data |
| 2-3 hafte | Kaunse keyword se log aa rahe hain, wo dikhega |

**Search Console sirf aage ka data dikhata hai** — jitni jaldi setup karoge utna jaldi data milega. Isliye aaj hi kar lo.

---

# ❓ Atak jaye to

| Problem | Fix |
|---|---|
| "Domain" option nahi dikh raha | Page reload karo, ya `+ Add property` dropdown se chuno |
| TXT record save nahi ho raha | Name field mein sirf `@` daalo, `rokadoctor.in` mat likhna |
| Verification fail | 5-10 min ruko, dobara VERIFY. Ya kal subah |
| "Request Indexing" grey hai | 1-2 min wait karo, Google page check kar raha hota hai |
| Sitemap "Couldn't fetch" | 1 din ruko, phir dobara submit |

**Kahin bhi atko to screenshot bhej dena — main dekh ke bata dunga.**
