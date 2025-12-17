/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // 👈 make sure this line exists
  ],
  theme: {
    extend: {
      fontFamily: {
        classic: ['Roboto', 'sans-serif'], // add your font here
      },
    },
  },
  plugins: [],
  
}
