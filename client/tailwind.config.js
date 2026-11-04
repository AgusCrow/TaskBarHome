/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emai: {
          deep: '#162a30',
          deeper: '#0f2026',
          surface: '#20393f',
          surfaceHover: '#2a4a52',
          accent: '#f1bc90',
          accentHover: '#ffd3ad',
          accentDark: '#283135',
          ink: '#f4f5f1',
          muted: '#c4d5d8',
          line: 'rgba(230, 244, 245, 0.24)',
          cardBg: 'rgba(32, 57, 63, 0.72)',
        }
      },
      fontFamily: {
        sans: ['Rubik', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
