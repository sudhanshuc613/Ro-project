# 🔴 Aadha Push Hua Hai — 3 Minute Me Fix

**10 Sep 2026** · live check kiya

---

# Kya hua

```
✅ robots.txt fix        LIVE HAI    (Allow: /api/media/)
❌ sub-localities        NAHI GAYA
❌ work photos           NAHI GAYA
❌ ImageObject schema    NAHI GAYA
❌ phone in title        NAHI GAYA
```

Live title abhi ye hai:
```
RO Repair in Kankarbagh, Patna — ₹200 Visit | Aqua Perl    ← purana
```

Hona chahiye:
```
RO Service Kankarbagh Patna ₹200 · 8969821440              ← naya
```

## Kyun hua

`robots.ts` ek **nayi-jaisi** file thi to robocopy ne copy kar di. Baaki
**modified** files ko robocopy ne "same" samajh ke skip kar diya.

Ye wahi problem hai jo pehle bhi ho chuki hai. Isliye `/IS /IT` flags hote
hain — par kabhi-kabhi timestamp match hone pe wo bhi skip kar deta hai.

---

# ✅ Fix — PowerShell me ye chala

## BLOCK 1 — dekho abhi kya haal hai

```powershell
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git status --short
git log --oneline -3
```

Agar `git status` khali hai aur last commit me robots wala message hai —
matlab baaki files copy hi nahi hui. Aage badho.

## BLOCK 2 — force copy (purani copy delete karke)

```powershell
Remove-Item "$HOME\Downloads\aqp-new" -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\aquanexa-project.zip" -DestinationPath "$HOME\Downloads\aqp-new" -Force
```

Ab **`/IS /IT /FFT` ke saath** copy karo — `/FFT` timestamp ka 2-second
tolerance deta hai, jo FAT/NTFS mismatch pe skip hone se bachata hai:

```powershell
robocopy "$HOME\Downloads\aqp-new" "C:\Users\SUDHA\Downloads\ro-Project\Ro-project" /E /IS /IT /FFT /NFL /NDL /NJH /NJS
```

## BLOCK 3 — 🔴 CONFIRM karo ki files sach me badli

Ye sabse zaroori step hai. Copy hone ke baad **content check karo**, sirf
git status pe bharosa mat karo:

```powershell
Select-String -Path "src\lib\seo\patna-service-data.ts" -Pattern "SUB_LOCALITIES" | Select-Object -First 1
Select-String -Path "src\components\home\AreaWorkProof.tsx" -Pattern "imageObjectSchema" | Select-Object -First 1
Select-String -LiteralPath "src\app\(shop)\ro-service-patna\[area]\page.tsx" -Pattern "AreaWorkProof" | Select-Object -First 1
Select-String -LiteralPath "src\app\(shop)\ro-service-patna\[area]\page.tsx" -Pattern "absolute: title" | Select-Object -First 1
```

**Chaaron lines me match dikhna chahiye.** Ek bhi khali aaye to mujhe batao.

## BLOCK 4 — status dekho

```powershell
"Modified: " + (git status --short | Select-String '^ M').Count
"Naye:     " + (git status --short | Select-String '^\?\?').Count
git status --short | Select-String '\.env$|node_modules'
```

Chahiye: **Modified 5-8** · **Naye 2-3** · teesri line **khali**

🔴 Agar **Modified 0** aaye to files copy nahi hui — BLOCK 5 chala.

## BLOCK 5 — sirf agar BLOCK 4 me Modified 0 aaya

Manual copy, ek-ek file:

```powershell
$src = "$HOME\Downloads\aqp-new"
$dst = "C:\Users\SUDHA\Downloads\ro-Project\Ro-project"
$files = @(
 "src\lib\seo\patna-service-data.ts",
 "src\components\home\AreaWorkProof.tsx",
 "src\app\(shop)\ro-service-patna\[area]\page.tsx",
 "src\app\(shop)\[intent]\page.tsx",
 "scripts\verify-images-titles.sh",
 "scripts\verify-all.sh",
 "scripts\verify-new-areas.sh",
 "scripts\verify-titles-and-schema.sh"
)
foreach ($f in $files) {
  Copy-Item -LiteralPath "$src\$f" -Destination "$dst\$f" -Force
  "copied: $f"
}
```

Phir BLOCK 3 aur 4 dobara chala.

## BLOCK 6 — push

```powershell
git add -A
git commit -m "SEO: per-area job photos with ImageObject schema, phone in area titles, sub-locality sections"
git push origin main
```

---

# ✅ Deploy ke baad — 2 minute me khud verify

Vercel 🟢 Ready hone ke baad, **incognito** me kholo:

```
rokadoctor.in/ro-service-patna/kankarbagh
```

Ye 3 cheez dikhni chahiye:

1. **Browser tab ka title:**
   ```
   RO Service Kankarbagh Patna ₹200 · 8969821440
   ```
   (purana tha: "RO Repair in Kankarbagh, Patna — ₹200 Visit | Aqua Perl")

2. **Neeche scroll karo** → *"Kankarbagh me hamara kaam"* section, **3 photos**

3. **"Kankarbagh ke andar ye jagah bhi"** section (sub-localities)

---

# 🟡 Ek aur cheez — GSC me robots validate karo

robots.txt fix **live ho chuka hai**. Ab Google ko batana hai:

```
Search Console → Pages → "Blocked by robots.txt" (10 pages)
→ upar "VALIDATE FIX" button dabao
```

Google 1-2 hafte me recheck karega aur wo 10 product images clear ho jayengi.

---

# 📌 Aage ke liye — push ke baad hamesha ye check

Ek line me pata chal jayega ki poora push gaya ya aadha:

```powershell
git show --stat HEAD
```

File count dikhega. Agar 2-3 file hi dikhe jabki 8 badli thi — aadha push hua.
