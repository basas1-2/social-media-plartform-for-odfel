/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1877f2',
        'primary-dark': '#166fe5',
        secondary: '#42b72a',
        'secondary-dark': '#36a420',
      },
    },
  },
  plugins: [],
};
