/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: 'rgba(255,255,255,0.04)',
        borderDark: 'rgba(255,255,255,0.08)',
        textPrimary: '#f0f0f0',
        textSecondary: '#888888',
        accent: '#ffffff',
        danger: '#ff4d4d',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
