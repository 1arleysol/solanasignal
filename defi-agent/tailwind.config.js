/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0B0E',
          card: '#111318',
          elevated: '#16181F',
        },
        border: {
          subtle: '#1E2028',
          muted: '#2A2D38',
        },
        signal: {
          buy: '#00D395',
          hold: '#F59E0B',
          sell: '#FF4D4D',
        },
        brand: {
          purple: '#7C3AED',
          purpleLight: '#9D5FFF',
          green: '#00D395',
          greenDark: '#00A876',
          red: '#FF4D4D',
          amber: '#F59E0B',
          amberDark: '#D97706',
        },
        text: {
          primary: '#F1F3F9',
          secondary: '#8B90A0',
          muted: '#555B6E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'blink': 'blink 1.5s step-end infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateY(-8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
