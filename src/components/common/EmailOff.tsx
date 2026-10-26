/**
 * EmailOff — Cloudflare ke "Email Address Obfuscation" se ek email ko BACHATA hai.
 *
 * ── Problem jo ye solve karta hai (26 Oct 2026 ko naapa gaya) ──────────────
 *
 * Cloudflare ka Scrape Shield → "Email Address Obfuscation" ON hai. Wo har
 * response HTML ko padhta hai aur jo bhi email dikhta hai use is me badal
 * deta hai:
 *
 *     <a href="/cdn-cgi/l/email-protection" class="__cf_email__"
 *        data-cfemail="186b6d...">[email&nbsp;protected]</a>
 *
 * Do nuksaan, dono naape gaye:
 *
 *   1. /cdn-cgi/l/email-protection  →  HTTP 404
 *      Footer har page par hai, isliye 149/149 page par ek TOOTA HUA andruni
 *      link baith gaya. `final-verify.py` ka link-check isi par FAIL deta tha
 *      (45 PASS / 1 FAIL). Google Search Console bhi ise "Not found (404)"
 *      ginta hai.
 *
 *   2. Google ko asli email dikhta hi nahi — use "[email protected]" dikhta
 *      hai. Local SEO me NAP (Name-Address-Phone) consistency matter karti
 *      hai; email bhi usi block ka hissa hai. Obfuscate hone se wo signal
 *      mar jaata hai.
 *
 * ── Fix ────────────────────────────────────────────────────────────────────
 *
 * Cloudflare khud ek opt-out deta hai: jo content `<!--email_off-->` aur
 * `<!--/email_off-->` ke beech ho, usko wo haath nahi lagata. Ye dashboard
 * toggle ke bina kaam karta hai — sirf HTML me comment chahiye.
 *
 * React me `{/* ... *\/}` sirf JSX comment hai, HTML me nikalta hi nahi.
 * Isliye asli HTML comment chaahiye → `dangerouslySetInnerHTML`.
 *
 * ── Suraksha ───────────────────────────────────────────────────────────────
 *
 * `dangerouslySetInnerHTML` tabhi khatarnak hai jab user ka data andar jaaye.
 * Yahan sirf email aane deta hoon aur usko ek strict allow-list se chhaanta
 * hoon: A-Z a-z 0-9 @ . _ + -  — iske alawa har character gir jaata hai.
 * Isliye koi `<`, `>`, `"`, `'` ya `&` andar ja hi nahi sakta.
 *
 * className bhi usi tarah chhanta hai (sirf Tailwind-जैसा safe charset).
 *
 * Hydration: `dangerouslySetInnerHTML` ka andar React diff nahi karta,
 * isliye server aur client ka HTML ek hi string hai — mismatch nahi hota.
 */

const EMAIL_OK = /[^A-Za-z0-9@._+-]/g;
const CLASS_OK = /[^A-Za-z0-9 _:/[\]().,%#-]/g;

export type EmailOffProps = {
  /** Jo email dikhana hai. Allow-list se saaf kiya jaata hai. */
  email: string;
  /** true ho to clickable mailto: anchor banta hai, warna sirf text. */
  link?: boolean;
  /** anchor par lagne wali class (sirf tab jab link=true). */
  linkClassName?: string;
};

export default function EmailOff({ email, link = false, linkClassName = '' }: EmailOffProps) {
  const safe = String(email).replace(EMAIL_OK, '');
  if (!safe) return null;

  const cls = String(linkClassName).replace(CLASS_OK, '');
  const inner = link
    ? `<a href="mailto:${safe}"${cls ? ` class="${cls}"` : ''}>${safe}</a>`
    : safe;

  return (
    <span
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: `<!--email_off-->${inner}<!--/email_off-->` }}
    />
  );
}
