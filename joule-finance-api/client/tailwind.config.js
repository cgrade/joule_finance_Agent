/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dce3fd',
          300: '#c5d1fb',
          400: '#a6b4f7',
          500: '#8c99f3', // Main primary color
          600: '#6366f1', // Tailwind indigo-500
          700: '#4f46e5', // Tailwind indigo-600
          800: '#4338ca',
          900: '#3730a3',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Main secondary color
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(0.7)', opacity: '0.5' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 