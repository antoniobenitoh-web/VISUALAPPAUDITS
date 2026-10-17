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
          orange: '#ff6900',
          dark: '#0f172a',
          navy: '#0b132b',
          accent: '#0284c7'
        }
      }
    },
  },
  plugins: [],
}
