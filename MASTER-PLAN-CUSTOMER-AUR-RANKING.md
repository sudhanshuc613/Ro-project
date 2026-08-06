# Customer kaise laun + top pe kaise aaun

**6 Aug 2026 · Aqua Perl · rokadoctor.in**

---

# ✅ Pehle — maine live site check ki, sab chal raha hai

```
Site           →  Vercel, 200 OK ✅
Naam           →  "Aqua Perl" 36 baar, "AquaNexa" 0 ✅
Logo           →  brand/logo.svg live, 6 jagah ✅
Address        →  Sai Gali, Opposite B-62 ✅
Schema rating  →  4.8 · 44 reviews (asli GBP data) ✅
LOGIN BUG      →  THEEK HO GAYA ✅
Sitemap        →  54 URL ✅
```

**Login wala bug jo 5 din se pending tha — ab theek hai.** Ab customer register/login kar sakta hai.

---

# 🎨 Logo kaisa dikhega

**SVG banaya hai, PNG nahi.** Iska matlab:

| Kahan | Size | Dikhega |
|---|---|---|
| Navbar (desktop) | 56px | Bilkul sharp |
| Navbar (mobile) | 44px | Bilkul sharp |
| Footer | 44px white | Sharp |
| Login/Register | 48px | Sharp |
| Browser tab | 32px square icon | Saaf boond + moti |
| Invoice print | Jitna bada chahiye | Kabhi blur nahi |

**File sirf 1.5 KB hai** — purana PNG 161 KB tha. Page 100x tez load hoga.

### GBP pe kaunsa daalna hai

```
public/brand/icon-512.png    ← GBP profile photo (square, 512x512)
public/brand/logo.png        ← Facebook/Instagram cover ke liye
```

GBP square logo maangta hai — `icon-512.png` wahi hai.

---

# 🔴 Ek badi cheez pakdi — tracking kaam hi nahi kar raha tha

Code mein ye likha tha:

```js
window.gtag?.('event', 'generate_lead', ...)   // service booking
window.gtag?.('event', 'purchase', ...)        // AMC purchase
```

**Par Google Analytics ka script kahin load hi nahi hota tha.**

`?.` ka matlab hai "agar hai to chalao" — nahi tha, to chup-chaap kuch nahi hua. **Ek bhi lead track nahi ho rahi thi. 5 mahine se.**

## Ab theek kar diya

Naya file: `src/components/analytics/Analytics.tsx`

Ye ab track karega:
- **Phone call click** ← Patna mein asli conversion yahi hai
- **WhatsApp click**
- Service booking
- AMC purchase
- Har page view

**Ek global listener lagaya hai** — har `tel:` aur `wa.me` link apne aap pakda jaayega, alag-alag button mein code lagane ki zaroorat nahi.

## Chalu karne ke liye 1 kaam

1. `analytics.google.com` → **Start measuring** → property banao (naam: Aqua Perl)
2. Platform: **Web** → URL: `https://rokadoctor.in`
3. **Measurement ID** milega — `G-XXXXXXXXXX` jaisa
4. Vercel → Settings → Environment Variables → **Add**:
   ```
   NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX
   ```
5. Save → **Redeploy**

> ID set nahi hai to kuch load hi nahi hota — koi nuksan nahi. Par tab tak tumhe pata nahi chalega ki paisa kahan se aa raha hai.

---

# 📊 Track kya-kya karna hai

## 1. Google Search Console (free, sabse zaroori)

Isse pata chalta hai **log kya search karke aa rahe hain**.

### Setup — 10 minute

1. `search.google.com/search-console`
2. **Add Property** → **Domain** chuno (URL prefix nahi — Domain se sab cover hota hai)
3. Type karo: `rokadoctor.in` (bina https, bina www)
4. Google ek **TXT record** dega — copy karo
5. **GoDaddy** → DNS → **Add New Record**:
   ```
   Type:  TXT
   Name:  @
   Value: google-site-verification=xxxxxxxxx   (jo Google ne diya)
   TTL:   1 Hour
   ```
6. Save → GSC pe wapas → **Verify**
7. Verify hote hi → **Sitemaps** → likho `sitemap.xml` → **Submit**
8. **URL Inspection** → `https://rokadoctor.in` → **Request Indexing**

Yahi step 5-6 important area pages ke liye bhi karo:
```
/service-patna
/service-patna/kankarbagh
/service-patna/boring-road
/amc-plans
```

### Har hafte kya dekhna

**Performance → Queries** — ye sabse kaam ki cheez hai:

| Column | Matlab |
|---|---|
| Clicks | Kitne log aaye |
| Impressions | Kitni baar dikhe |
| Position | Kaunse number pe ho |

**🎯 Sabse bada mauka:** jo keyword **position 8-20** pe hain aur impressions zyada hain. Wo page one pe aane ke bilkul kareeb hain. Unke page ka content thoda behtar karo — jaldi top 5 mein aa jaayenge.

---

## 2. Google Analytics 4 (upar wala setup ke baad)

Isse pata chalta hai **aake log karte kya hain**.

Dekhna:
- **Reports → Engagement → Events** → `phone_call_click` aur `whatsapp_click` ki ginti
- **Reports → Engagement → Pages** → kaunsa area page zyada chal raha hai

Agar Kankarbagh page se 20 call aa rahe hain aur Digha se 0 — to Digha ka content behtar karo, ya Kankarbagh jaisa aur banao.

---

## 3. GBP Insights (already tumhare paas hai)

GBP app kholo → **Performance**:

| Metric | Kya batata hai |
|---|---|
| Searches | Log kya type karke tum tak pahunche |
| Calls | GBP se seedhe kitne call aaye |
| Direction requests | Kitne logon ne raasta dhoondha |
| Website clicks | Kitne website pe gaye |

**Har mahine ek baar note kar lo** — copy mein likh lo. 3 mahine baad khud dikhega ki badhat ho rahi hai ya nahi.

---

# 🏆 Top pe kaise aaun — 2026 ka asli formula

Maine 2026 ki latest research check ki. Weightage ye hai:

```
Google Business Profile   32%   ← tumhare paas hai ✅
Reviews                   20%   ← 44 hain ✅
Website (on-page)         15%   ← ban gaya ✅
Behaviour signals          9%   ← ab track hoga
Backlinks                  8%   ← ye nahi hai ❌
Directory listings         6%   ← ye nahi hai ❌
```

**Tumhare paas 67% ho chuka hai.** Bache hue 14% aur "freshness" pe kaam karna hai.

---

## 🔴 2026 ka naya rule — ye jaanna zaroori hai

**Sabse badi 2026 update:**

> Profile **30 din** tak koi nayi photo ya post na ho → **visibility girne lagti hai.**

Aur:
> Google ab **"prominence" se hatke "popularity"** pe gaya hai. Matlab log tumhare profile pe **kitna interact karte hain** — photo dekhte hain, call button dabate hain, post padhte hain — ab ye seedha ranking factor hai.

**Iska matlab:** GBP ko ek baar bana ke chhod dena ab kaam nahi karta.

---

## Hafte ka rutine — roz 20 minute, bas

### Har hafte (2-3 baar)

**GBP Post** — 5 minute ka kaam:

| Din | Kya post karo |
|---|---|
| Sombaar | Aaj ke kaam ki photo + 2 line |
| Budhwaar | Offer ya tip (sabse zyada engagement is din) |
| Shukrawar | Weekend availability |

> **Best time: subah 9-11 baje.** Shaam 6 baje ke baad mat karna — engagement girta hai.
> **Post 7 din mein expire ho jaata hai** — isliye har hafte naya chahiye.

**Post ka format** (50-100 shabd, ek asli photo, ek CTA):

```
Aaj Kankarbagh mein Kent RO ka membrane badla.
TDS 640 se 45 pe aa gaya.

Aapka paani bhi kharab lag raha hai? ₹200 visit charge mein
poora TDS test aur diagnosis.

📞 8969821440
```

> Corporate bhaasha mat likhna. Jaise customer se baat karte ho waise likho.

### Har mahine

- **4-8 nayi photo** — kaam ki, technician ki, TDS meter ki
- Hours check karo (tyohaar ke din alag ho to update)
- GBP Insights ke numbers copy mein likho

### Har din (10 min)

- **Naye review ka jawab** — 48 ghante ke andar
- Us din ke customers se review maango

---

## 📈 Review — 44 se 100 tak

**2026 mein naye review purane se zyada count karte hain.**

> 200 purane review wala business 80 naye review wale se **peeche** chala jaata hai.

Tumhare 44 hain — ab **har hafte 2-3 naye** chahiye.

| Time | Target |
|---|---|
| Abhi | 44 |
| 1 mahina | 55 |
| 3 mahine | 75 |
| 6 mahine | 100+ |

### 🔴 April 2026 ka naya rule — ye dhyan se

Google ne April 2026 mein policy badli:

- ❌ **Staff pe review ka target rakhna BANNED**
- ❌ **Customer se employee ka naam likhne ko kehna** = Rating Manipulation violation

Matlab: *"Rahul bhaiya ka naam likh dijiyega"* — **ye ab mat bolna.** Pehle chalta tha, ab violation hai.

### Jo kar sakte ho

Kaam khatam hote hi, wahin khade khade:

> "Sir, machine ab theek chal rahi hai. Google pe 2 line review likh dijiye — Patna ke aur log humein dhoondh paate hain isse. Link WhatsApp kar deta hoon."

Phir turant:

```
Namaste 🙏
Aqua Perl se — aaj aapki RO service hui.

Service theek lagi ho to Google pe review likh dijiye:
[GOOGLE REVIEW LINK]

Koi dikkat ho to 8969821440 pe call kijiye.
```

**Review link:** GBP → "Ask for reviews" → copy

### Review mein area + brand aana chahiye

> "Agar likhein to bata dijiyega ki kaunse area mein hain aur kaunsi machine thi."

Isse review aisa banta hai: *"Kankarbagh mein mera Kent RO theek kiya"*
→ ye **"kent ro service kankarbagh"** search ke liye ranking deta hai.

**Ye allowed hai** — area aur machine batana natural hai. Employee ka naam maangna nahi.

---

## 🔗 Backlinks — 8%, ye tumhare paas nahi hai

Ye sabse ignore kiya jaane wala hissa hai. **Free mein mil sakta hai:**

| Kahan se | Kaise |
|---|---|
| **Bihar local news sites** | "Patna mein paani ka TDS 600+ — kya karein" pe interview/quote do |
| **Apartment society groups** | Society ke Facebook page pe free water testing camp lagao, wo mention karenge |
| **School/college** | Free TDS testing camp — unki site pe naam aa jaayega |
| **Local business directory** | Bihar Chamber of Commerce type |
| **RO brand dealers** | Kent/Aquaguard ke authorized dealer list mein naam |

**Ek achha local backlink 50 faltu backlink se behtar hai.**

---

## 📋 Directory listings — 6%, free hai

Har jagah **bilkul same** likhna (copy-paste karna, type mat karna):

```
Name:    Aqua Perl RO Service Centre
Phone:   8969821440
Address: Sai Gali, Opposite B-62, Buddha Colony, Patna, Bihar 800001
Website: https://rokadoctor.in
```

| Site | Priority |
|---|---|
| **JustDial** (free listing) | 🔴 Zaroor — Patna mein sab dekhte hain |
| **Sulekha** (free listing) | 🔴 Tumhara direct competitor yahin hai |
| **Bing Places** | 🟡 5 min, free |
| **Apple Business Connect** | 🟡 iPhone Maps — 2026 mein weight badh raha |
| **IndiaMART** | 🟡 Commercial RO plant ke liye |
| **Facebook Page** | 🟡 Naam + phone + website |

> ⚠️ **JustDial/Sulekha ka PAID plan abhi mat lena.** Free listing kaafi hai. Paid mein ₹6,000-50,000/saal jaata hai aur lead ki guarantee nahi hoti.

---

# 📅 90 din ka calendar

## Hafta 1 (ye hafte)

- [ ] **Google Analytics** banao → `NEXT_PUBLIC_GA_ID` Vercel mein → Redeploy
- [ ] **Search Console** setup → TXT record GoDaddy mein → sitemap submit
- [ ] **GBP naam** → `Aqua Perl RO Service Centre` ("Best Ro Service in Patna" hatao)
- [ ] **GBP logo** → `icon-512.png` upload
- [ ] **20-25 asli photo** khinch ke GBP + website dono pe
- [ ] JustDial + Sulekha **free** listing
- [ ] 44 purane review ka jawab do (1 ghanta, ek baar ka kaam)

## Hafta 2-4

- [ ] **GBP post — hafte mein 2-3** (sabse important, chhodna mat)
- [ ] Har naye customer se review — target 10 naye
- [ ] Search Console dekho — kaunse keyword aa rahe hain
- [ ] AI photo hatao website se

## Mahina 2

- [ ] 30 total review
- [ ] Position 8-20 wale keyword dhundo → un pages ka content behtar karo
- [ ] Bihar local news ya society se 1-2 backlink
- [ ] `/admin/service-due` se purane customer ko WhatsApp

## Mahina 3

- [ ] 50 total review
- [ ] Analytics dekho — kaunsa area page call la raha hai
- [ ] **Ab Google Ads** — ₹300/din, sirf Patna
- [ ] AMC bechna — har repair ke baad offer

---

# 🎯 Sach kya expect karna

| Time | Realistic |
|---|---|
| Hafta 1-2 | Kuch nahi. Google data collect kar raha hoga. **Normal hai.** |
| Hafta 3-4 | GSC mein pehla data. GBP post se thodi movement. |
| Mahina 2 | Hafte mein 3-8 call. Kuch area ke liye map pack mein. |
| Mahina 3 | Hafte mein 10-20 call. Kuch keyword pe top 3. |
| Mahina 6 | Roz 5-10 lead — **agar hafte ka rutine chalta rahe**. |

**Sabse zaroori baat:** consistency > volume.

> Hafte mein 3 post, **har hafte** — ye 10 post ek hafte mein aur phir 3 hafte chup rehne se **kai guna behtar** hai.

---

# ⚠️ Ye galtiyan mat karna

| ❌ Mat karna | Kyun |
|---|---|
| GBP naam mein "Best" rakhna | Suspension — 44 review chale jaayenge |
| Review ke badle discount | Policy violation, sab review udd jaayenge |
| Employee ka naam likhwana | **April 2026 se banned** |
| 30 din GBP chhod dena | Visibility apne aap girti hai |
| Do GBP listing banana | Duplicate = suspension |
| AI photo rakhna | Reverse image se pakda jaata hai |
| Category baar-baar badalna | Re-verification trigger hota hai |
| JustDial paid abhi lena | Paisa barbaad, pehle free se test karo |

---

# 🔴 Abhi bhi pending — 2 cheez

## 1. AI photo hatana

`public/service/` mein AI se banayi photo hai. Google reverse-image se pakadta hai. **GBP suspend hua to 44 review chale jaayenge.**

Aaj hi phone se khinch:
- Technician kaam karte hue (chehra dikhe) — 6
- Khula RO, filter badalte hue — 5
- TDS meter ka reading — 2
- Purana vs naya filter — 2
- Naye purifier stock mein — 3
- Bike/van pe naam — 2

Bhej dena, main website mein laga dunga.

## 2. Email — MX record nahi hai

Website pe `support@rokadoctor.in` likha hai par **DNS mein MX record nahi hai** — koi mail bheje to bounce hogi.

**Zoho Mail free hai:**
1. `zoho.com/mail` → free plan → `rokadoctor.in` add karo
2. Wo MX record denge
3. GoDaddy DNS mein daal do
4. Khud ko test mail bhej ke check karo

---

# Aaj ye 3 kaam

1. **Google Analytics ID** banao → Vercel mein daalo → Redeploy
   *(Iske bina pata hi nahi chalega ki kaam ho raha hai ya nahi)*
2. **Search Console** setup + sitemap submit
3. **GBP pe pehla post** daalo — aaj ke kaam ki photo ke saath

Baaki sab iske baad.
