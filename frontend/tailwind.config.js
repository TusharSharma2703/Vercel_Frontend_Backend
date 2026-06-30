/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f17",
        panel: "#121826",
        accent: "#7c5cff",
        accent2: "#22d3ee",
        focus: "#34d399",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(124,92,255,0.25)",
      },
    },
  },
  plugins: [],
};
