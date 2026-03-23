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
        bg: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        'b-subtle': 'var(--border-subtle)',
        'b-default': 'var(--border-default)',
        'b-strong': 'var(--border-strong)',
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'muted': 'var(--text-muted)',
        brand: {
          DEFAULT: 'var(--brand)',
          dim: 'var(--brand-dim)',
        },
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xl: '16px',
        lg: '12px',
        md: '10px',
        sm: '6px',
        full: '9999px',
      },
      backgroundImage: {
        'radial-brand': 'radial-gradient(circle at center, var(--brand-dim) 0%, transparent 70%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
