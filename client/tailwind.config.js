/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tv: {
          bg: '#090d16',
          panel: 'rgba(15, 23, 42, 0.75)',
          panelBorder: 'rgba(255, 255, 255, 0.12)',
          accent: '#38bdf8',
          accentGlow: 'rgba(56, 189, 248, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

