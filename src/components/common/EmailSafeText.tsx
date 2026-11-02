/**
 * EmailSafeText — ek PLAIN STRING ko render karta hai, par usme chhupa hua
 * koi bhi email address `EmailOff` se wrap kar deta hai.
 *
 * ── Ye kyun banana pada (2 Nov 2026 ko LIVE naapa gaya) ───────────────────
 *
 * 26 Oct ko `EmailOff` bana tha aur Cloudflare ka email-obfuscation 149/149
 * page se saaf ho gaya tha. Lekin wo fix sirf WAHAN laga tha jahan email ek
 * alag component ke through chhapta tha (footer, /contact).
 *
 * 2 Nov ko do naye page gaye — `/terms` aur `/about-us`. Dono me email ek
 * NORMAL STRING ke andar baitha tha:
 *
 *     policy-data.ts →  'Phone: 8969821440 · Email: support@rokadoctor.in'
 *     about-us FACTS →  { k: 'Email', v: CONTACT.email }
 *
 * Cloudflare ne wahi kiya jo wo karta hai — use badal diya:
 *
 *     <a href="/cdn-cgi/l/email-protection" class="__cf_email__" ...>
 *
 * Aur `/cdn-cgi/l/email-protection` HTTP 404 deta hai. Natija: Google Ads
 * appeal ke BEECH me, Terms page par 2 toote hue link aur About Us par 1.
 * Theek wahi do page jo Google ka reviewer sabse pehle kholta hai.
 *
 * Naapa gaya (live, 2 Nov):
 *     /terms      → /cdn-cgi/l/email-protection × 2
 *     /about-us   → /cdn-cgi/l/email-protection × 1
 *     baaki 7 trust page → 0   (kyunki unka email footer se aata hai)
 *
 * ── Fix ───────────────────────────────────────────────────────────────────
 *
 * String ko email par TODO, aur har email ke tukde ko `EmailOff` me daal do.
 * `EmailOff` `<!--email_off-->` fence chhaapta hai, jise Cloudflare chhodta
 * hai. Baaki text bilkul waise ka waisa rehta hai.
 *
 * ── Kyun NAYA file, purani file edit kyun nahi ─────────────────────────────
 *
 * `EmailOff` ko chhua hi nahi — wo 149 page par chal raha hai aur uska apna
 * gate hai. Ye uske UPAR ek patli layer hai. Agar string me email nahi hai
 * to ye bilkul wahi text return karta hai jo pehle tha — yaani jahan email
 * nahi hai wahan rendered HTML me EK BHI byte ka farak nahi padta.
 *
 * ── Glue bug (class A) se bachav ──────────────────────────────────────────
 *
 * Email ke aas-paas ka space string ke andar hi rehta hai (`slice` kuch
 * nahi kaatta), isliye "Email:" aur address ke beech ki space nahi marti.
 */
import type { ReactNode } from 'react';
import EmailOff from './EmailOff';

/* Jaan-boojh kar seedha-saada: local-part @ domain . tld
   Hamari saari strings me yahi shakal hai. Zyada chalaak regex katastrophe
   backtracking de sakta hai, isliye nahi. */
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

export type EmailSafeTextProps = {
  /** Jo text dikhana hai. Isme email ho bhi sakta hai, nahi bhi. */
  text: string;
  /** true ho to email clickable mailto: banega. Default: sirf text. */
  link?: boolean;
};

export default function EmailSafeText({ text, link = false }: EmailSafeTextProps) {
  const s = String(text ?? '');

  /* Tez raasta: 99% strings me '@' hai hi nahi — unhe chhua bhi nahi jaata,
     to purane page ka HTML byte-for-byte wahi rehta hai. */
  if (s.indexOf('@') === -1) return <>{s}</>;

  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;

  /* lastIndex reset — module-level /g regex state rakhta hai. */
  EMAIL_RE.lastIndex = 0;
  let m: RegExpExecArray | null = EMAIL_RE.exec(s);
  while (m !== null) {
    if (m.index > last) out.push(<span key={`t${n}`}>{s.slice(last, m.index)}</span>);
    out.push(<EmailOff key={`e${n}`} email={m[0]} link={link} />);
    last = m.index + m[0].length;
    n += 1;
    m = EMAIL_RE.exec(s);
  }

  if (last === 0) return <>{s}</>;            // '@' tha par email nahi mila
  if (last < s.length) out.push(<span key={`t${n}`}>{s.slice(last)}</span>);

  return <>{out}</>;
}
