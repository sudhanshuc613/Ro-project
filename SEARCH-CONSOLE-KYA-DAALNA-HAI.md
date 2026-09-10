# 🔍 Search Console — Kaun Kaun Sa Link Daalna Hai

**9 Sep 2026** · live measure kiya · **126/126 URL working, 0 broken**

---

# ✅ Pehle: technical side bilkul clean hai

Maine saari **126 URL** Googlebot ban ke kholi. Result:

```
checked            : 126
HTTP errors        : 0
noindex tag        : 0     ← koi page block nahi
missing canonical  : 0
galat canonical    : 0     ← har page khud ko point karta hai
title missing      : 0
thin (<300 words)  : 0     ← ek bhi patla page nahi
```

**Matlab Google ko rokने wali koi cheez nahi hai.** Jo index nahi hua wo
sirf isliye ki Google ne abhi tak crawl nahi kiya — technical problem nahi.

Aur sitemap bhi poora hai: site ke **126 internal link me se 125 sitemap me**
hain (126th Cloudflare ka email-protection link hai, wo nahi hona chahiye).

---

# 🔴 Sach — main tujhe ye NAHI bata sakta

Tune poocha *"kaun kaun sa index nahi hai"*. Imaandari se:

**Ye sirf tere Search Console account me dikhta hai. Main bahar se nahi**
**naap sakta.** Google `site:` query ko scrapers ke liye block karta hai,
aur DuckDuckGo ka index Google ka index nahi hai.

Jo koi bhi tujhe bina tere GSC ke "ye page index nahi hai" bataye — wo
guess kar raha hai.

## 2 minute me tu khud nikal sakta hai

```
search.google.com/search-console
  → left menu → Pages  (ya "Indexing → Pages")
  → "Why pages aren't indexed" table dikhega
  → har reason pe click karke exact URL list milegi
```

Wahan jo reason dikhe uska matlab:

| Reason | Matlab | Kya karna |
|---|---|---|
| **Discovered – currently not indexed** | Google ko URL pata hai, abhi crawl nahi kiya | Wait + Request Indexing |
| **Crawled – currently not indexed** | Crawl kiya, index karne layak nahi laga | Content aur strong karo, internal link badhao |
| **Duplicate without user-selected canonical** | Google ko doosra page same laga | 🔴 Mujhe batao, ye asli problem hai |
| **Page with redirect** | Purane `/service-patna/x` URL | ✅ Normal hai, ye 308 hain |
| **Excluded by noindex** | Block hai | 🔴 Mujhe batao — abhi 0 hai |
| **Soft 404** | Google ko khali laga | 🔴 Mujhe batao |

**Us table ka screenshot bhej de — main exact bata dunga kya karna hai.**

---

# 📋 Ab ye list — priority order me

URL Inspection me daalo → **Request Indexing**. Roz **10-12 se zyada mat**
**karna**, Google daily quota lagata hai.

---

## 🔴 DIN 1 — naye service page (8)

Ye sabse pehle. Transactional keyword hain, sabse jaldi paisa denge.

```
https://rokadoctor.in/ro-services-patna
https://rokadoctor.in/ro-service-patna-faq
https://rokadoctor.in/ro-installation-patna
https://rokadoctor.in/ro-amc-patna
https://rokadoctor.in/ro-repair-patna
https://rokadoctor.in/ro-filter-change-patna
https://rokadoctor.in/ro-membrane-replacement-patna
https://rokadoctor.in/commercial-ro-service-patna
```

## 🔴 DIN 2 — sabse bade area (12)

```
https://rokadoctor.in/ro-service-patna/sri-krishna-puri
https://rokadoctor.in/ro-service-patna/machhuatoli
https://rokadoctor.in/ro-service-patna/lohanipur
https://rokadoctor.in/ro-service-patna/naya-tola
https://rokadoctor.in/ro-service-patna/jakkanpur
https://rokadoctor.in/ro-service-patna/keshari-nagar
https://rokadoctor.in/ro-service-patna/ag-colony
https://rokadoctor.in/ro-service-patna/bahadurpur
https://rokadoctor.in/ro-service-patna/anandpuri
https://rokadoctor.in/ro-service-patna/indrapuri
https://rokadoctor.in/ro-service-patna/exhibition-road
https://rokadoctor.in/ro-service-patna/fraser-road
```

## DIN 3 — agle 12 area

```
https://rokadoctor.in/ro-service-patna/bhootnath-road
https://rokadoctor.in/ro-service-patna/jagdeo-path
https://rokadoctor.in/ro-service-patna/aiims-patna
https://rokadoctor.in/ro-service-patna/beur
https://rokadoctor.in/ro-service-patna/agamkuan
https://rokadoctor.in/ro-service-patna/gulzarbagh
https://rokadoctor.in/ro-service-patna/alamganj
https://rokadoctor.in/ro-service-patna/chitkohra
https://rokadoctor.in/ro-service-patna/marufganj
https://rokadoctor.in/ro-service-patna/begampur
https://rokadoctor.in/ro-service-patna/khemnichak
https://rokadoctor.in/ro-service-patna/sipara
```

## DIN 4 — bache hue area

```
https://rokadoctor.in/ro-service-patna/bataganj
https://rokadoctor.in/ro-service-patna/shivpuri
https://rokadoctor.in/ro-service-patna/rupaspur
https://rokadoctor.in/ro-service-patna/chandmari
https://rokadoctor.in/ro-service-patna/sadikpur
https://rokadoctor.in/ro-service-patna/bairia
https://rokadoctor.in/ro-service-patna/jaganpura
https://rokadoctor.in/ro-service-patna/ram-krishna-nagar
https://rokadoctor.in/ro-service-patna/patel-nagar
https://rokadoctor.in/ro-service-patna/dak-bungalow
https://rokadoctor.in/ro-service-patna/kadamkuan-mahendru
https://rokadoctor.in/ro-service-patna/danapur-cantonment
https://rokadoctor.in/ro-service-patna/saguna-more
https://rokadoctor.in/ro-service-patna/anandpur
```

## DIN 5 — blog + author (E-E-A-T)

```
https://rokadoctor.in/blog
https://rokadoctor.in/about/sudhanshu-choudhary
https://rokadoctor.in/blog/ro-membrane-kab-badalna-chahiye
https://rokadoctor.in/blog/patna-me-tds-kitna-hona-chahiye
https://rokadoctor.in/blog/ro-service-charge-patna-rate-list
https://rokadoctor.in/blog/ro-me-paani-nahi-aa-raha-kya-kare
https://rokadoctor.in/blog/ro-uv-uf-me-kya-farak-hai
```

---

# 📊 Sitemap me kya kya hai — 126 URL

```
area pages       73    ← 63 se 73 hue
brand pages      21
static/hub       15    ← homepage, service hubs, contact, amc…
category pages    6
blog posts        5
product pages     5
author page       1
─────────────────────
TOTAL           126
```

## Sitemap resubmit karo

```
Search Console → Sitemaps → sitemap.xml → Submit
```

Pehle 73 URL tha, ab **126** dikhega. Agar purana number dikhe to **Remove**
karke dobara Submit karo.

---

# ⏱️ Kitna time lagega — sach

```
Request Indexing ke baad:
  1-3 din    Google crawl karega
  3-14 din   index me aayega (naya page hai to zyada)
  4-8 hafte  ranking dikhna shuru
```

**Sab 126 kabhi index nahi honge — aur ye normal hai.** Google har page
index nahi karta. 70-85% index rate ek achhe site ke liye normal hai.

Jo sabse pehle index honge: **service pages** (transactional intent) aur
**bade area** (Kankarbagh, Boring Road). Chhote pockets me time lagega.

---

# 🔴 Jo abhi bhi bacha hai

```
□ /admin pe roz ⭐ Review maango        1 min/din — 36% weight
□ GBP naam → "Aqua Perl RO Service Centre"
□ GBP hours 7 AM – 10 PM
□ Google Place ID daalo                 2 min
□ Test ticket SRV-2026-00008 delete     (maine live test me banaya tha)
```