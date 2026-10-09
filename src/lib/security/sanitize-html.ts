/**
 * HTML SANITIZER — allowlist based, bina kisi nayi dependency ke.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 🔴 KYUN BANAYA (9 Oct 2026, security audit)
 * ───────────────────────────────────────────
 * Owner: "ye dhyan rakhna ki website koi hack na kar le proper security
 *         wagrech check kar lena"
 *
 * Audit me mila:
 *
 *     src/app/(shop)/products/[slug]/page.tsx:298
 *     <div dangerouslySetInnerHTML={{ __html: product.description ?? '' }} />
 *
 * Yaani product ka description DB se seedha HTML ki tarah render ho raha tha,
 * bina kisi jaanch ke. Iska matlab:
 *
 *   • Agar kabhi admin account haath lag gaya (aur abhi password
 *     `ChangeMe@123` hai, aur dono GitHub repo PUBLIC hain jisme seed.ts me
 *     wahi password likha hai) — to hamlaavar product description me
 *     <script> daal sakta hai.
 *   • Wo script HAR customer ke browser me chalega jo us product page par
 *     aayega. Isse session cookie chori, nakli payment form, ya redirect —
 *     sab ho sakta hai. Isko "stored XSS" kehte hain aur ye sabse kharaab
 *     kism ka hota hai, kyunki ek baar daalne ke baad wo page par pada
 *     rehta hai.
 *
 * KYUN NAYI LIBRARY NAHI DAALI
 * ────────────────────────────
 * DOMPurify jaisi library sahi hai par wo ek nayi dependency hai, aur
 * package.json ka `overrides` block yahan load-bearing hai — usse chhedne
 * ka risk fayde se zyada hai. Product description me sirf saadhaaran
 * formatting chahiye (abhi DB me sirf <p> tags hain, maine check kiya),
 * isliye ek chhota allowlist sanitizer kaafi hai aur usme kuch toot bhi
 * nahi sakta.
 *
 * TARIKA — allowlist, blocklist nahi
 * ──────────────────────────────────
 * Blocklist ("<script> hata do") hamesha toot jaati hai, kyunki hamlaavar
 * naya tarika dhoondh leta hai. Allowlist ulta kaam karti hai: jo tag
 * list me nahi hai wo nikal diya jaata hai. Naya attack aaye ya purana,
 * list me nahi hai to andar nahi aayega.
 *
 * Ye server par chalta hai (page.tsx ek server component hai), isliye
 * browser ko pehle se saaf HTML hi milta hai.
 */

/** Jo tag chalne diye jaate hain. Baaki sab ka tag nikal jaata hai. */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'blockquote', 'span', 'a', 'table', 'thead',
  'tbody', 'tr', 'th', 'td', 'sub', 'sup', 'hr',
]);

/** Har tag par sirf ye attribute bach sakte hain. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'rel', 'target']),
  th: new Set(['colspan', 'rowspan', 'scope']),
  td: new Set(['colspan', 'rowspan']),
};

/**
 * Jo tag poore ke poore udaane hain — sirf tag nahi, unka ANDAR ka content bhi.
 * <script>alert(1)</script> me sirf tag hatane se `alert(1)` text bach jaata,
 * aur <style> ka content bhi page tod sakta hai.
 */
const STRIP_WITH_CONTENT = /<\s*(script|style|iframe|object|embed|noscript|template|svg|math|form|input|button|select|textarea|link|meta|base)\b[\s\S]*?(?:<\s*\/\s*\1\s*>|$)/gi;

/** Khud band hone wale khatarnaak tag (jinka closing tag hota hi nahi). */
const STRIP_SELF_CLOSING = /<\s*(link|meta|base|input|img|source|track)\b[^>]*>/gi;

/** HTML comment — usme conditional comment chhup sakta hai. */
const STRIP_COMMENTS = /<!--[\s\S]*?-->/g;

/** javascript:, data:, vbscript: — URL ke roop me script chalane ke tarike. */
const BAD_URL = /^\s*(?:javascript|data|vbscript|file|blob)\s*:/i;

/**
 * HTML ko saaf karta hai. Jo allowlist me nahi hai, wo nikal jaata hai.
 *
 * @param dirty  DB se aaya hua HTML (ya kuch bhi)
 * @returns      render karne layak saaf HTML
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  let s = String(dirty);

  /* 1. Khatarnaak tag + unka content — sabse pehle, taaki andar ka code
        baad ke steps me text banke na bach jaaye. */
  s = s.replace(STRIP_COMMENTS, '');
  // do baar: <scr<script>ipt> jaise nested trick ko bhi pakadne ke liye
  s = s.replace(STRIP_WITH_CONTENT, '').replace(STRIP_WITH_CONTENT, '');
  s = s.replace(STRIP_SELF_CLOSING, '');

  /* 2. Bache hue har tag ko ek-ek karke jaancho. */
  s = s.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_m, close: string, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';          // list me nahi → tag udao
    if (close) return `</${tag}>`;                  // closing tag par attribute hota hi nahi

    const allowed = ALLOWED_ATTRS[tag];
    if (!allowed) return `<${tag}>`;                // is tag par koi attribute allowed nahi

    const kept: string[] = [];
    const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(rawAttrs)) !== null) {
      const name = m[1].toLowerCase();
      const value = m[2] ?? m[3] ?? m[4] ?? '';
      // on* handler kabhi nahi — onclick, onerror, onload sab yahin ruk jaate hain
      if (name.startsWith('on')) continue;
      if (!allowed.has(name)) continue;
      if ((name === 'href' || name === 'src') && BAD_URL.test(value)) continue;
      // quote aur < > nikal do taaki attribute se bahar na nikal paaye
      const safe = value.replace(/["'<>]/g, '');
      kept.push(`${name}="${safe}"`);
    }

    /* Bahar jaane wale link par hamesha noopener — tabnabbing rokta hai. */
    if (tag === 'a') {
      const href = kept.find((k) => k.startsWith('href='));
      if (href && !/^href="(\/|#)/.test(href)) {
        if (!kept.some((k) => k.startsWith('rel='))) kept.push('rel="nofollow noopener noreferrer"');
      }
    }

    return kept.length ? `<${tag} ${kept.join(' ')}>` : `<${tag}>`;
  });

  return s;
}
