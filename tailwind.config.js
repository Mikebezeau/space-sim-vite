/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.jsx", "./src/**/*.tsx"],
  theme: {
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
      keyframes: {
        blink3: {
          "0%, 100%": { opacity: "0" },
          "10%, 30%, 50%": { opacity: "1" },
          "20%, 40%, 60%": { opacity: "0" },
          "70%, 100%": { opacity: "0" }, // stays off at end
        },
      },
      animation: {
        blink3: "blink3 2s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
