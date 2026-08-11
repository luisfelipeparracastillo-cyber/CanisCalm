/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F5',
          100: '#E7ECE9',
          200: '#C8D5CD',
          300: '#A9BEB1',
          400: '#7E9C8A',
          500: '#4E6E58', // Primary Sage Accent
          600: '#3E5846',
          700: '#2E4235',
          800: '#1F2C23',
          900: '#0F1611',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FBE8E1',
          200: '#F6CDBF',
          300: '#F0B19C',
          400: '#E59479',
          500: '#D97757', // Secondary Terracotta Accent
          600: '#C35D3B',
          700: '#9B452A',
          800: '#72301B',
          900: '#481D0F',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAF8F5', // Warm Cream Background
          200: '#F4EFE6',
          300: '#EBE3D4',
          400: '#DDD1BD',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAF9',
          border: '#E2E8E4',
        },
        ink: {
          primary: '#2C3531',
          secondary: '#5A6660',
          muted: '#8E9993',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(78, 110, 88, 0.08)',
        'hover': '0 8px 30px -4px rgba(78, 110, 88, 0.14)',
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
