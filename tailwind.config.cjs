/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8dc451",
        secondary: "#478559",
        neutral: "#fdfffd",
        "base-100": "#232323",
        info: "#deffde",
        success: "#8dc451",
        warning: "#ffff78",
        error: "#e42a2a",
        white: "#ffffff",
        black: "#000000",
      },
    },
  },
  plugins: [],
};
