import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  safelist: ['pb-pattern-bg'],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0D100A',
          card: '#1C2012',
        },
        olive: '#3A4020',
        cream: '#F5EFE6',
        beige: '#EDD9BC',
        gold: '#D4A84B',
        muted: '#C8C8C2',
        live: '#FF3B3B',
        success: '#6DB56D',
        error: '#E05555',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
