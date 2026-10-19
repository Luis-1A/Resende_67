/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#174F88',
        blueBrand: '#318DE0',
        skyBrand: '#79C5FF',
        celBrand: '#B9E0FF',
        mistBrand: '#EAF5FF',
        iceBrand: '#F5FAFF',
        silverBrand: '#DCE5EE',
      },
      fontFamily: {
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
