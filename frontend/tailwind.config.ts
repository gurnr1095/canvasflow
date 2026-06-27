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
          bg: '#0D1117',
          panel: '#161B22',
          'panel-hover': '#1C2128',
          border: '#21262D',
          'border-focus': '#30363D',
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
