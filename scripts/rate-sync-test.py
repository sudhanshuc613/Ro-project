#!/usr/bin/env python3
"""
RATE SYNC TEST — admin ka rate sach me har jagah badalta hai ya nahi.

🔴 KYUN (26 Oct 2026)
Owner: "admin panel se rate change karta hu to wo in sab jagh se change nhi
hota hai." Screenshot: /ro-filter-change-patna ki price table.

Jaanch me mila: `/admin/rates` sirf PART_RATES badalta tha aur wo sirf
ads-landing ke ServicePriceGrid me dikhte the. Service page ki price table
(53 row, 7 page) poori HARDCODED thi.

Ye test do cheez pakadta hai:
  A. BINA override ke har daam BILKUL WAHI rehna chahiye jo pehle tha.
     (Agar ek bhi badla to refactor ne daam bigaad diya — turant FAIL.)
  B. Admin me rate badalne par wo HAR us page par badalna chahiye jahan
     us part ka row hai.

Usage: python3 scripts/rate-sync-test.py [BASE]
"""
import http.cookiejar, json, re, sys, time, urllib.error, urllib.parse, urllib.request

BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:3100').rstrip('/')
P=F=0; FAILS=[]
def chk(l,ok,d=''):
    global P,F
    if ok: P+=1; print(f'  PASS  {l}'+(f'  {d}' if d else ''))
    else: F+=1; FAILS.append(l); print(f'  FAIL  {l}'+(f'  {d}' if d else ''))

cj=http.cookiejar.CookieJar()
op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders=[('User-Agent','RateSyncTest/1.0')]
def req(path,data=None,method=None,form=False):
    body=None;h={}
    if data is not None:
        if form: body=urllib.parse.urlencode(data).encode(); h['Content-Type']='application/x-www-form-urlencoded'
        else: body=json.dumps(data).encode(); h['Content-Type']='application/json'
    r=urllib.request.Request(BASE+path,data=body,headers=h,method=method)
    try:
        with op.open(r,timeout=60) as x: return x.status,x.read().decode('utf-8','replace')
    except urllib.error.HTTPError as e: return e.code,e.read().decode('utf-8','replace')
    except Exception as e: return 0,f'ERR {e}'

INTENTS=['ro-installation-patna','ro-amc-patna','ro-repair-patna','ro-filter-change-patna',
         'ro-membrane-replacement-patna','commercial-ro-service-patna','ro-service-in-patna']

def table(slug):
    """Us page ki price table ke (item, price) nikaalo."""
    _,h=req('/'+slug)
    h=re.sub(r'<!--.*?-->','',h,flags=re.S)
    out=[]
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>',h,re.S):
        tds=re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>',tr,re.S)
        if len(tds)>=2:
            c=[re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',x)).strip() for x in tds]
            if '₹' in c[1] or 'Free' in c[1] or 'Quoted' in c[1]:
                # 🔴 pehla cell me item + note dono chipke hote hain.
                #    AMC ke "Basic AMC" row ke NOTE me bhi "sediment" shabd
                #    hai ("sediment + carbon change") — isliye sirf pehle
                #    60 char (item ka hissa) par match karna chahiye, poore
                #    cell par nahi. Warna jhootha FAIL milta hai.
                out.append((c[0], c[1]))
    return out

print('='*72); print(f'  RATE SYNC TEST  —  {BASE}'); print('='*72); print()

# ── 0. LOGIN + SAAF SHURUAAT ─────────────────────────────────────────────
# 🔴 Test ko HAMESHA ek jaani-pehchani haalat se shuru hona chahiye.
#    Pehle ye baseline pehle leta tha aur reset baad me. Agar pichhla run
#    beech me fail ho jata to override DB me pada reh jata, aur agla run
#    us GANDI value ko "baseline" maan leta — phir aakhir me jhootha FAIL.
#    Ab pehle login, phir saare override hatao, TAB baseline lo.
print('── 0. LOGIN + purane override saaf ──')
_,b=req('/api/auth/csrf'); tok=json.loads(b).get('csrfToken')
req('/api/auth/callback/password',{'phone':'8969821440','password':'ChangeMe@123',
    'csrfToken':tok,'json':'true','callbackUrl':BASE+'/admin'},form=True)
_,b=req('/api/auth/session'); chk('admin login', '"user"' in b)
if '"user"' not in b:
    print(f'\n  PASS: {P}    FAIL: {F+1}'); sys.exit(1)
TARGET='Sediment filter (spun)'
NEWF,NEWT=1111,2222
st,_=req('/api/admin/rates?part='+urllib.parse.quote(TARGET),method='DELETE')
chk('purana override saaf', st in (200,400), f'HTTP {st}')
time.sleep(3)

# ── A. baseline: ab jo daam hain (code ke default) ──
print()
print('── A. BASELINE (code ke asli default) ──')
base={}
for s_ in INTENTS:
    base[s_]=table(s_)
    chk(f'/{s_} ki table mili', len(base[s_])>0, f'{len(base[s_])} row')
amc_base_rows=list(base['ro-amc-patna'])
total=sum(len(v) for v in base.values())
chk('kul price row', total>=45, str(total))

st,b=req('/api/admin/rates')
chk('rate API 200', st==200, f'HTTP {st}')

# ── C. admin me ek rate badlo ──
print()
print('── C. ADMIN SE RATE BADLO ──')
TARGET='Sediment filter (spun)'
NEWF,NEWT=1111,2222
# 🔴 API ek baar me EK part leta hai: { part, from, to }
payload={'part':TARGET,'from':NEWF,'to':NEWT}
st,b=req('/api/admin/rates',payload,method='PUT')
chk(f'"{TARGET}" ko ₹{NEWF}–₹{NEWT} kiya', st in (200,201), f'HTTP {st} {b[:90]}')
time.sleep(3)

# ── D. har page par badla? ──
print()
print('── D. HAR PAGE PAR BADLA? ──')
want=f'₹{NEWF:,} – ₹{NEWT:,}'.replace(',', ',')
hit=0; shouldhit=0
for s in INTENTS:
    now=table(s)
    rowsb={i:p for i,p in base[s]}
    changed=[(i,rowsb.get(i),p) for i,p in now if rowsb.get(i)!=p]
    # sirf ITEM ke shuru me sediment dekho, note me nahi
    sed=[(i,p) for i,p in now if i.lower().startswith('sediment')]
    if sed:
        shouldhit+=1
        ok=any(want in p for _,p in sed)
        if ok: hit+=1
        chk(f'/{s} me sediment ka daam badla', ok, f'{sed[0][1]}')
    # jis row ka rateKey nahi, wo NAHI badalna chahiye
    others=[(i,o,n) for i,o,n in changed if not i.lower().startswith('sediment')]
    chk(f'/{s} me baaki daam NAHI badle', not others, str(others[:2]))
chk('sediment wale saare page badle', hit==shouldhit, f'{hit}/{shouldhit}')

# ── E. wapas default karo aur BILKUL WAHI aana chahiye ──
print()
print('── E. DEFAULT PAR WAPAS — daam bilkul pehle jaisa? ──')
st,b=req('/api/admin/rates?part='+urllib.parse.quote(TARGET),method='DELETE')
chk('override hataya', st in (200,201), f'HTTP {st}')
time.sleep(3)
same=0; diff=[]
for s in INTENTS:
    now=table(s)
    if now==base[s]: same+=1
    else:
        for (i1,p1),(i2,p2) in zip(base[s],now):
            if p1!=p2: diff.append((s,i1,p1,p2))
chk('🔴 har page ka daam BILKUL pehle jaisa', same==len(INTENTS), f'{same}/{len(INTENTS)}')
for d in diff[:5]: print(f'       {d[0]} · {d[1]} · {d[2]} -> {d[3]}')

# ══════════════════════════════════════════════════════════════════════════
#  F. HAR KEYED ROW — daam BILKUL wahi jo code ke default se banta hai
#  🔴 26 Oct 2026 (doosra round): 53 row me se 25 hi admin se jude the.
#     Ab 49 jude hain (4 ke paas number hi nahi: Free / Quoted).
#     Ye section har keyed row ka EXPECTED string khud banata hai aur
#     rendered HTML se byte-to-byte milata hai.
# ══════════════════════════════════════════════════════════════════════════
print()
print('── F. HAR KEYED ROW KA DAAM EXACT ──')

# 🔴 TS ko node se import karna build-order par nirbhar hai aur flaky nikla.
#    Isliye expected string SOURCE se banti hai — wahi jagah jahan number likhe hain.
src = open('src/lib/seo/service-intent-data.ts', encoding='utf-8').read()
rates_src = open('src/lib/seo/ads-landing-data.ts', encoding='utf-8').read()
extra_src = open('src/lib/seo/service-rates.ts', encoding='utf-8').read()

RATES = {}
FORMAT = {}
for m in re.finditer(r"\{\s*part:\s*'([^']+)',\s*from:\s*(\d+),\s*to:\s*(\d+)", rates_src):
    RATES[m.group(1)] = (int(m.group(2)), int(m.group(3))); FORMAT[m.group(1)] = 'range'
for m in re.finditer(r"\{\s*part:\s*'([^']+)',\s*from:\s*(\d+),\s*to:\s*(\d+),\s*format:\s*'(\w+)'", extra_src):
    RATES[m.group(1)] = (int(m.group(2)), int(m.group(3))); FORMAT[m.group(1)] = m.group(4)
chk('rate source padha', len(RATES) >= 33, f'{len(RATES)} rate key')

def inr(x): return '₹' + format(x, ',d')
def fmt(frm, to, f):
    if f == 'flat':        return inr(frm)
    if f == 'from':        return f'{inr(frm)} onwards'
    if f == 'perYear':     return f'{inr(frm)} / year'
    if f == 'fromPerYear': return f'From {inr(frm)} / year'
    if f == 'perMetre':    return f'{inr(frm)} per metre'
    if f == 'extra':       return f'{inr(frm)} extra'
    return inr(frm) if frm == to else f'{inr(frm)} – {inr(to)}'

KEYED = re.findall(r"\{\s*rateKey:\s*'([^']+)',\s*item:\s*'([^']*)',\s*price:\s*'([^']*)'", src)
chk('source me keyed row', len(KEYED) >= 49, f'{len(KEYED)} row')

bad = []
for key, item, price in KEYED:
    if key not in RATES:
        bad.append((item, key, 'KEY NAHI MILI')); continue
    want = fmt(RATES[key][0], RATES[key][1], FORMAT[key])
    if want != price:
        bad.append((item, f'{price!r} hardcoded', f'{want!r} banega'))
chk('🔴 har keyed row ka hardcoded daam == banne wala daam', not bad, f'{len(bad)} galat')
for b in bad[:8]:
    print(f'       {b[0]} · {b[1]} · {b[2]}')

# rendered HTML me bhi wahi
allrows = []
for s_ in INTENTS:
    allrows += [(s_, i, pr) for i, pr in base[s_]]
missing = []
for key, item, price in KEYED:
    found = [r for r in allrows if r[1][:len(item)] == item]
    if not found:
        found = [r for r in allrows if r[1].startswith(item[:45])]
    if not found:
        missing.append(item); continue
    if not any(price in r[2] or r[2] == price for r in found):
        missing.append(f'{item} → page par {found[0][2]!r}, chahiye {price!r}')
chk('🔴 har keyed row live HTML me bhi wahi daam', not missing, f'{len(missing)} miss')
for m_ in missing[:8]:
    print(f'       {m_}')

# ══════════════════════════════════════════════════════════════════════════
#  G. NON-RANGE FORMAT — "₹1,499 / year" range me badal to nahi gaya
# ══════════════════════════════════════════════════════════════════════════
print()
print('── G. NON-RANGE FORMAT (AMC / onwards / per metre) ──')
AMC_KEY = 'Basic AMC — saal bhar'
st, b = req('/api/admin/rates', {'part': AMC_KEY, 'from': 1777, 'to': 1777}, method='PUT')
chk(f'"{AMC_KEY}" ko ₹1,777 kiya', st in (200, 201), f'HTTP {st} {b[:80]}')
time.sleep(3)
amc = table('ro-amc-patna')
basic = [pr for it, pr in amc if it.startswith('Basic AMC')]
chk('AMC row mila', bool(basic), str(basic[:1]))
chk('🔴 AMC "₹1,777 / year" bana (range nahi)', bool(basic) and basic[0] == '₹1,777 / year', str(basic[:1]))
chk('🔴 AMC me "–" nahi aaya', bool(basic) and '–' not in basic[0], str(basic[:1]))
st, _ = req('/api/admin/rates?part=' + urllib.parse.quote(AMC_KEY), method='DELETE')
chk('AMC override hataya', st in (200, 201), f'HTTP {st}')
time.sleep(3)
amc2 = table('ro-amc-patna')
chk('🔴 AMC wapas bilkul pehle jaisa', amc2 == amc_base_rows, '')

# ══════════════════════════════════════════════════════════════════════════
#  H. ADS-LANDING GRID — wahi 12 ghar ke part, 33 nahi
#  🔴 Naye 21 rate PART_RATES me daalte to is page par 12 ki jagah 33 card
#     aa jaate — yaani maujooda UI bina poochhe badal jaati.
# ══════════════════════════════════════════════════════════════════════════
print()
print('── H. ADS-LANDING GRID ME SIRF 12 PART ──')
_, adsh = req('/ro-service-in-patna')
adsh = re.sub(r'<!--.*?-->', '', adsh, flags=re.S)
DOM12 = [m.group(1) for m in re.finditer(r"\{\s*part:\s*'([^']+)',\s*from:", rates_src)][:12]
chk('PART_RATES me 12 part', len(DOM12) == 12, str(len(DOM12)))
present = [p_ for p_ in DOM12 if p_ in adsh]
chk('🔴 saare 12 ghar ke part page par', len(present) == 12, f'{len(present)}/12')
EXTRA_NAMES = re.findall(r"\{\s*part:\s*'(Commercial — [^']+)'", extra_src)
leaked = [e for e in EXTRA_NAMES if e in adsh]
chk('🔴 commercial rate grid me LEAK nahi hue', not leaked, str(leaked[:3]))

print(); print('='*72); print(f'  PASS: {P}    FAIL: {F}'); print('='*72)
for x in FAILS: print(f'   🔴 {x}')
sys.exit(0 if F==0 else 1)
