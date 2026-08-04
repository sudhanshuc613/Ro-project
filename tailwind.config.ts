import type { Config } from 'tailwindcss';

/**
 * AquaNexa Design System v2 — "Premium Utility"
 *
 * ── WHY THE PALETTE CHANGED ───────────────────────────────────────────────
 * v1 used bright cyan (#06B6D4) on pure white. That is the default Tailwind
 * cyan, and it is what every low-budget RO/plumbing template in India uses —
 * it reads "made from a template", which is exactly the opposite of the
 * trust signal a service business needs before someone lets a stranger into
 * their kitchen.
 *
 * v2 follows the palette structure premium service brands actually use
 * (deep anchor + restrained accent + warm neutral + one metallic):
 *
 *   NAVY  #0A1F3C   Authority anchor. Deeper and cooler than v1 so white
 *                   text hits 14:1 contrast — far past WCAG AA.
 *   TEAL  #1590A5   Water association without the neon. Desaturated ~35%
 *                   from cyan-500, which is what separates "premium" from
 *                   "clip art" — luxury palettes mute, they never max out.
 *   GOLD  #C09A3E   Metallic signal colour. Used ONLY for credibility marks
 *                   — ratings, warranty seals, guarantee badges. Rare use is
 *                   what keeps it feeling expensive rather than gaudy.
 *   SAND  #FAF8F5   Warm off-white canvas. Pure #FFF everywhere is the
 *                   single biggest "template" tell; a warm neutral base is
 *                   the current premium standard and cuts screen glare.
 *
 * Semantic CTA colours (green = call, orange = buy) are kept because they
 * are conversion-critical, but both are deepened one step so they sit inside
 * the palette instead of shouting over it.
 *
 * Token NAMES are unchanged (aqua-500, navy-700 …) so every existing
 * component inherits the new look with no rewrite and nothing can break.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* Primary — refined deep teal (was neon cyan) */
        aqua: {
          50: '#EDFAFB', 100: '#D2F2F5', 200: '#A8E4EA', 300: '#71CEDA',
          400: '#3AAFC0', 500: '#1590A5', 600: '#0F7387', 700: '#0D5C6E',
          800: '#0E4B59', 900: '#0F3E49',
        },
        /* Anchor — deeper, cooler navy */
        navy: {
          50: '#F2F5F9', 100: '#E1E8F0', 200: '#C2D0E0', 300: '#93A8C4',
          400: '#5C789E', 500: '#2E4A72', 600: '#16304F', 700: '#0A1F3C',
          800: '#07162C', 900: '#040D1C',
        },
        /* Metallic credibility accent — use sparingly */
        gold: {
          50: '#FDF9EE', 100: '#F9F0D5', 200: '#F0DFA8', 300: '#E5CB7A',
          400: '#D4B252', 500: '#C09A3E', 600: '#A37F2E', 700: '#7F6124',
          800: '#5E4720', 900: '#3F301A',
        },
        /* Warm neutral surfaces — replaces pure white / cold slate */
        sand: {
          50: '#FDFCFA', 100: '#FAF8F5', 200: '#F4F0E9', 300: '#EAE4D9',
          400: '#D9D0C0', 500: '#B8AC96',
        },
        cta: {
          orange: '#EA580C', orangeDark: '#C2410C',
          green: '#15803D', greenDark: '#116430',
        },
        ink: '#0B1524',
        muted: '#5B6B80',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'var(--font-inter)', 'sans-serif'],
      },
      /**
       * Layered shadows with a navy tint rather than neutral black.
       * Coloured shadows are the detail that separates a designed interface
       * from a bootstrapped one — black shadows look like dirt on light UI.
       */
      boxShadow: {
        card: '0 1px 2px rgba(10,31,60,.05), 0 2px 6px rgba(10,31,60,.05)',
        'card-hover': '0 4px 10px rgba(10,31,60,.07), 0 16px 34px rgba(10,31,60,.12)',
        cta: '0 4px 14px rgba(234,88,12,.28), 0 1px 3px rgba(234,88,12,.20)',
        call: '0 4px 14px rgba(21,128,61,.26), 0 1px 3px rgba(21,128,61,.18)',
        nav: '0 1px 0 rgba(10,31,60,.06), 0 4px 18px rgba(10,31,60,.06)',
        lift: '0 24px 48px -18px rgba(10,31,60,.28)',
        inset: 'inset 0 1px 0 rgba(255,255,255,.09)',
      },
      backgroundImage: {
        'aqua-gradient': 'linear-gradient(135deg,#1590A5 0%,#0F7387 52%,#0A1F3C 100%)',
        'navy-gradient': 'linear-gradient(135deg,#0A1F3C 0%,#16304F 100%)',
        'hero-deep': 'linear-gradient(118deg,#07162C 0%,#0A1F3C 38%,#0D5C6E 100%)',
        'gold-sheen': 'linear-gradient(100deg,#A37F2E 0%,#D4B252 45%,#A37F2E 100%)',
        wave: "url('/brand/wave.svg')",
      },
      keyframes: {
        ripple: { '0%': { transform: 'scale(.9)', opacity: '.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        floatY: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        riseIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        ripple: 'ripple 1.6s ease-out infinite',
        floatY: 'floatY 4s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        riseIn: 'riseIn .5s cubic-bezier(.22,1,.36,1) both',
      },
      screens: { xs: '420px' },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

export default config;
