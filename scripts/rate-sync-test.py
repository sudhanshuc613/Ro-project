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

print(); print('='*72); print(f'  PASS: {P}    FAIL: {F}'); print('='*72)
for x in FAILS: print(f'   🔴 {x}')
sys.exit(0 if F==0 else 1)
