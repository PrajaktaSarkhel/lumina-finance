/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optional: Add a brand color for Lumina Finance
        brand: '#3b82f6',
      }
    },
  },
  plugins: [],
}