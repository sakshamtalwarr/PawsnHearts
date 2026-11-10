/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff9eb',
          100: '#ffefc6',
          200: '#ffde88',
          300: '#ffc64a',
          400: '#f39c12',
          500: '#e67e22',
          600: '#d35400',
          700: '#b03a00',
          800: '#8c2e00',
          900: '#732704',
        },
        rescue: {
          bg: '#fff9ef',
          surface: '#ffffff',
          dark: '#1e293b',
          muted: '#64748b',
          success: '#10b981',
          danger: '#ef4444',
          accent: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Nunito', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
        handwriting: ['Caveat', 'Dancing Script', 'cursive'],
        script: ['Dancing Script', 'cursive'],
      },
      boxShadow: {
        'glass': '0 15px 35px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        'glow': '0 0 25px rgba(243, 156, 18, 0.35)',
        'playful': '0 12px 28px -6px rgba(243, 156, 18, 0.2), 0 8px 12px -4px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(4deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        wag: {
          '0%, 100%': { transform: 'rotate(-12deg)' },
          '50%': { transform: 'rotate(18deg)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'wiggle-slow': 'wiggle 3s ease-in-out infinite',
        'wag-tail': 'wag 0.8s ease-in-out infinite origin-bottom-left',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
