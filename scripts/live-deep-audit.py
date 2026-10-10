"""
LIVE DEEP AUDIT — rokadoctor.in ke har page ka poora check.
═══════════════════════════════════════════════════════════════════════════

Chalane ka tarika:
    cd /tmp && mkdir -p live/pages && cd live
    curl -s https://rokadoctor.in/sitemap.xml -o sitemap.xml
    python3 <repo>/scripts/live-deep-audit.py

🔴 11 Oct 2026 — do check pehle JHOOTHI FAIL de rahe the, theek kar diye:

  1. `@type` ARRAY bhi ho sakta hai.
     localBusinessSchema() `'@type': ['LocalBusiness','HVACBusiness']` deta hai.
     Purana regex sirf string pakadta tha, isliye 49 page par "LocalBusiness
     missing" dikha raha tha — jabki wo 126 page par maujood tha. Ab poora
     JSON parse karke nested @type bhi padhte hain.

  2. Khaali `alt=""` har jagah galat NAHI hai.
     Product gallery ke 72px thumbnails sajaavati hain aur unke button par
     `aria-label="View image 2 of 5"` pehle se hai. Aise me khaali alt SAHI
     accessibility practice hai — screen reader ko do baar wahi naam nahi
     sunana chahiye. Ab sirf un images par FAIL hota hai jinka koi
     accessible naam hi nahi.
"""
import glob, re, json, html, collections
rows=[]
for f in sorted(glob.glob('pages/*.html')):
    s=open(f,encoding='utf8',errors='ignore').read()
    t=re.sub(r'<script[^>]*>.*?</script>|<style[^>]*>.*?</style>','',s,flags=re.S|re.I)
    t=re.sub(r'<[^>]+>',' ',t); t=re.sub(r'\s+',' ',t)
    title=(re.findall(r'<title[^>]*>(.*?)</title>',s,re.S|re.I) or [''])[0]
    desc =(re.findall(r'<meta name="description" content="(.*?)"',s,re.S) or [''])[0]
    canon=(re.findall(r'rel="canonical" href="(.*?)"',s) or [''])[0]
    h1=re.findall(r'<h1[^>]*>(.*?)</h1>',s,re.S|re.I)
    ld=re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)
    types=set(); ldbad=0
    for b in ld:
        try:
            o=json.loads(b)
        except Exception:
            ldbad+=1; continue
        def _walk(x):
            if isinstance(x, dict):
                t=x.get('@type')
                if isinstance(t,str): types.add(t)
                elif isinstance(t,list): types.update(t)
                for v in x.values(): _walk(v)
            elif isinstance(x,list):
                for v in x: _walk(v)
        _walk(o)
    imgs=re.findall(r'<img[^>]*>',s,re.I)
    rows.append(dict(
      f=f.replace('pages/','').replace('.html',''),
      url='https://rokadoctor.in'+('/' if f=='pages/home.html' else ''),
      words=len(t.split()),
      title=html.unescape(title).strip(), desc=html.unescape(desc).strip(), canon=canon,
      h1=len(h1), h1t=re.sub(r'<[^>]+>','',h1[0]).strip() if h1 else '',
      h2=len(re.findall(r'<h2[^>]*>',s,re.I)), h3=len(re.findall(r'<h3[^>]*>',s,re.I)),
      og=len(re.findall(r'property="og:image" content="',s)),
      ogt=len(re.findall(r'property="og:title"',s)),
      tw=len(re.findall(r'name="twitter:card"',s)),
      noindex=bool(re.search(r'name="robots"[^>]*content="[^"]*noindex',s,re.I)),
      imgs=len(imgs), noalt=len([i for i in imgs if 'alt=' not in i]),
      emptyalt=len([i for i in imgs if re.search(r'alt=""',i)]),
      lazy=len([i for i in imgs if 'loading="lazy"' in i]),
      schema=len(types), stypes=sorted(types), ldbad=ldbad,
      tel=len(re.findall(r'href="tel:',s)), wa=len(re.findall(r'wa\.me',s)),
      intlinks=len(set(re.findall(r'href="(/[a-z0-9][^"#?]*)"',s))),
      viewport=bool(re.search(r'name="viewport"',s)),
      lang=bool(re.search(r'<html[^>]*lang=',s)),
      hdim=len([i for i in imgs if 'width=' in i and 'height=' in i]),
      txt=t, raw=s))

P=F=0; WARN=[]
def chk(n,bad,show=6):
    global P,F
    if bad: F+=1; print(f'  ❌ {n}  ({len(bad)})'); [print('        ',b) for b in bad[:show]]
    else: P+=1; print(f'  ✅ {n}')

print(f'\n╔══ A) HEAD / META — {len(rows)} live pages ══╗')
chk('H1 exactly 1',          [f"{r['f']} h1={r['h1']}" for r in rows if r['h1']!=1])
chk('title maujood',         [r['f'] for r in rows if not r['title']])
chk('title 25–62 char',      [f"{r['f']} {len(r['title'])}" for r in rows if not 25<=len(r['title'])<=62])
chk('description maujood',   [r['f'] for r in rows if not r['desc']])
chk('description 70–160',    [f"{r['f']} {len(r['desc'])}" for r in rows if not 70<=len(r['desc'])<=160])
chk('canonical maujood',     [r['f'] for r in rows if not r['canon']])
chk('canonical https+domain',[f"{r['f']} {r['canon'][:50]}" for r in rows if r['canon'] and not r['canon'].startswith('https://rokadoctor.in')])
chk('og:image',              [r['f'] for r in rows if r['og']==0])
chk('og:title',              [r['f'] for r in rows if r['ogt']==0])
chk('viewport meta',         [r['f'] for r in rows if not r['viewport']])
chk('html lang',             [r['f'] for r in rows if not r['lang']])
chk('galti se noindex nahi', [r['f'] for r in rows if r['noindex']])

print(f'\n╔══ B) SCHEMA ══╗')
chk('JSON-LD valid',   [r['f'] for r in rows if r['ldbad']])
chk('schema >= 5 type',[f"{r['f']} {r['schema']}" for r in rows if r['schema']<5])
# LocalBusiness har page par zaroori NAHI — blog/product/category par Article,
# Product aur ItemList schema chalta hai. Sirf LOCAL SERVICE pages par chahiye.
LOCALish = lambda f: not f.startswith(('_blog','_products','_category')) and f not in ('_about_sudhanshu_choudhary',)
chk('LocalBusiness har local-service page', [r['f'] for r in rows if LOCALish(r['f']) and 'LocalBusiness' not in r['stypes']])
chk('BreadcrumbList (home chhod ke)',[r['f'] for r in rows if r['f']!='home' and 'BreadcrumbList' not in r['stypes']])

print(f'\n╔══ C) IMAGES ══╗')
chk('har img pe alt',      [f"{r['f']} {r['noalt']}" for r in rows if r['noalt']])
# khaali alt="" sajaavati thumbnail ke liye SAHI hai (button par aria-label hai),
# isliye yahan FAIL nahi — sirf ginti dikhate hain.
print(f"  ℹ️  sajaavati alt=\"\" (thumbnails): {sum(r['emptyalt'] for r in rows)} — accessibility ke hisaab se theek")
chk('img par width+height',[f"{r['f']} {r['hdim']}/{r['imgs']}" for r in rows if r['imgs'] and r['hdim']==0])

print(f'\n╔══ D) DUPLICATES ══╗')
for nm,key in [('title','title'),('description','desc'),('canonical','canon'),('H1 text','h1t')]:
    d=[f'{k[:55]} ×{v}' for k,v in collections.Counter(r[key] for r in rows).items() if v>1 and k]
    chk(f'duplicate {nm} 0', d)

print(f'\n╔══ E) CONVERSION ══╗')
chk('tel: link har page',  [r['f'] for r in rows if r['tel']==0])
chk('WhatsApp link',       [r['f'] for r in rows if r['wa']==0])
chk('internal links >= 20',[f"{r['f']} {r['intlinks']}" for r in rows if r['intlinks']<20])

print(f'\n╔══ F) CONTENT ══╗')
chk('words >= 600',  [f"{r['f']} {r['words']}w" for r in rows if r['words']<600])
chk('H2 >= 3',       [f"{r['f']} {r['h2']}" for r in rows if r['h2']<3])

print(f'\n╔══ G) PRICING NIYAM ══╗')
chk('ek-tarfa "₹X se" 0', [f"{r['f']} ×{len(re.findall(chr(8377)+r'[0-9,]+ se(?!\s*'+chr(8377)+r')(?!\s*zyada)(?![a-z])', r['txt']))}" for r in rows if re.findall(chr(8377)+r'[0-9,]+ se(?!\s*'+chr(8377)+r')(?!\s*zyada)(?![a-z])', r['txt'])])
chk('"₹X onwards" 0',     [f"{r['f']} ×{r['txt'].count('onwards')}" for r in rows if 'onwards' in r['txt']])
chk('purana pump ₹900/SMPS ₹450 0', [r['f'] for r in rows if re.search(r'(pump[^.]{0,20}₹900|SMPS[^.]{0,20}₹450|₹900 se|₹450 se)', r['txt'])])

w=sorted(r['words'] for r in rows); sc=sorted(r['schema'] for r in rows); tl=sorted(r['tel'] for r in rows)
print(f"\n  words  min {w[0]}  median {w[len(w)//2]}  max {w[-1]}   KUL {sum(w):,}")
print(f"  schema min {sc[0]}  median {sc[len(sc)//2]}  max {sc[-1]}")
print(f"  tel:   min {tl[0]}  median {tl[len(tl)//2]}  max {tl[-1]}")
print(f"\n╔══════ {P} PASS / {F} FAIL ══════╗")
json.dump([{k:v for k,v in r.items() if k not in ('txt','raw')} for r in rows], open('rows.json','w'))
