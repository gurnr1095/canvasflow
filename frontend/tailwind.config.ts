import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Courier New', 'monospace'],
      },
      colors: {
        dark: {
          bg: '#0A0A0A',
          panel: '#121212',
          'panel-hover': '#1C1C1C',
          border: '#1F1F1F',
          'border-focus': '#2E2E2E',
        },
        accent: {
          cyan: '#06B6D4',
          blue: '#2563EB',
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          900: '#4c1d95',
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
