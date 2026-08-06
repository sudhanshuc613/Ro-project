# CMD se upload — step by step

**Tera folder:** `C:\Users\SUDHA\Downloads\ro-Project\Ro-project`

---

# ⚠️ Pehle ye padh — 30 second

Tu pehle 2 baar ye error dekh chuka hai:

```
! [rejected]  main -> main (non-fast-forward)
```

**Isliye STEP 3 skip mat karna.** Wahi step ye error rokta hai.

---

# STEP 1 — Purane folder ka backup

CMD kholne se pehle, File Explorer mein:

1. `C:\Users\SUDHA\Downloads\ro-Project` folder kholo
2. `Ro-project` folder pe **right-click** → **Copy**
3. Wahi khali jagah pe **right-click** → **Paste**
4. Naam aayega `Ro-project - Copy` — **isko rehne do**

Kuch bigad gaya to yahi wapas use karega.

---

# STEP 2 — Zip nikalo

1. Maine jo zip diya wo download kar → `aquanexa-project.zip`
2. Us zip pe **right-click** → **Extract All...** → **Extract**
3. Ek folder khulega jisme `src`, `public`, `prisma`, `package.json` sab hoga

**Abhi copy mat karna.** Pehle STEP 3.

---

# STEP 3 — 🔴 GitHub se pull karo (SABSE ZAROORI)

CMD kholo:
- Windows key daba → `cmd` type kar → Enter

Ab ye **ek-ek line** paste kar (har line ke baad Enter):

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
```

```cmd
git pull --rebase origin main
```

### Kya dikhna chahiye

| Output | Matlab |
|---|---|
| `Already up to date.` | ✅ Badhiya, aage badh |
| `Successfully rebased` | ✅ Badhiya, aage badh |
| `Fast-forward` + file names | ✅ Badhiya, aage badh |
| `error: cannot pull with rebase: You have unstaged changes` | 👇 Neeche dekh |

### Agar "unstaged changes" error aaye

```cmd
git stash
```
```cmd
git pull --rebase origin main
```
```cmd
git stash drop
```

Ab aage badh.

---

# STEP 4 — Nayi files copy karo

File Explorer mein:

1. Extract kiye hue folder ke **andar** jao
2. **Ctrl + A** (sab select)
3. **Ctrl + C** (copy)
4. `C:\Users\SUDHA\Downloads\ro-Project\Ro-project` kholo
5. **Ctrl + V** (paste)
6. Popup aayega → **"Replace the files in the destination"** pe click

> ⚠️ **"Skip these files" mat dabana.** Replace hi karna hai.

---

# STEP 5 — Check kar ki files aa gayi

CMD mein wapas:

```cmd
git status
```

Ye naam dikhne chahiye:

```
modified:   src/components/layout/Navbar.tsx
modified:   src/app/(auth)/login/page.tsx
modified:   src/components/account/ProfileForm.tsx
...
Untracked files:
  src/components/ui/PasswordInput.tsx
  src/app/(auth)/forgot-password/
  src/app/admin/(dashboard)/security/
```

**Agar "nothing to commit, working tree clean" aaye** → files copy nahi hui. STEP 4 dobara kar.

---

# STEP 6 — Push karo

Teen line, ek-ek karke:

```cmd
git add .
```

```cmd
git commit -m "fix mobile drawer scroll + add show password, password reset, admin security"
```

```cmd
git push origin main
```

### Password maange to

- **Username:** `sudhanshuc613`
- **Password:** GitHub ka normal password **NAHI chalega**
  → **Personal Access Token** chahiye
  → `github.com` → Settings → Developer settings → Personal access tokens → Tokens (classic) → **Generate new token** → `repo` tick → Generate → **copy karke paste kar**

---

# STEP 7 — Vercel env fix (ye abhi tak pending hai)

Ye code ka nahi, Vercel ka kaam hai. **Logout pe `vercel.app` pe phenkne wala bug isi se theek hoga.**

1. Vercel → project `ro-project` → **Settings** → **Environment Variables**
2. `NEXTAUTH_URL` → Edit → value:
   ```
   https://rokadoctor.in
   ```
3. `NEXT_PUBLIC_SITE_URL` → Edit → value:
   ```
   https://rokadoctor.in
   ```
4. Teeno checkbox tick → **Save**

> **bina www, aakhir mein slash nahi**

---

# STEP 8 — Deploy check

Vercel → **Deployments** → sabse upar wala dekho

- **Building** (peela) → 3-4 min wait
- **Ready** (hara) → ✅ ho gaya
- **Error** (laal) → **Logs** kholo, screenshot bhej mujhe

> Agar STEP 7 ke baad khud deploy na ho: **⋯** → **Redeploy** → "Use existing Build Cache" ka tick **HATAO** → Redeploy

---

# STEP 9 — Test kar

**Incognito** mein khol (Ctrl+Shift+N) — purana cache bachega warna:

| Test | Kaise |
|---|---|
| Mobile drawer bug gaya? | Mobile pe `rokadoctor.in` → three-dot → scroll karke dekh, ab peeche ka content nahi hilega |
| Show password | `/login` → password box mein **aankh** icon dikhega |
| Password reset | `/login` → **"Forgot password?"** link |
| Admin password change | `/admin` → login → sidebar mein **🔐 Security** |
| Customer reset | `/admin/customers` → kisi customer pe **🔑 Reset password** |
| Logout bug gaya? | Login karke logout kar → `rokadoctor.in` pe hi rehna chahiye |

---

# 🔴 Sab kuch ek jagah (copy-paste ready)

```cmd
cd C:\Users\SUDHA\Downloads\ro-Project\Ro-project
git pull --rebase origin main
```

**← yahan ruk ke STEP 4 (files copy) kar**

```cmd
git status
git add .
git commit -m "fix mobile drawer scroll + add show password, password reset, admin security"
git push origin main
```

---

# Problem aaye to

### ❌ `'git' is not recognized`
Git install nahi hai → `git-scm.com/download/win` se install kar, CMD band karke dobara khol.

### ❌ `! [rejected] non-fast-forward`
STEP 3 skip kiya. Ye chala:
```cmd
git pull --rebase origin main
git push origin main
```

### ❌ `CONFLICT (content): Merge conflict in ...`
GitHub pe bhi wahi file edit ki thi. Mera version rakhne ke liye:
```cmd
git checkout --theirs .
git add .
git rebase --continue
git push origin main
```

### ❌ Vercel build fail
`package.json` mein `overrides` block hona chahiye. Check kar:
```cmd
findstr "overrides" package.json
```
Kuch na dikhe to zip se `package.json` dobara copy kar.

### ❌ `npm audit fix --force` chalane ka mann kare
**MAT CHALANA.** Pichli baar isi ne poora build tod diya tha.

---

# 🔴 Live jaane ke baad — pehla kaam

Admin password abhi bhi `ChangeMe@123` hai.

**Ab GUI se badal sakta hai:**
`/admin` → login → sidebar **🔐 Security** → Change Password

Ya Neon SQL se:
```sql
UPDATE users
SET password_hash = '$2b$12$Tuf8g1GMhn.uUQM4SHnnfONyslx0FXrJPItNWhgZTMl3eUnLgFcRG',
    updated_at = now()
WHERE phone = '8969821440';
```
Password: `Aqua#OithaQ5276@`
