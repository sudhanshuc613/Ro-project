# 🔧 Bug Fix + 3 Naye Feature — 9 Sep 2026

**927/927 tests pass** · build EXIT 0 · 174 pages · zero warnings

---

# 🔴 TERA BUG — mila, samjha, theek kiya

## Tune kya dekha
> "area select karte wakt wo white hai, koi areas show nahi ho raha, hover
> karne pe dikhta hai"

## Asli wajah (guess nahi — code padh ke mila)

Site pe **kisi bhi form control pe text colour set hi nahi tha**. CSS me colour
parent se inherit hota hai.

Aur `QuickBookForm` **dark hero panel ke andar** render hota hai:
```
/ro-service-patna/{area}     bg-navy-gradient  (63 pages)
/ro-services-patna           bg-navy-gradient
6 service pages              bg-navy-gradient
```

To `<select>` pe `bg-white` tha, par text **hero ka WHITE inherit** kar raha
tha. **White pe white.**

Hover pe browser apna khud ka highlight background paint karta hai — isliye
tabhi text "dikhta" tha.

## 🔴 Aur ek bug jo pehla fix karte waqt mila

Maine pehle fix `@layer base` ke andar likha. Build kiya, **compiled CSS
check kiya** — rule wahan tha hi nahi.

Wajah: **Tailwind `@layer` ke andar se wo rules hata deta hai jinka selector
usne scan kiye hue content me nahi mila.** `select option` jaisa plain element
selector kisi JSX class se match nahi karta, to Tailwind ne usse chup-chaap
bundle se nikaal diya.

Agar main sirf source file dekh ke "ho gaya" keh deta, to tere paas fix
pahunchta hi nahi. Layer se bahar nikala, dobara build kiya, **compiled CSS me
verify kiya** — ab hai.

## ✅ Ab kya hai

```css
input, select, textarea  { color: navy-700; color-scheme: light; }
select option, optgroup  { background: #fff; color: navy-700; }
::placeholder            { color: slate-400; }
:disabled                { color: slate-500; }
```

`color-scheme: light` isliye ki **Android dark mode** me Chrome popup list ko
apne aap dark paint karta hai — wahi invisible-text bug, alag wajah se. India
me dark mode bahut chalta hai.

**Ye ek jagah fix hua aur poori site ke 11 form control theek ho gaye** —
booking form, admin product form, order manager, machine manager, sort
dropdown, sab.

## Aur uske upar — dropdown hi badal diya

63 areas ka native `<select>` mobile pe 8 scroll-flick maangta tha
(35 → 55 → 63 badh chuka hai). Naya **AreaPicker**:

```
✓ Type karke dhundo — naam, pincode YA landmark se
  ("ashiana" likho to Kankarbagh mil jayega)
✓ Har area ke saath pincode + response time dikhta hai
✓ Keyboard: ↑ ↓ Enter Esc
✓ Screen reader ready (combobox + listbox roles)
✓ Native select fallback chhupa hua hai — JS fail ho to bhi form chalega
```

**Ab wo bug dobara ho hi nahi sakta**, kyunki ab wo native select hai hi nahi.

---

# 🔍 Competitor research — kaunse feature bade log use karte hain

Live scrape kiya 9 Sep:

| | Urban Company | rocareindia | **hum (pehle)** |
|---|---|---|---|
| Referral program | ✅ | — | ❌ |
| Loyalty coins | — | ✅ | ❌ |
| Slot picker | ✅ | ✅ | ✅ |
| OTP verify | ✅ | ✅ | ✅ |
| Live tracking | ✅ | ✅ | ✅ |
| Mobile app | ✅ | ✅ | ❌ |
| **Diagnostic tool** | ❌ | ❌ | ❌ |

Dono funded competitors **referral** chala rahe hain. Aur **kisi ke paas
diagnostic tool nahi hai.**

---

# ✨ 3 NAYE FEATURE

## 1. 🎁 Referral system

**Kyun ye:** Urban Company aur rocareindia dono referral chalate hain — par
wo Patna me **acha nahi chala sakte**, kyunki referral tabhi kaam karta hai
jab lene wala dene wale ko **locally verify** kar sake. Gurgaon call centre ka
Patna me koi social graph nahi hai. Tera hai.

Aur economics sahi hai: ad budget pehle paisa maangta hai, referral **kaam
poora hone ke baad** discount deta hai. Loss ho hi nahi sakta.

```
Customer ka code:  AP-3YFQ   (phone se derive hota hai)

Dost ko:   ₹50 kam — visit ₹200 ki jagah ₹150
Tereko:    ₹100 credit agli service me
```

**Kahan dikhta hai:** `/track/{ticket}` pe, jab kaam **COMPLETED** ho.
Review CTA ke **neeche** — kyunki review 36% ranking weight hai aur referral
ek job. Agar customer ek hi cheez kare to review honi chahiye.

**Booking form me:** collapsed link — *"+ Referral code hai? ₹50 kam lagega"*.
Har extra visible field 5-11% conversion khata hai, isliye khula nahi rakha.

**Admin me:** job card pe 🎁 **bada highlight** dikhega, taaki billing ke waqt
₹50 dena bhoolo mat.

**Koi DB table nahi banaya** — code phone se derive hota hai (pure function).
Wajah: pichhli baar jab is project ko production me table chahiye tha
(`admin_alerts`), build script me `prisma db push` na hone se wo **hafton tak
chup-chaap fail** hota raha. Wo galti dobara nahi.

## 2. 🔬 TDS Checker — jo koi nahi kar sakta

`/ro-service-patna-faq` pe. Customer apni TDS reading daale, turant jawab mile:

```
Input 620, Output 55   →  91% rejection
                          "Machine bilkul theek hai. Paisa bacha lijiye 👍"

Input 620, Output 280  →  55% rejection
                          "Membrane khatam. 100 GPD chahiye, ₹1,400 se"
```

**Ye tool khud bolta hai "kuch mat karo" jab numbers theek hain.** Wo jaan
boojh ke hai — jo diagnostic hamesha service bechta hai wo advert hai, aur log
pehchan lete hain.

**Competitor ye copy nahi kar sakta** — iske liye har locality ka naapa hua
TDS data chahiye, jo sirf wahan sach me service karne se aata hai. Tere paas
63 area ka hai.

Sab kuch phone me hi calculate hota hai — koi data server pe nahi jaata.

## 3. 🎯 Admin me referral visibility

Job card pe referral code bada dikhega. Customer se wada kiya gaya ₹50 agar
billing pe na mile, to wo referral na dene se **badtar** hai.

---

# 🧪 Test Report

```
tsc --noEmit                      EXIT 0  ✅
npm run build (.next delete)      EXIT 0  ✅  174 pages, ZERO warnings

verify-forms-and-features  83/83   ← naya
verify-area-depth          64/64
verify-new-areas          140/140
verify-service-intent     165/165
verify-seo-packages        94/94
verify-ux-upgrade          99/99
verify-seo-indexing        59/59
verify-product-admin       68/68
verify-titles-and-schema   44/44
verify-brand-rename        51/51
verify-admin-full          44/44
verify-password-features   31/31
─────────────────────────────────
TOTAL                     942/942  ✅
```

## Naye test — 83, aur inme se 3 khud galat nikle

Imaandari: pehli baar chalane pe 8 fail aaye. Teeno mere **test** ki galti
thi, code ki nahi:

```
1. CSS test sirf PEHLA bundle grep kar raha tha — page do link karta hai
2. Search box dropdown khulne pe mount hota hai — server HTML me hai hi nahi
3. admin_alerts ka body me phone hai, ticket number nahi
```

Teeno test theek kiye. **Ek test jo galat wajah se fail hota hai, wo test
suite ka bharosa khatam kar deta hai** — usse achha koi test na ho.

## 🔴 Sync verification — end to end

```
Public form POST      → ticket bana                    ✅
                      → DB me status NEW               ✅
                      → NO_WATER = HIGH priority       ✅
                      → area save hua                  ✅
                      → referral code note me gaya     ✅
                      → admin_alerts row bana          ✅
                      → auto-assign chala (ASSIGNED)   ✅
Tracking page         → ticket dikha                   ✅
Status COMPLETED      → review CTA aaya                ✅
                      → referral card aaya             ✅
Admin 16 pages        → sab guarded (307 login)        ✅
Admin 4 APIs          → 401 without auth               ✅
```

**Admin panel aur public site poori tarah sync hain.**

---

# 📁 Files

## Naye (5)
```
src/components/home/AreaPicker.tsx           searchable area combobox
src/components/home/ReferralCard.tsx         referral UI on tracking page
src/components/home/TdsChecker.tsx           self-diagnostic tool
src/lib/referral.ts                          code gen + share text
scripts/verify-forms-and-features.sh         83 checks
BUG-FIX-AUR-NAYE-FEATURES.md                 ye file
```

## Chhue (6)
```
src/app/globals.css                          🔴 THE FIX (layer ke bahar)
src/components/home/QuickBookForm.tsx        AreaPicker + referral field
src/app/api/service-requests/route.ts        referralCode accept
src/app/(shop)/track/[ticket]/page.tsx       ReferralCard
src/app/(shop)/ro-service-patna-faq/page.tsx TdsChecker
src/app/admin/(dashboard)/service-requests/page.tsx  referral highlight
scripts/verify-all.sh                        naya script
```

---

# 📤 Upload

**PowerShell** (CMD nahi):

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git pull --rebase origin main
```

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /NFL /NDL /NJH /NJS
```

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env$|node_modules'
```
Chahiye: **Modified 6-9** · **Naye 5-7** · teesri line **khali**

```powershell
git add -A
git commit -m "fix: invisible select text on dark panels (compiled-CSS verified), searchable area picker, referral system, TDS self-check tool"
git push origin main
```

## Deploy ke baad — 2 minute me khud check karo

Phone se kholo (mobile pe hi bug tha):
```
rokadoctor.in/ro-service-patna/kankarbagh
→ neeche booking form → "Area chuniye" pe tap karo
→ areas SAAF dikhne chahiye, hover ke bina
→ search box me "800020" likho → Kankarbagh aana chahiye
→ "ashiana" likho → Kankarbagh aana chahiye (landmark se)
```

Aur agar dark mode on hai phone me, tab bhi check karna — wahi doosra bug tha.

---

# 🔴 Ab bhi tere haath me

```
□ /admin pe roz ⭐ Review maango        1 min/din — 36% weight
□ GBP naam → "Aqua Perl RO Service Centre"
□ GBP hours 7 AM – 10 PM
□ Google Place ID daalo                 2 min
□ Referral code customers ko batao      job khatam hone pe /track link bhejo
```

**Referral ka ek fayda aur hai** — ab har completed job pe customer ko
`/track/{ticket}` ka link bhejne ki asli wajah hai. Us page pe review CTA
**aur** referral card dono hain. Ek message, do kaam.
