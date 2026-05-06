/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0edff',
          100: '#e0dbff',
          200: '#c4b8ff',
          300: '#a593ff',
          400: '#8a6fff',
          500: '#6c63ff',
          600: '#5a4fe0',
          700: '#4840b8',
          800: '#373190',
          900: '#252268',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          card:    '#16162a',
          border:  '#2a2a4a',
          hover:   '#1e1e38',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #6c63ff 0%, #00d2ff 100%)',
        'card-gradient': 'linear-gradient(145deg, #16162a 0%, #1a1a35 100%)',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease forwards',
        'slide-up':     'slideUp 0.4s ease forwards',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':    'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        glow:     '0 0 20px rgba(108, 99, 255, 0.35)',
        'glow-lg':'0 0 40px rgba(108, 99, 255, 0.25)',
        card:     '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
