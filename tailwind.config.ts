import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#040711',
          900: '#070D1E',
          800: '#0A1128',
        },
        slate: {
          midnight: '#0D162B',
          royal: '#111D38',
        },
        gold: {
          champagne: '#F5E6AB',
          royal: '#D4AF37',
          antique: '#C59B27',
          deep: '#9B7811',
        },
        pearl: '#FDFBF7',
        almond: '#D1D5DB',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 35px -5px rgba(212, 175, 55, 0.25)',
        'gold-glow-lg': '0 0 50px -5px rgba(212, 175, 55, 0.4)',
        'gate-depth': '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(212, 175, 55, 0.2)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
