# Ab aage kya — 7 Aug 2026

---

# ✅ Jo ho chuka hai (maine verify kiya)

```
Sitemap submitted                    ✅
35/35 area pages live (200 OK)       ✅
GA4 G-JP9HDZ9SE3 live                ✅
phone_call_click tracking live       ✅
Search Console verified              ✅
```

> **Note:** GA SSR HTML mein nahi dikhta kyunki wo client-side load hota hai
> (`afterInteractive`) aur sirf `rokadoctor.in` par chalta hai. Maine JS bundle
> check kiya — 3 chunks mein `G-JP9HDZ9SE3` maujood hai. Sab theek hai.

---

# 🔴 STEP 1 — Aaj: 5 URL ka indexing maango (10 minute)

Search Console mein **URL Inspection** — sabse upar wali search bar
("Inspect any URL in rokadoctor.in").

## Kaise karna

1. Search bar mein **poora URL paste** karo
2. **Enter** dabao
3. 10-20 second Google check karega
4. **"REQUEST INDEXING"** button dikhega → **dabao**
5. 1-2 min → *"URL added to a priority crawl queue"* aayega
6. **Agla URL** — same tarika

## Aaj ye 5

```
https://rokadoctor.in/service-patna
https://rokadoctor.in/service-patna/buddha-colony
https://rokadoctor.in/service-patna/kurji
https://rokadoctor.in/service-patna/anisabad
https://rokadoctor.in/service-patna/rukanpura
```

> **Buddha Colony sabse pehle isliye** — tera GBP wahin hai. Proximity + page
> ka combo sabse jaldi rank karta hai.

## Kal ye 5

```
https://rokadoctor.in/service-patna/khajpura
https://rokadoctor.in/service-patna/lohia-nagar
https://rokadoctor.in/service-patna/shastri-nagar
https://rokadoctor.in/service-patna/kidwaipuri
https://rokadoctor.in/service-patna/mahendru
```

## Parso ye 5

```
https://rokadoctor.in/service-patna/mithapur
https://rokadoctor.in/service-patna/bankipur
https://rokadoctor.in/service-patna/gardanibagh
https://rokadoctor.in/service-patna/keshri-nagar
https://rokadoctor.in/service-patna/hanuman-nagar
```

## Uske parso ye 4

```
https://rokadoctor.in/service-patna/raja-bazar
https://rokadoctor.in/service-patna/rajapur
https://rokadoctor.in/service-patna/sheikhpura
https://rokadoctor.in/service-patna/new-punaichak
https://rokadoctor.in/service-patna/lodipur
```

> Roz **10 URL** ki limit hai, isliye 5-5 karke safe rehna.
> Baaki apne aap sitemap se crawl honge — 1-2 hafte.

---

# 🔴 STEP 2 — Aaj: GBP mein naye area jodo (5 minute)

GBP app ya `business.google.com` → **Edit profile** → **Location** → **Service area**

**GBP mein sirf 20 area aate hain.** Ye 20 rakho (sabse zyada kaam wale):

```
Buddha Colony      ← tera apna area, pehla
Kankarbagh         Boring Road        Patliputra Colony
Rajendra Nagar     Bailey Road        Kadamkuan
Ashiana Nagar      Rajiv Nagar        Gandhi Maidan
Danapur            Digha              Kurji
Rukanpura          Anisabad           Khajpura
Lohia Nagar        Shastri Nagar      Kidwaipuri
Mithapur
```

> Baaki 15 area ke website pages bane hue hain — wo organic search se
> aayenge. GBP mein sirf top 20 chahiye.

---

# 🔴 STEP 3 — Aaj: GBP post daalo (3 minute)

GBP → **Add update** → ye copy karo:

```
Ab Patna ke 35 ilaakon mein RO service — Buddha Colony, Kurji,
Rukanpura, Anisabad, Khajpura aur baaki sab.

Buddha Colony mein hamari apni shop hai (Sai Gali, opp B-62),
isliye wahan 30 minute mein pahunch jaate hain.

Visit charge sirf ₹200 — ismein TDS test aur poora diagnosis.

📞 8969821440
```

**Photo lagana zaroori hai** — bina photo ke post ka asar aadha ho jaata hai.
Aaj ke kaam ki koi bhi photo chalegi.

---

# 📅 Agle 7 din ka rutine

| Din | Kaam | Time |
|---|---|---|
| Roz | 5 URL indexing maango | 10 min |
| Roz | Naye review ka jawab | 5 min |
| Som/Budh/Shukr | GBP post (photo ke saath) | 5 min |
| Roz | Us din ke customer se review maango | — |

---

# 📊 Kya dekhna hai — kab

## 3 din baad

Search Console → **Sitemaps** → status dekho

```
Success · 73 discovered     ✅ badhiya
Couldn't fetch              ⏳ 1 din aur ruko
```

## 1 hafta baad

Search Console → **Performance** → pehla data aana shuru

Dekho: **Queries** tab — log kya search karke aa rahe hain

## 2 hafte baad

Search Console → **Pages** → kitne page index hue

```
Target: 73 mein se 50+ indexed
```

## 1 mahina baad

**Performance → Queries** → jo keyword **position 8-20** pe hain,
un pages ka content behtar karo. Wo page-1 ke sabse kareeb hain.

---

# 🔴 Ab bhi pending — ye 3 sabse zaroori

## 1. AI photo hatana (SABSE URGENT)

`public/service/` mein AI se banayi photo hai. Google reverse-image se
pakadta hai. **GBP suspend hua to 44 review chale jaayenge.**

Aaj hi phone se khinch:
- Technician kaam karte hue (chehra dikhe) — 6
- Khula RO, filter badalte hue — 5
- TDS meter ka reading — 2
- Purana vs naya filter side-by-side — 2
- Shop ka board / bahar ka view — 3
- Naye purifier stock mein — 3

**Mujhe bhej dena — website mein laga dunga.**

## 2. GBP naam se "Best Ro Service in Patna" hatana

```
ABHI:  Aqua Perl | Ro Service Centre - Best Ro Service in Patna
KARO:  Aqua Perl RO Service Centre
```

Google 2026 mein keyword-stuffed naam pe suspension de raha hai.
Competitor bhi report kar sakta hai.

## 3. Email MX record

`support@rokadoctor.in` pe bheji mail **bounce** hoti hai — MX record
nahi hai. Zoho Mail free hai:
`zoho.com/mail` → free plan → MX record GoDaddy mein daalo

---

# 🎯 Sach — kya expect karna

| Time | Kya hoga |
|---|---|
| 3-7 din | Google naye pages crawl karega |
| 2-3 hafte | Search Console mein impressions |
| 1-2 mahine | Area keyword pe page 2-3 |
| 3-4 mahine | `ro service buddha colony` top 5 |
| 6 mahine | Kai area keyword top 3 |

**Sabse pehle Buddha Colony rank karega.**

---

# Aage kya banwana hai (Phase 3)

Bolo to:

1. **Blog system** — competitor ke 193 posts, tere 0
   Patna-specific topics jo Gurgaon wale likh hi nahi sakte
2. **Rate card page** — har part ka daam (`ro parts price patna`)
3. **Brand × Area pages** — `kent-ro-service-kankarbagh` type

Mera suggestion: **pehle upar wale 3 pending kaam** (photo, GBP naam, email),
phir blog.
