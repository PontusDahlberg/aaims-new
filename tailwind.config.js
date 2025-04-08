// filepath: c:\Users\PontusDahlberg\aaims-new\tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Lägg till alla mappar där Tailwind används
  ],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        purpleDeep: "#6a0dad",
        orangeBright: "#FFA500",
        darkBackground: "#1a1a1a",
        darkSurface: "#333333",
        darkAccent: "#4a4a4a",
      },
    },
  },
  plugins: [],
};