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
        bg:         'var(--color-bg)',
        surface:    'var(--color-surface)',
        panel:      'var(--color-panel)',
        border:     'var(--color-border)',
        foreground: 'var(--color-foreground)',
        muted:      'var(--color-muted)',
        subtle:     'var(--color-subtle)',
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover:   'var(--color-brand-hover)',
          muted:   'var(--color-brand-muted)',
        },
        status: {
          active:  'var(--color-status-active)',
          running: 'var(--color-status-running)',
          idle:    'var(--color-status-idle)',
          error:   'var(--color-status-error)',
        },
        domain: {
          content:  'var(--color-domain-content)',
          sales:    'var(--color-domain-sales)',
          ops:      'var(--color-domain-ops)',
          research: 'var(--color-domain-research)',
          finance:  'var(--color-domain-finance)',
          hr:       'var(--color-domain-hr)',
          tech:     'var(--color-domain-tech)',
        },
      },
      fontFamily: {
        sans:    ['var(--font-sans)',    'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px', md: '10px', lg: '12px', xl: '16px', '2xl': '20px', full: '9999px',
      },
      boxShadow: {
        card:         '0 0 50px -10px rgba(99,102,241,0.08)',
        'card-hover': '0 0 30px -5px rgba(99,102,241,0.25)',
        'glow-sm':    '0 0 20px -5px rgba(99,102,241,0.5)',
        'glow-md':    '0 0 30px -5px rgba(99,102,241,0.6)',
        'glow-gold':  '0 0 20px rgba(139,92,246,0.3)',
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
export default config
