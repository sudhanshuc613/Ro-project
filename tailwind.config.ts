import type { Config } from 'tailwindcss';

/**
 * AquaNexa Design System
 * Primary: Aqua/Cyan · Secondary: Deep Navy · CTA: Orange (buy) / Green (call)
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        aqua: {
          50: '#ECFEFF', 100: '#CFFAFE', 200: '#A5F3FC', 300: '#67E8F9',
          400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 700: '#0E7490',
          800: '#155E75', 900: '#164E63',
        },
        navy: {
          50: '#F0F4F9', 100: '#D9E2EC', 200: '#B3C5D9', 300: '#8098B8',
          400: '#4E6E96', 500: '#13315C', 600: '#0F2A4F', 700: '#0B2545',
          800: '#081B33', 900: '#050F1F',
        },
        cta: {
          orange: '#F97316', orangeDark: '#EA580C',
          green: '#16A34A',  greenDark: '#15803D',
        },
        ink: '#0F172A',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(11,37,69,.08), 0 1px 2px rgba(11,37,69,.04)',
        'card-hover': '0 12px 28px rgba(11,37,69,.14)',
        cta: '0 6px 18px rgba(249,115,22,.35)',
        nav: '0 2px 12px rgba(11,37,69,.07)',
      },
      backgroundImage: {
        'aqua-gradient': 'linear-gradient(135deg,#06B6D4 0%,#0891B2 55%,#0B2545 100%)',
        'navy-gradient': 'linear-gradient(135deg,#0B2545 0%,#13315C 100%)',
        'wave': "url('/brand/wave.svg')",
      },
      keyframes: {
        ripple: { '0%': { transform: 'scale(.9)', opacity: '.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        floatY:  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        ripple: 'ripple 1.6s ease-out infinite',
        floatY: 'floatY 4s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      screens: { xs: '420px' },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

export default config;
