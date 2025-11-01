/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        boardRed: "#FADCD9",
        primary: "#213547",
        gray_light: "#e9ebee",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      fontSize: {
        h1: [
          "24px",
          {
            lineHeight: "56px",
            fontWeight: "600",
            letterSpacing: "0.5px",
          },
        ],
      },
      textColor: {
        h1: "#2c3e50",
      },
    },
  },
  plugins: [],
};
