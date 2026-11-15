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
        navy:         '#172B4D',   // ink
        'navy-light': '#4A5A73',   // muted
        orange:       '#E65A22',   // sunset orange
        'orange-light':'#FBE0CC',  // apricot
        ember:        '#C2471A',   // action
        peach:        '#FFF6E8',
        cream:        '#FFFBF3',
        'slate-blue': '#4A5A73',
        'soft-blue':  '#EEDFCB',
        'warm-gray':  '#FFF6E8',
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
        'card':       '0 2px 12px rgba(23,43,77,0.08)',
        'card-hover': '0 4px 24px rgba(23,43,77,0.14)',
        'orange':     '0 4px 16px rgba(230,90,34,0.30)',
      },
    },
  },
  plugins: [],
}
export default config
