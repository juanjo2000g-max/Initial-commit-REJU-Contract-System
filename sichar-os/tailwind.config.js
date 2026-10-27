/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        naranja: { DEFAULT: '#F47920', 50: '#FFF4EC', 100: '#FFE4CF', 200: '#FDC49B', 400: '#F8964F', 600: '#DC6410', 700: '#B44F0A' },
        tinta: { DEFAULT: '#141414', 800: '#1E1E1E', 700: '#2A2A2A', 600: '#3A3A3A' },
        hueso: '#F6F3EE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        flotar: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        entrar: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        pulso: { '0%': { boxShadow: '0 0 0 0 rgba(244,121,32,.55)' }, '100%': { boxShadow: '0 0 0 14px rgba(244,121,32,0)' } },
        cinta: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        flotar: 'flotar 6s ease-in-out infinite',
        entrar: 'entrar .5s ease both',
        pulso: 'pulso 1.6s ease-out infinite',
        cinta: 'cinta 40s linear infinite',
      },
    },
  },
  plugins: [],
}
