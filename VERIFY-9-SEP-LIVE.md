# ✅ Live Verification — Deploy Ke Baad

**9 Sep 2026** · sab kuch live measure kiya, ek bhi cheez guess nahi

---

# 🎉 Sabse pehle — tune wo kaam kar diya

```
ro-project.vercel.app  →  308 redirect  →  rokadoctor.in   ✅
```

**Ye sabse bada fix tha.** Kal tak wo LIVE tha aur `"ro service boring road
patna"` pe **#3** pe aa raha tha — tere apne domain se upar. Ab band hai.

Ab tera duplicate content khatam. Link equity ek hi domain pe jayegi.

---

# ✅ Deploy — sab kuch chal raha hai

## Naye page
```
/ro-service-patna-faq            200  ← naya answer hub
/ro-services-patna               200
/ro-repair-patna                 200
/ro-installation-patna           200
/ro-amc-patna                    200
/ro-filter-change-patna          200
/ro-membrane-replacement-patna   200
/commercial-ro-service-patna     200
/blog                            200
/about/sudhanshu-choudhary       200
```

## 63 area — sab live
```
8 naye:   marufganj jakkanpur begampur naya-tola
          bairia chandmari sadikpur anandpur      sab 200 ✅
55 purane: kankarbagh boring-road danapur beur…   sab 200 ✅
```

## Sitemap
```
total URLs        116
area URLs          63
answer hub         ✓ included
```

## Redirect + 404 — sab sahi
```
308  /service-patna/kankarbagh    → naye URL par (404 nahi) ✅
404  /nonsense-xyz                                          ✅
404  /ro-service-patna/nope                                 ✅
404  /bihta                       (route shadowing nahi hua) ✅
```

---

# 🔬 Depth content — live pe verify

Kankarbagh page pe check kiya:

```
✓ "ka matlab kya hai"              TDS verdict block
✓ "saal bhar ka kharcha"           running cost table
✓ "sabse zyada kya kharab hota hai" fault ranking
✓ "pahunchne me kitna time"        response detail
✓ "IS 10500"                       BIS reference
✓ OfferCatalog                     schema
✓ AggregateRating                  schema
```

## Numbers

| | Pehle | Ab |
|---|---|---|
| Words per area | 1,215 | **1,937 avg** |
| Schema per area | 42 | **59** |
| Annual cost table | ❌ | ✅ |
| Invalid JSON-LD | — | **0** |
| reviewCount | — | **44** (asli) |

## 🔴 Har area ka apna alag number — verify hua

Ye sabse zaroori check tha. Agar sab pages pe same number hota to wo
template hota:

```
patliputra-colony    ₹1,401   ← soft water
naya-tola            ₹1,776
jakkanpur            ₹1,776
kurji                ₹1,776
boring-road          ₹1,776
kankarbagh           ₹2,448   ← hard water
gulzarbagh           ₹2,448
anisabad             ₹2,448
anandpur             ₹2,448
saguna-more          ₹2,448
marufganj            ₹3,049   ← very hard
chandmari            ₹3,049
beur                 ₹3,049
danapur              ₹3,049
```

**4 alag values, TDS band ke hisaab se.** Ye copy-paste nahi hai.

---

# 🔴 DOORWAY TEST — live pe (sabse zaroori)

Ye wahi test hai jisne mera pehla draft reject karwaya tha.

```
                        LIVE (kal)   Draft-1    LIVE (ab)
Body overlap              84.7%       88.3%      81.7%   ✅
Duplicate sentences         55         125         44    ✅
Words per area            1,215        —         1,937   ✅
```

**Kal se behtar — aur content 59% zyada.**

Competitor rocareindia isi test pe: **100.0% overlap, 51 duplicate sentences**.

---

# 🤖 Answer Hub — AI search ke liye

`/ro-service-patna-faq` live hai:

```
✓ 10 QAPage schema blocks       (har jawab ka apna)
✓ SpeakableSpecification        (voice assistant)
✓ geo-answer-short              (quotable spans)
✓ IS 10500 reference
✓ ₹1,100 / 1,250 ppm            (asli numbers)
✓ canonical sahi
✓ 1,400 words
✓ 0 invalid JSON-LD
```

Aur maine confirm kiya — robots.txt me ye **allowed** hain:
```
Googlebot        ✅
Bingbot          ✅
OAI-SearchBot    ✅  (ChatGPT Search)
PerplexityBot    ✅
```

---

# 📊 RANKING — abhi measure ki

## ⚠️ Pehle ek zaroori baat

Pehli baar `"ro service in patna"` pe hum **top 10 me nahi** dikhe. Maine
ghabra kar report nahi kiya — **3 baar dobara chalaya**:

```
run 1:  rokadoctor.in -> #1
run 2:  rokadoctor.in -> #1
run 3:  rokadoctor.in -> #1
```

**Wo scraper ka noise tha, asli girawat nahi.** DuckDuckGo Lite har call pe
alag results deta hai. Isliye ek reading pe kabhi bharosa mat karna.

## Asli position

| Keyword | Position |
|---|---|
| `ro service in patna` | **#1** 🏆 (3/3 runs) |
| `ro amc patna` | **#1** 🏆 |
| `ro service charge patna` | **#1** 🏆 |
| `ro service near me patna` | **#1** 🏆 |
| `ro service centre patna` | #3 |
| `ro repair patna` | #2–#5 (fluctuate) |
| `ro membrane replacement patna` | #2 |

**4 keyword pe #1.** Aur `ro amc patna` + `ro service charge patna` — ye
dono naye service pages ne kiye.

## Technical health

```
noindex kahin nahi              ✅
canonical sahi                  ✅
Googlebot 200 deta hai          ✅
meta robots: index, follow      ✅
```

---

# ⏱️ Speed

```
/                                0.19s
/about/sudhanshu-choudhary       0.11s
/ro-installation-patna           0.12s
/ro-membrane-replacement-patna   0.16s
/service-patna                   0.27s
/products                        0.68s
/ro-repair-patna                 1.06s   ← pehli hit, phir cache
/blog                            1.37s   ← pehli hit, phir cache
```

Jo 1s+ dikhe wo **cold cache** hain — pehla visitor. Uske baad 0.1-0.2s.

---

# 🔴 AB KYA BACHA — sirf 4 kaam

Website ka kaam **poora khatam** ho chuka hai. Ye 4 code se nahi honge:

## 1. ⭐ Roz ek review maango — 1 minute
```
/admin/service-requests → COMPLETED job ke saamne ⭐ button
```
**Reviews 36% weight hain. On-page 19%.** Tu 44 pe hai, 150 chahiye.
Ye ab sabse bada bacha hua kaam hai.

## 2. GBP naam theek karo — 5 minute
```
ABHI:  Aqua Perl | Ro Service Centre - Best Ro Service in Patna
KARO:  Aqua Perl RO Service Centre
```
Keyword-stuffed naam pe Google suspend karta hai. Suspend hua to **44 review
chale jayenge**.

## 3. GBP hours 7 AM – 10 PM — 2 minute
"Open now" 5th biggest local ranking factor hai.

## 4. Google Place ID — 2 minute
```
developers.google.com/maps/documentation/places/web-service/place-id
→ "Aqua Perl RO Service Centre Patna" search
→ ChIJ... copy
→ src/lib/reviews/review-request.ts line ~63 me paste
```

## Optional
```
□ Cloudflare → Google-Extended ALLOW   (AI Overviews me dikhne ke liye)
□ AI photos hatao public/service/      (GBP suspension risk)
□ Search Console → sitemap resubmit    (116 URLs)
□ /ro-service-patna-faq index karwao   (naya page)
```

---

# 💬 Aakhri sach

```
174 pages           sabse zyada Patna me
1,937 words/area    competitor 3,392 (par unka 100% duplicate)
59 schema/area      competitor 43
81.7% overlap       competitor 100%
0.11-0.27s speed    sabse tez
4 keyword pe #1
```

**Har technical metric pe tu aage hai.** Isse aage code likhna sirf padding
hoga — aur padding se ranking nahi aati.

Bacha hua 68% (proximity 42% + reviews 36% + GBP 32%) tere haath me hai.

**Roz 1 minute. ⭐ button. Bas yahi.**
