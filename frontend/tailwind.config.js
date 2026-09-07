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
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          text: '#F8FAFC',
          accent: '#0EA5E9'
        },
        light: {
          bg: '#F1F5F9',
          card: '#FFFFFF',
          border: '#CBD5E1',
          text: '#0F172A',
          accent: '#0284C7'
        }
      }
    },
  },
  plugins: [],
}
