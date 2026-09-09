# 🔴 Notification kyun nahi aaya — aur 2 minute ka fix

**31 Aug 2026**

---

# Pehle: ye MERI galti hai

Maine `PHASE-1-2-3-COMPLETE.md` me likha tha:

> *"Deploy ke baad Vercel apne aap `prisma db push` chala dega (build script me hai)."*

**Ye galat tha.** Maine check nahi kiya. Build script me sirf ye hai:

```
prisma generate && next build
```

`db push` **hai hi nahi**. Isliye production database me 2 naye table bane hi nahi.

---

# Kya ho raha hai abhi

Maine live check kiya:

| Cheez | Haal |
|---|---|
| Site | ✅ 200 OK |
| Naya UI (ProofStats) | ✅ live hai |
| `/sw.js` | ✅ 200 |
| `/api/admin/alerts` | ✅ 401 (deploy ho gaya) |
| `/api/admin/push` | ✅ 401 |
| `/api/admin/search` | ✅ 401 |
| **`admin_alerts` table** | ❌ **DB me hai hi nahi** |

## Chain jo tut rahi hai

```
Service request aati hai
      ↓
alert.service.ts row banane jata hai
      ↓
table hi nahi hai → Postgres error
      ↓
maine try/catch daala tha (taaki booking na tute)
      ↓
error chup-chaap swallow ho gaya
      ↓
✅ BOOKING SAVE HO GAYI      ❌ ALERT NAHI BANA
```

## 🟢 Achhi khabar

**Teri koi booking nahi gayi.** Sab service requests database me safe hain — `/admin/service-requests` me dekh lo, sab wahan hain.

Sirf **notification** nahi bana. Fix 2 minute ka hai.

---

# ✅ FIX — Neon me ek SQL

## Step 1 — Neon kholo

`console.neon.tech` → apna project → **SQL Editor**

## Step 2 — Ye poora paste karo aur **Run** dabao

```sql
CREATE TABLE IF NOT EXISTS "admin_alerts" (
    "id" UUID NOT NULL,
    "kind" VARCHAR(40) NOT NULL,
    "priority" VARCHAR(10) NOT NULL DEFAULT 'normal',
    "title" VARCHAR(160) NOT NULL,
    "body" VARCHAR(400) NOT NULL,
    "link" VARCHAR(300),
    "phone" VARCHAR(20),
    "amount" DECIMAL(12,2),
    "related_type" VARCHAR(40),
    "related_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" UUID NOT NULL,
    "endpoint" VARCHAR(500) NOT NULL,
    "p256dh" VARCHAR(200) NOT NULL,
    "auth" VARCHAR(100) NOT NULL,
    "label" VARCHAR(80),
    "user_id" UUID,
    "last_used" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_alerts_is_read_created_at_idx"
    ON "admin_alerts"("is_read", "created_at");
CREATE INDEX IF NOT EXISTS "admin_alerts_kind_created_at_idx"
    ON "admin_alerts"("kind", "created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_key"
    ON "push_subscriptions"("endpoint");
```

> **Ye SQL bilkul safe hai.** `IF NOT EXISTS` laga hai — dobara chala do to bhi kuch nahi bigdega. Maine test kiya, do baar chalaya, dono baar theek.
>
> Ye tere kisi purane table ko chhuta nahi. Sirf 2 naye table banata hai.

## Step 3 — Confirm karo

Neon me ye chalao:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('admin_alerts','push_subscriptions');
```

**Dono naam dikhne chahiye.**

## Step 4 — Test karo

1. Doosre phone se (ya incognito me) `rokadoctor.in` khol
2. Ek dummy booking kar do
3. `rokadoctor.in/admin` → 🔔 bell dekho

**Alert dikhna chahiye** — customer ka naam, area, phone, aur Call/WhatsApp button.

---

# 📱 Phir phone notification chalu karo

Ye alag step hai. Pehle upar wala SQL chalao.

## Vercel me 3 env var check karo

Vercel → `ro-project` → Settings → Environment Variables. Ye teen hone chahiye:

```
VAPID_PUBLIC_KEY   = BICnLLsOsSbdV5VG42SOjfbhF84k-Ar94RBzcC3kIJZ8ooOMHciI2NBTv5ayFnVBJJtF5Myo8YhyN8I55lySseI
VAPID_PRIVATE_KEY  = _HMSnEmO7WIS8Ghg6yeBU6u3tpQYR0apsSDXyYyqkPc
VAPID_SUBJECT      = mailto:support@rokadoctor.in
```

Na hon to add karo → **Redeploy** (⋯ → Redeploy)

## Phir phone pe

**Android:** Chrome me `/admin` → login → 🔔 → **"Phone pe notification chalu karo"** → Allow

**iPhone:** Safari me `/admin` → Share → **Add to Home Screen** → home icon se kholo → login → 🔔 → chalu karo → Allow

Test notification turant aayegi ✅

---

# 🛠️ Maine code me kya sudhara

Taaki ye galti **dobara chup-chaap na ho**:

## Ab bell saaf-saaf batayega

Agar table na ho to bell me laal box dikhega:

```
🔴 Database setup baaki hai

admin_alerts table nahi bana. Isliye notification save
nahi ho rahe. Neon SQL Editor me
prisma/migrations/add-notification-tables.sql chalao —
30 second ka kaam hai.

Booking safe hai — sirf alert nahi ban raha.
```

**Pehle ye "koi notification nahi hai" dikhata tha** — jo bilkul waisa hi lagta hai jaise sab theek ho. Wahi sabse buri baat thi.

## Technical detail

Ab code Postgres error `42P01` (undefined_table) aur `P2021` ko pehchanta hai, aur usko baaki errors se alag treat karta hai:

- **Table missing** → `setupNeeded: true` → UI me laal warning
- **Koi aur error** → chup-chaap degrade (admin page nahi tootna chahiye)

## SQL file project me save kar di

```
prisma/migrations/add-notification-tables.sql
```

Naye zip me hai. Aage kabhi DB reset karo to yahi file chala dena.

---

# 🧪 Maine kya-kya test kiya

```
✅ SQL khali DB pe chalaya                 — koi error nahi
✅ Wahi SQL dobara chalaya                 — bhi theek (idempotent)
✅ Dono table + 5 index bane
✅ Table hataya, alerts API call kiya      — setupNeeded: true mila
✅ Table hata ke booking ki                — booking SUCCESS (SRV-2026-00001)
✅ SQL apply kiya, phir booking ki         — alert bana
✅ tsc --noEmit                            EXIT 0
✅ npm run build                           EXIT 0, 131 pages, zero warnings

verify-ux-upgrade.sh       99/99
verify-seo-indexing.sh     59/59
verify-product-admin.sh    68/68
verify-titles-and-schema   44/44
verify-brand-rename        51/51
verify-admin-full          44/44
verify-password-features   31/31
──────────────────────────────────
TOTAL                    396/396   ✅
```

---

# 📤 Naya zip upload karna zaroori hai?

**SQL chalane ke liye nahi.** Wo abhi ke deploy pe bhi kaam kar jayega — table ban jayegi aur alerts turant aane lagenge.

**Par naya zip me ye sudhar hain:**
- Bell ab table missing pe saaf warning deta hai
- SQL file project me save hai

Jaldi nahi hai. Pehle **SQL chalao aur notification test karo**. Zip baad me push kar dena — `UPLOAD-PHASE-123.md` wale hi steps hain.

---

# ⚡ Sabse chhota rasta

```
1. console.neon.tech → SQL Editor
2. Upar wala SQL paste → Run
3. Dummy booking karo
4. /admin → 🔔 → alert dikhega
```

**Bas. 2 minute.**
