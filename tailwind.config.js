/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cores Principais
        primary: {
          dark: '#3C096C',
          DEFAULT: '#7B2CBF',
          light: '#C77DFF',
        },
        // Cores de Fundo[cite: 1]
        background: {
          main: '#F4F4F9',
          alt: '#faf9f5',
        }
      },
      fontFamily: {
        // Tipografia baseada no protótipo[cite: 1]
        poppins: ['Poppins', 'sans-serif'],
        'poppins-bold': ['Poppins-Bold', 'sans-serif'],
      }
    },
  },
  plugins: [],
}