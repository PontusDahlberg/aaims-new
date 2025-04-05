// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
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
  