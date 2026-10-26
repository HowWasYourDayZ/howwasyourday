import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — PROJECT.md §1a. Old names kept so existing classes still work.
        navy:         '#3B2F2A',   // ink
        'navy-light': '#6E5B50',   // muted
        orange:       '#E8743B',   // sunset orange
        'orange-light':'#FBE3D2',  // apricot
        ember:        '#B85520',   // action
        peach:        '#FFF6EF',
        cream:        '#FFFAF6',
        'slate-blue': '#6E5B50',
        'soft-blue':  '#F2DFD1',
        'warm-gray':  '#FFF6EF',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
      },
      fontWeight: {
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card':       '0 2px 12px rgba(59,47,42,0.08)',
        'card-hover': '0 4px 24px rgba(59,47,42,0.14)',
        'orange':     '0 4px 16px rgba(232,116,59,0.30)',
      },
    },
  },
  plugins: [],
}
export default config
