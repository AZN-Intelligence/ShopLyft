/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#fb923c", // orange-400 (main branding)
          light: "#ffedd5", // orange-100 (backgrounds)
          dark: "#ea580c", // orange-600 (headline, hover)
        },
        secondary: {
          DEFAULT: "#f97316", // orange-500 (buttons)
          dark: "#c2410c", // orange-700 (paragraph text)
        },
        neutral: {
          DEFAULT: "#fff", // white (background)
        },
        // Full orange scale for legacy compatibility
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
    },
  },
  plugins: [],
};
