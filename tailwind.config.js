const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.coolGray,
      red: colors.red,
      yellow: colors.yellow,
      blue: colors.sky,
      orange: colors.orange,
      cyan: colors.cyan,
    },
  },
  darkMode: "media",
  plugins: [require("@tailwindcss/forms")],
};
