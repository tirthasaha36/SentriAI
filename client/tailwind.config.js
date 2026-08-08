/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          950: '#080E14', // Main background
          900: '#0B131A', // Secondary background
          850: '#0F1823', // Sidebar
          800: '#111C27', // Cards
          700: '#1A2938', // Borders/Hovers
        },
        'mint': {
          DEFAULT: '#5EEAD4',
          hover: '#2DD4BF',
          glow: 'rgba(94, 234, 212, 0.4)',
        },
        'emergency': '#F0524B',
        'urgent': '#F5A83C',
        'routine': '#34D399',
      },
      boxShadow: {
        'glow-mint': '0 0 25px rgba(94, 234, 212, 0.3)',
        'glow-mint-lg': '0 0 50px rgba(94, 234, 212, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
