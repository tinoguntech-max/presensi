/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 50px rgba(74, 222, 128, 0.18)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(255,255,255,0.97), rgba(240,253,244,0.80), rgba(236,253,245,0.75))',
      },
    },
  },
  plugins: [],
};
