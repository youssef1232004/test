/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f3ff',   // Cyberpunk blue
          green: '#00ff66',  // Steam-ish green
          purple: '#bc13fe'  // Neon purple
        }
      }
    },
  },
  plugins: [],
}