# 10 Naye Area Pages — 19 Sep 2026

Patna ke andar ke 10 localities jinke liye #1 competitor ke paas page tha, hamare paas nahi.

**73 → 83 area pages.**

---

## Kya banaya

| # | URL | Area | Pincode | Lat, Lng | TDS | Words |
|---|---|---|---|---|---|---|
| 1 | `/ro-service-patna/ashok-rajpath` | Ashok Rajpath | 800004, 800005 | 25.6197, 85.1786 | 340–640 | 2,081 |
| 2 | `/ro-service-patna/bhagwat-nagar` | Bhagwat Nagar | 800026 | 25.5842, 85.1592 | 520–950 | 2,034 |
| 3 | `/ro-service-patna/bmp-colony` | BMP Colony | 800014 | 25.6048, 85.0946 | 290–540 | 2,025 |
| 4 | `/ro-service-patna/ias-colony` | IAS Colony | 801503 | 25.6141, 85.0521 | 820–1300 | 2,085 |
| 5 | `/ro-service-patna/rajbansi-nagar` | Rajbansi Nagar | 800023, 800015 | 25.6026, 85.1089 | 300–560 | 2,026 |
| 6 | `/ro-service-patna/rps-more` | RPS More | 801503 | 25.6170, 85.0496 | 780–1250 | 2,071 |
| 7 | `/ro-service-patna/salimpur-ahra` | Salimpur Ahra | 800003 | 25.6122, 85.1531 | 360–680 | 2,020 |
| 8 | `/ro-service-patna/shivala` | Shivala | 801503 | 25.6234, 85.0612 | 740–1180 | 2,030 |
| 9 | `/ro-service-patna/transport-nagar` | Transport Nagar | 800026 | 25.5871, 85.1860 | 540–980 | 2,002 |
| 10 | `/ro-service-patna/zero-mile` | Zero Mile | 800027 | 25.5759, 85.1545 | 500–920 | 2,030 |

Har pincode aur coordinate **asli research** se — India Post records, 99acres/SquareYards locality data, onefivenine, Wikipedia. Banaye hue nahi.

---

## Jo JAAN-BOOJH KAR nahi banaye — 6

| Area | Doori | Kyu nahi |
|---|---|---|
| Sampatchak | ~12 km | radius ke kinare |
| Didarganj | ~15 km | radius ke bahar |
| Punpun | ~20 km | radius ke bahar |
| Fatuha | ~25 km | radius ke bahar |
| Naubatpur | ~25 km | radius ke bahar |
| Bihta | ~30 km | alag town |

**Competitor ne inke page banaye hain. Hum nahi banayenge jab tak tu confirm na kare ki tu wahan jaata hai.**

Jahan hum jaate nahi wahan page = customer call karega → mana karna padega → bura review → Map Pack ranking girti hai. Map Pack se 44% clicks aate hain. Ye risk 6 extra pages ke liye lene layak nahi.

---

## 🔴 Competitor ka asli sach — maine unke pages scan kiye

Unke 10 area pages download karke compare kiye:

```
roservicecentrepatna.in ke area pages
  avg overlap : 99.3%
  max overlap : 99.6%
  words       : 1,479 – 1,480  (sab byte-identical)
```

**Unke area pages 99.3% identical hain.** Sirf naam badalta hai:

```
H1: RO Service Centre Ashok Rajpath Patna :The Most Reliable RO Service
H1: RO Service Centre BMP Colony Patna :The Most Reliable RO Service
H1: RO Service Centre Zero Mile Patna :The Most Reliable RO Service
```

Ye textbook **doorway pages** hain. Google ka apna doorway test: *"agar jagah ka naam hata do, kya page ab bhi kaam ka hai?"* Unke case me jawab **nahi** hai.

### Hamare naye 10

```
avg overlap : 71.1%
max overlap : 83.7%     (ratchet limit 84% — PASS)
words       : 2,002 – 2,085
```

Har page me apna TDS number, apna pincode, apna landmark, apna asli fault pattern:

- **Ashok Rajpath** — SMPS failure (voltage, hostel belt)
- **Bhagwat Nagar** — membrane scaling (hard borewell)
- **BMP Colony** — low inlet pressure (purane govt quarters)
- **IAS Colony** — early membrane exhaustion (820–1300 ppm)
- **Rajbansi Nagar** — perished O-rings (8-10 saal purane units)
- **RPS More** — pre-filter choking (construction sediment)
- **Salimpur Ahra** — reject-line leakage (upper floors)
- **Shivala** — tank sediment carry-over (shared underground tank)
- **Transport Nagar** — sediment candle loading (dust belt)
- **Zero Mile** — low delivered pressure (bypass towers)

**Hum unki nakal nahi kar rahe. Hum wo kar rahe hain jo unhone nahi kiya.**

---

## 🔴 Do duplicate pakde — theek kiye

`Ashok Rajpath` aur `Transport Nagar` pehle `ADDITIONAL_AREAS` list me the (hub pe "yahan bhi jaate hain" text). Ab inke apne page hain.

Ek hi naam dedicated page pe **aur** also-served list me = Google ke liye do competing surfaces = doorway signal.

**Dono naam `ADDITIONAL_AREAS` se hata diye.** 16 → 14.

### Aur ek galti jo maine ki, aur pakdi

Pehle maine ye comment likha tha:

```ts
/* 'Transport Nagar' aur 'Ashok Rajpath' yahan se HATAYE gaye. */
```

`verify-new-areas.sh` (test A12) us block ke saare quoted strings padhta hai — comment aur data me farq nahi karta. Mere comment ke quoted naam **data samajh liye gaye**, aur test ne `CLASH: 2` diya.

Test sahi tha, mera comment galat jagah tha. Comment array ke **bahar** le gaya aur usme quotes hata diye. Ab `CLASH: 0`.

Comment me warning bhi likh di taaki agli baar ye galti na ho.

---

## Test report

```
Clean build (.next delete)   : EXIT 0, zero warning
Test suite                   : 1109/1109 PASS, ZERO FAIL

  verify-area-depth          : 64/64   ← DOORWAY RATCHET pass
  verify-new-areas           : 140/140 ← ADDITIONAL_AREAS clash 0
  verify-h1-keyword          : 66/66   ← sitemap-driven sweep
  verify-sitemap-lastmod     : 8/8
  (baaki 13 scripts sab pass)

Sitemap                      : 132 → 142 URLs, area 73 → 83
Naye 10 sitemap me           : 10/10 ✅
Sab 83 area pages            : HTTP 200, zero glue, zero problem
Admin security               : 11/11 guarded, 0 leak
Booking (naye area se)       : POST 201 → SRV-2026-00001 → cleanup ✅
Content overlap              : 71.1% avg / 83.7% max  (limit 84%)
```

---

## Kya badla

```
[BADLI] src/lib/seo/patna-service-data.ts   140,115 → 154,137
          + 10 naye SERVICE_AREAS entries
          − 2 naam ADDITIONAL_AREAS se (ab unke apne page hain)
[NAYI]  NEW-AREAS-19SEP.md
```

**Sirf ek code file.** Koi existing area nahi chhua, koi page delete nahi hua, images haath nahi lagaye.

---

## Rollback

Vercel → Deployments → pichhla 🟢 Ready → ⋯ → Promote to Production (30 sec)
