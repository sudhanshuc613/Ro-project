#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# jsonld-parents.py  —  BUG CLASS H ka PERMANENT detector
#
# ── Kyu bana (15–16 Oct 2026) ───────────────────────────────────────────────
# Google Search Console ne 83 area page par ye error diya:
#
#     Review snippets — 2 items detected: Some are invalid
#     aggregateRating → Invalid object type for field "<parent_node>"
#
# Wajah: schema.org par `Service` node ke andar `aggregateRating` ALLOWED hai.
# Par Google ka **Review Snippet rich result** sirf gine-chune parent types
# support karta hai — aur `Service` us list me NAHI hai.
#
# 🔴 Isliye "JSON parse ho gaya = sahi hai" wala test KAAFI NAHI HAI.
#    Ye detector rendered HTML ka JSON-LD nikaal kar POORA TREE WALK karta hai
#    aur har us node ko pakadta hai jisme aggregateRating/review hai par
#    jiska @type Google ki supported-parent list me nahi aata.
#
# Checks:
#   1. har <script type="application/ld+json"> valid JSON hai
#   2. har node me @type hai
#   3. aggregateRating ka parent Google-supported type hai   ← BUG CLASS H
#   4. review ka parent bhi Google-supported type hai
#   5. AggregateRating me ratingValue + (reviewCount|ratingCount) hai
#   6. reviewCount > 0 (0 reviews pe rating = invalid item)
#   7. ratingValue <= bestRating
#   8. Review node me author + reviewRating hai
#   9. BreadcrumbList ke har item me position + name
#  10. FAQPage ke har Question me name + acceptedAnswer.text
#  11. Product ke offers me price + priceCurrency
#  12. LocalBusiness me name + address + telephone
#  13. @id duplicate alag-alag @type ke saath nahi
#
# Usage:  python3 jsonld-parents.py <crawl-dir>        (crawl-all.py ka output)
#         python3 jsonld-parents.py --base http://127.0.0.1:3100
# ─────────────────────────────────────────────────────────────────────────────
import sys, os, re, json, glob

# ── Google Review Snippet ke supported PARENT types ─────────────────────────
# Source: developers.google.com/search/docs/appearance/structured-data/review-snippet
#   "Review snippets ... only for the following schema.org types"
GOOGLE_REVIEW_PARENTS = {
    'Book', 'Course', 'CreativeWorkSeason', 'CreativeWorkSeries', 'Episode',
    'Event', 'Game', 'HowTo', 'LocalBusiness', 'MediaObject', 'Movie',
    'MusicPlaylist', 'MusicRecording', 'Organization', 'Product', 'Recipe',
    'SoftwareApplication',
}

# Subtypes bhi chalte hain (schema.org inheritance). Jo types hum use karte hain
# ya kar sakte hain, unka mapping. Koi naya type aaye to yahan jodo.
SUBTYPE_OF = {
    # LocalBusiness ke subtypes
    'HVACBusiness': 'LocalBusiness', 'Plumber': 'LocalBusiness',
    'HomeAndConstructionBusiness': 'LocalBusiness', 'Store': 'LocalBusiness',
    'HardwareStore': 'LocalBusiness', 'ElectronicsStore': 'LocalBusiness',
    'ProfessionalService': 'LocalBusiness', 'Electrician': 'LocalBusiness',
    'GeneralContractor': 'LocalBusiness', 'RoofingContractor': 'LocalBusiness',
    'AutomotiveBusiness': 'LocalBusiness', 'FoodEstablishment': 'LocalBusiness',
    'Restaurant': 'LocalBusiness', 'Hotel': 'LocalBusiness',
    # Organization ke subtypes
    'Corporation': 'Organization', 'NGO': 'Organization',
    'EducationalOrganization': 'Organization', 'OnlineBusiness': 'Organization',
    'OnlineStore': 'Organization',
    # Product ke subtypes
    'IndividualProduct': 'Product', 'ProductModel': 'Product',
    'SomeProducts': 'Product', 'Vehicle': 'Product', 'ProductGroup': 'Product',
    # CreativeWork-family jo Google ki list me hai
    'Clip': 'Episode', 'VideoObject': 'MediaObject', 'ImageObject': 'MediaObject',
    'AudioObject': 'MediaObject',
}

def resolve(t):
    """@type ko uske Google-visible base type tak le jao."""
    seen = set()
    while t in SUBTYPE_OF and t not in seen:
        seen.add(t)
        t = SUBTYPE_OF[t]
    return t

def types_of(node):
    t = node.get('@type')
    if t is None:
        return []
    return [t] if isinstance(t, str) else [x for x in t if isinstance(x, str)]

def is_supported_parent(node):
    for t in types_of(node):
        if resolve(t) in GOOGLE_REVIEW_PARENTS:
            return True
    return False

# ── HTML se JSON-LD nikaalo ─────────────────────────────────────────────────
LD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.S | re.I)

def extract_ld(html):
    """(index, raw, parsed_or_None, error) ki list."""
    out = []
    for i, raw in enumerate(LD_RE.findall(html)):
        s = raw.strip()
        # Next.js kabhi-kabhi HTML-escape karta hai
        s = s.replace('\\u003c', '<').replace('\\u003e', '>')
        try:
            out.append((i, s, json.loads(s), None))
        except Exception as e:
            out.append((i, s, None, str(e)[:120]))
    return out

def walk(node, path='$'):
    """har dict node ko (path, dict) ke roop me yield karo."""
    if isinstance(node, dict):
        yield path, node
        for k, v in node.items():
            yield from walk(v, f'{path}.{k}')
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk(v, f'{path}[{i}]')

# ── Checks ──────────────────────────────────────────────────────────────────
P = 0
F = 0
fails = []

def ok(_m):
    global P
    P += 1

def bad(m):
    global F
    F += 1
    fails.append(m)

def check_page(path, html):
    blocks = extract_ld(html)
    if not blocks:
        return  # har page par schema zaroori nahi (e.g. /login)

    ids = {}

    # ── PASS 0: @id ke hisaab se MERGED view banao ──────────────────────────
    # Google ek hi @id wale saare nodes ko ek entity me milata hai. Isliye
    # "required field hai ya nahi" ka faisla MERGE ke BAAD hona chahiye —
    # warna wo node jo jaanbujh kar sirf aggregateRating+review jodta hai
    # (aur naam/pata main node se leta hai) jhoothi FAIL deta hai.
    merged_keys = {}
    for _i, _raw, _data, _err in blocks:
        if _err:
            continue
        for _jp, _n in walk(_data):
            _nid = _n.get('@id')
            if _nid:
                merged_keys.setdefault(_nid, set()).update(_n.keys())
    for i, raw, data, err in blocks:
        if err:
            bad(f'{path} block#{i}: JSON parse fail — {err}')
            continue
        ok(f'{path} block#{i} valid JSON')

        for jp, node in walk(data):
            tl = types_of(node)

            # --- 3. aggregateRating ka parent  (BUG CLASS H) ---------------
            if 'aggregateRating' in node:
                if not tl:
                    bad(f'{path} {jp}: aggregateRating hai par parent ka @type hi nahi')
                elif not is_supported_parent(node):
                    bad(f'{path} {jp}: aggregateRating on UNSUPPORTED parent @type={tl} '
                        f'(Google review-snippet parents: {sorted(GOOGLE_REVIEW_PARENTS)})')
                else:
                    ok(f'{path} aggregateRating parent {tl} ok')

                ar = node['aggregateRating']
                ars = ar if isinstance(ar, list) else [ar]
                for a in ars:
                    if not isinstance(a, dict):
                        bad(f'{path} {jp}.aggregateRating object nahi hai')
                        continue
                    # --- 5. required fields ---
                    if 'ratingValue' not in a:
                        bad(f'{path} {jp}.aggregateRating me ratingValue nahi')
                    elif not ('reviewCount' in a or 'ratingCount' in a):
                        bad(f'{path} {jp}.aggregateRating me reviewCount/ratingCount nahi')
                    else:
                        ok(f'{path} aggregateRating fields ok')
                    # --- 6. reviewCount > 0 ---
                    try:
                        rc = float(a.get('reviewCount', a.get('ratingCount', 0)))
                        if rc <= 0:
                            bad(f'{path} {jp}.aggregateRating reviewCount={rc} (0 reviews = invalid)')
                        else:
                            ok(f'{path} reviewCount>0')
                    except Exception:
                        bad(f'{path} {jp}.aggregateRating reviewCount number nahi')
                    # --- 7. ratingValue <= bestRating ---
                    try:
                        rv = float(a.get('ratingValue'))
                        bestr = float(a.get('bestRating', 5))
                        worst = float(a.get('worstRating', 1))
                        if rv > bestr or rv < worst:
                            bad(f'{path} {jp}.aggregateRating ratingValue={rv} range ({worst}-{bestr}) ke bahar')
                        else:
                            ok(f'{path} ratingValue range ok')
                    except Exception:
                        pass

            # --- 4. review ka parent ---------------------------------------
            if 'review' in node and tl:
                if not is_supported_parent(node):
                    bad(f'{path} {jp}: review on UNSUPPORTED parent @type={tl}')
                else:
                    ok(f'{path} review parent {tl} ok')

            # --- 8. Review node ---------------------------------------------
            if 'Review' in tl:
                if 'author' not in node:
                    bad(f'{path} {jp}: Review me author nahi')
                elif 'reviewRating' not in node:
                    bad(f'{path} {jp}: Review me reviewRating nahi')
                else:
                    ok(f'{path} Review fields ok')

            # --- 9. BreadcrumbList ------------------------------------------
            if 'BreadcrumbList' in tl:
                items = node.get('itemListElement') or []
                if not items:
                    bad(f'{path} {jp}: BreadcrumbList khaali')
                else:
                    good = all(isinstance(it, dict) and 'position' in it
                               and ('name' in it or isinstance(it.get('item'), dict))
                               for it in items)
                    if good:
                        ok(f'{path} breadcrumb {len(items)} items ok')
                    else:
                        bad(f'{path} {jp}: BreadcrumbList item me position/name missing')

            # --- 10. FAQPage --------------------------------------------------
            if 'FAQPage' in tl:
                qs = node.get('mainEntity') or []
                qs = qs if isinstance(qs, list) else [qs]
                if not qs:
                    bad(f'{path} {jp}: FAQPage me mainEntity nahi')
                else:
                    bads = [q for q in qs if not (isinstance(q, dict) and q.get('name')
                            and isinstance(q.get('acceptedAnswer'), dict)
                            and q['acceptedAnswer'].get('text'))]
                    if bads:
                        bad(f'{path} {jp}: FAQPage me {len(bads)} Question adhoore')
                    else:
                        ok(f'{path} FAQPage {len(qs)} Q ok')

            # --- 11. Product offers -------------------------------------------
            if 'Product' in [resolve(t) for t in tl] and 'offers' in node:
                offs = node['offers']
                offs = offs if isinstance(offs, list) else [offs]
                for o in offs:
                    if not isinstance(o, dict):
                        continue
                    if o.get('@type') in ('Offer', 'AggregateOffer'):
                        has_price = ('price' in o or 'lowPrice' in o)
                        if not has_price or 'priceCurrency' not in o:
                            bad(f'{path} {jp}.offers me price/priceCurrency nahi')
                        else:
                            ok(f'{path} offers ok')

            # --- 12. LocalBusiness --------------------------------------------
            # 🔴 Sirf TOP-LEVEL node par. `provider: {...}` ya `itemReviewed: {...}`
            #    jaise andar ke stub sirf REFERENCE hote hain — Google unse poora
            #    address/telephone nahi maangta, aur wahan dobara bhejna duplicate
            #    data hai. Isliye depth dekh kar hi check karte hain.
            top_level = bool(re.fullmatch(r'\$(\[\d+\])?', jp))
            if top_level and any(resolve(t) == 'LocalBusiness' for t in tl):
                have = merged_keys.get(node.get('@id'), set()) | set(node.keys())
                miss = [k for k in ('name', 'address', 'telephone') if k not in have]
                if miss:
                    bad(f'{path} {jp}: top-level LocalBusiness me {miss} nahi '
                        f'(@id merge ke baad bhi)')
                else:
                    ok(f'{path} LocalBusiness fields ok')

            # --- 13. @id collision --------------------------------------------
            # Google ek hi @id wale nodes ko MERGE karta hai. @type ka alag hona
            # theek hai agar ek doosre ka subset ho (['LocalBusiness'] vs
            # ['LocalBusiness','HVACBusiness']) — JSON-LD me type multi-value hai.
            # Par `name` / `image` / `url` / `telephone` jaisi SINGLE-value
            # property ke do alag values = entity ambiguous. Local SEO me naam ka
            # ek hona (NAP consistency) seedha ranking factor hai.
            nid = node.get('@id')
            if nid and tl:
                key = (path, nid)
                sig = frozenset(tl)
                scal = {k: node[k] for k in ('name', 'image', 'url', 'telephone')
                        if isinstance(node.get(k), str)}
                prev = ids.get(key)
                if prev:
                    ptypes, pscal = prev
                    if not (sig <= ptypes or ptypes <= sig):
                        bad(f'{path}: @id {nid} ke @type takraate hain — '
                            f'{sorted(ptypes)} vs {sorted(sig)}')
                    for k, v in scal.items():
                        if k in pscal and pscal[k] != v:
                            bad(f'{path}: @id {nid} par "{k}" ki DO alag value — '
                                f'"{pscal[k]}" vs "{v}" (merge ke baad entity ambiguous)')
                    ids[key] = (ptypes | sig, {**pscal, **scal})
                else:
                    ids[key] = (sig, scal)
                    ok(f'{path} @id {nid.rsplit("#", 1)[-1]} unique')

            # --- 2. @type missing on a non-leaf object -------------------------
            if not tl and jp != '$' and isinstance(node, dict):
                # value-objects (jaise openingHours ka plain dict) chhod do
                if any(k.startswith('@') for k in node) and '@type' not in node and '@context' not in node:
                    bad(f'{path} {jp}: object me @type nahi')


def main():
    args = sys.argv[1:]
    pages = []
    if args and args[0] == '--base':
        import urllib.request
        import concurrent.futures as cf
        base = args[1].rstrip('/')
        UA = {'User-Agent': 'AquaPerlAudit/1.0'}
        req = urllib.request.Request(base + '/sitemap.xml', headers=UA)
        sm = urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'replace')
        paths = [re.sub(r'^https?://[^/]+', '', u) or '/'
                 for u in re.findall(r'<loc>([^<]+)</loc>', sm)]

        def pull(p):
            try:
                r = urllib.request.Request(base + p, headers=UA)
                return p, urllib.request.urlopen(r, timeout=60).read().decode('utf-8', 'replace')
            except Exception as e:
                return p, f'<!-- FETCH FAIL {e} -->'

        with cf.ThreadPoolExecutor(8) as ex:
            pages = list(ex.map(pull, paths))
    else:
        d = args[0] if args else '/tmp/crawl-local'
        idx = json.load(open(os.path.join(d, '_index.json'), encoding='utf-8'))
        for e in idx:
            if e['status'] == 200:
                pages.append((e['path'], open(e['file'], encoding='utf-8').read()))

    print(f'════ JSON-LD parent-type validation ({len(pages)} pages) ════')
    for p, h in pages:
        check_page(p, h)

    # summary: kaun-kaun se type par rating lagi hai
    carriers = {}
    for p, h in pages:
        for _, _, data, err in extract_ld(h):
            if err:
                continue
            for jp, node in walk(data):
                if 'aggregateRating' in node:
                    k = '+'.join(sorted(types_of(node))) or '(no @type)'
                    carriers[k] = carriers.get(k, 0) + 1
    print('\n  aggregateRating kin types par hai:')
    for k, v in sorted(carriers.items(), key=lambda x: -x[1]):
        mark = 'OK ' if resolve(k.split('+')[0]) in GOOGLE_REVIEW_PARENTS or any(
            resolve(t) in GOOGLE_REVIEW_PARENTS for t in k.split('+')) else '🔴 '
        print(f'    {mark} {k}: {v}')

    if fails:
        print(f'\n  ── {len(fails)} FAIL ──')
        for m in fails[:40]:
            print('  FAIL ', m)
        if len(fails) > 40:
            print(f'  ... +{len(fails)-40} more')

    print()
    print('════════════════════════════════════')
    print(f'  PASS: {P}    FAIL: {F}')
    print('════════════════════════════════════')
    sys.exit(1 if F else 0)


if __name__ == '__main__':
    main()
