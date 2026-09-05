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
        navy: {
          950: '#070d18',
          900: '#0c1626',
          850: '#111d33',
          800: '#172540',
          700: '#23385e',
          600: '#345288',
        },
        steel: {
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
        },
        maritime: {
          teal: '#06b6d4',
          cyan: '#22d3ee',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
