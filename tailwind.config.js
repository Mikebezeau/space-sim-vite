/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.jsx"],
  extend: {
    colors: {
      menu: {
        effect: "#1EA5C7",
        header: "#3F575A",
        category: "#3F4F81",
        item: "#3E5E8D",
        text: "#90BDBE",
      },
    },
  },
  plugins: [],
};
