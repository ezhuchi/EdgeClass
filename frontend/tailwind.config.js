/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral palette - professional and minimal
        'neutral': {
          'light': '#ffffff',
          'light-bg': '#f8f9fa',
          'light-border': '#e5e7eb',
          'light-secondary': '#f3f4f6',
          'dark': '#1a1a1a',
          'dark-bg': '#0f0f0f',
          'dark-border': '#2d2d2d',
          'dark-secondary': '#1f1f1f',
        },
        // Subtle accent - only for essential highlights
        'accent': {
          'light': '#2563eb', // Professional blue
          'dark': '#60a5fa',
        }
      },
      fontFamily: {
        'sans': ['"Inter"', '"Segoe UI"', '"Roboto"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      }
    },
  },
  plugins: [],
}
