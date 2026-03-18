/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pizza: {
          red: '#e63946',
          dark: '#1d3557',
          light: '#f1faee',
          accent: '#457b9d',
        },
      },
    },
  },
  plugins: [],
}
