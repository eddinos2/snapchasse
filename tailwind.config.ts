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
        retro: {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#FFE66D',
          dark: '#1A1A2E',
          darker: '#0F0F1E',
          light: '#F5F5F5',
        },
      },
      fontFamily: {
        retro: ['var(--font-retro)', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #FF6B6B, 0 0 10px #FF6B6B' },
          '100%': { boxShadow: '0 0 10px #FF6B6B, 0 0 20px #FF6B6B, 0 0 30px #FF6B6B' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
