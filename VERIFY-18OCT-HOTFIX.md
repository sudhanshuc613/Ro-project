# 🔴 HOTFIX — "Application error" — 18 Oct 2026

**Ye meri galti thi. Maaf karna. Pakdi, theek ki, aur aisa dobara na ho uske liye
test bana diya.**

---

## 1. Kya hua

Owner ko `/ro-services-patna` aur `/service-patna` par ye dikha:
```
Application error: a client-side exception has occurred
```
Aur "ek baar khulta hai, ek baar error aata hai".

---

## 2. Asli wajah — ek line ki galti

Rating ko admin-editable banate waqt maine `TrustBadges` ko **`async` server
component** bana diya tha, taaki wo khud `getGbpSettings()` padh le aur kisi
caller ko chhuna na pade. 7 caller server page the — wahan sab theek chala.

**Par 8va caller `src/components/home/QuickBookForm.tsx` hai, jo `'use client'` hai.**

React me **client component ke andar async server component render nahi ho sakta**.
Browser me seedha ye phatta hai:
```
React error #329 — "Objects are not valid as a React child (found: [object Promise])"
→ React poora tree unmount kar deta hai
→ "Application error: a client-side exception has occurred"
```

"Ek baar khulta hai" ka matlab: server ka HTML theek aata hai (isliye pehli jhalak
dikhti hai), phir hydration ke waqt crash hota hai aur page gayab ho jaata hai.

---

## 3. 🔴 Mere 3408 test ise kyun nahi pakad paye

**Kyunki server ne phir bhi HTTP 200 aur bilkul sahi HTML bheja.**

Mere saare test — curl, crawl, deep-audit, jsonld-parents, gbp-consistency,
link-check — **sirf server ka HTML padhte hain**. Ye bug server par hai hi nahi.
Ye sirf **asli browser me, hydration ke waqt** hota hai.

Ye meri testing ka sabse bada chhed tha. Ab band hai (section 5).

---

## 4. Live par kitna toota tha — naapa

Fix se pehle, asli Chromium me 25 page khole:

| page | natija |
|---|---|
| `/` | 🔴 React #329 |
| `/ro-services-patna` | 🔴 React #329 |
| `/ro-service-in-patna` (ads landing) | 🔴 React #329 |
| `/ro-service-patna/kankarbagh` | 🔴 React #329 → **saare 83 area page** |
| `/ro-problem/ro-leakage-problem` | 🔴 React #329 → **saare 5 symptom page** |
| baaki 20 page | ok |

Yani **~91 page** toote hue the — homepage, ads landing, aur **saare area page**
(jo tera asli paisa laane wale page hain). Jin 5 template me `QuickBookForm`
render hota hai, theek wahi 5.

`/service-patna` par QuickBookForm nahi hai — wahan hard reload theek chalta hai.
Owner ko wahan error isliye dikha kyunki wo toote page se client-side navigate
karke gaya tha; ek baar React tree mar jaye to agla page bhi error dikhata hai.

---

## 5. Fix

`TrustBadges` ab **async nahi hai** — `gbp` prop leta hai, default
`GBP_FALLBACK` ke saath (prop na aaye to bhi kuch nahi tootega).

```
TrustBadges            async hataya · gbp?: GbpValues prop
QuickBookForm (client) gbp?: GbpValues prop liya, TrustBadges ko aage diya
8 caller page           gbp={gbp} pass karte hain
```

Component ki file me poora kaaran likha hua hai, taaki koi dobara `async` na kare.

### Naap — fix ke baad, asli browser me
```
LOCAL  (fix ke saath)  : 25 page · PASS 25 · FAIL 0
LIVE   (abhi, bina fix): 25 page · PASS 20 · FAIL 5
```

---

## 6. 🆕 Do naye permanent test — ab ye galti nikal hi nahi sakti

### a) `scripts/verify-browser.sh` + `scripts/browser-check.mjs`
Asli **Chromium** me 25 page (har template se kam se kam ek) kholta hai,
hydration poora hone deta hai, aur pakadta hai:
1. HTTP 200
2. koi uncaught page error nahi (React crash)
3. console me koi `error` nahi
4. page par "Application error" / "client-side exception" text nahi
5. crash ke baad `<h1>` gayab to nahi hua

**Yahi test live par chalaya to 5 FAIL diye — matlab ye sach me kaam karta hai,
sirf dikhawa nahi.**

### b) `scripts/check-async-in-client.mjs` — tez wala pehra
Static check (browser ki zaroorat nahi, 1 second). Import graph ghoom kar dekhta
hai ki kisi bhi client component ke **neeche** koi `export default async function`
wala component to nahi aa raha.
```
80 client component jaanche gaye.
PASS  koi client component async server component render nahi karta
```

### 🔴 NIYAM jo ab file me likha hai
> `src/components/**` me kabhi `export default async function` mat likho jab tak
> pakka na ho ki uska **koi bhi** caller client component nahi hai.
> Data upar se **prop** me lo.

---

## 7. Poora test — 3433 PASS / 0 FAIL (26 script)

```
tsc --noEmit            EXIT 0
check-client-exports    PASS (94 import)
check-async-in-client   PASS (80 client component)   🆕
next build              EXIT 0 — 210 static page
verify-all              3433 PASS / 0 FAIL
  …sab purane 25 script 0 FAIL…
  verify-browser        25 PASS / 0 FAIL   🆕
```

---

## 8. Badli hui file — har ek

| file | bytes | kya |
|---|---:|---|
| `src/components/ui/TrustBadges.tsx` | **3,027** | 🔴 `async` hataya, `gbp` prop |
| `src/components/home/QuickBookForm.tsx` | **12,575** | `gbp` prop liya + aage diya |
| `src/app/(shop)/page.tsx` | 18,336 | `gbp={gbp}` |
| `src/app/(shop)/ro-service-patna/[area]/page.tsx` | 33,171 | `gbp={gbp}` |
| `src/app/(shop)/ro-problem/[symptom]/page.tsx` | 17,492 | `gbp={gbp}` |
| `src/app/(shop)/blog/[slug]/page.tsx` | 8,789 | `gbp={gbp}` + async |
| `src/app/(shop)/ro-problem-checker/page.tsx` | 13,497 | `gbp={gbp}` |
| `src/app/(shop)/ro-customer-care-patna/page.tsx` | 31,299 | `gbp={gbp}` |
| `src/app/(shop)/ro-services-patna/page.tsx` | 24,271 | `gbp={gbp}` |
| `src/app/(shop)/[intent]/page.tsx` | 29,335 | `gbp={gbp}` |
| `scripts/browser-check.mjs` | **5,903** | 🆕 |
| `scripts/verify-browser.sh` | **3,154** | 🆕 |
| `scripts/check-async-in-client.mjs` | **2,703** | 🆕 |
| `scripts/verify-all.sh` | 1,623 | 26 script |
| `APPLY.ps1` | 11,361 | nayi file byte-check |

🔴 **Koi keyword, heading, text, schema, rate, area data NAHI badla.** Rating 58 bhi
waisi hi. Sirf `TrustBadges` ka data aane ka raasta badla — `await` ki jagah `prop`.

---

## 9. 🔴 Isko TURANT push karna hai

Abhi live par homepage, ads landing aur saare 83 area page browser me toot rahe hain.
Har visitor ko "Application error" dikh raha hai.

Agar push me der ho to **bech-bich ka rasta**: Vercel → Deployments → 16 Oct wala
🟢 Ready → ⋯ → **Promote to Production**. Usme rating 50 hogi (58 nahi), par page
chalenge. Push ke baad rating dobara 58 ho jayegi.

---

## 10. Mujhse kya galat hua — saaf saaf

1. Maine `TrustBadges` ko `async` kiya **bina ye dekhe ki uske 8 caller me se ek
   client component hai**. Maine sirf `grep '<TrustBadges'` karke "8 file" ginn li
   thi, par har caller ka `'use client'` nahi dekha.
2. Mere paas **browser me chalane wala koi test tha hi nahi** — 3408 test sab
   server HTML par the. Isliye build pass hua, saare test pass hue, aur bug
   seedha owner tak pahunch gaya.
3. Dono cheezein ab theek hain: fix ho gaya, aur dono tarah ke pehre
   (static + asli browser) suite me jud gaye.
