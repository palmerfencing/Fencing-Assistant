/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f1f7f3",
          100: "#dfede3",
          600: "#2f6d4a",
          700: "#25583c",
          800: "#1c4430",
          900: "#142f23",
          950: "#0b1d15"
        },
        timber: {
          50: "#faf7f2",
          100: "#f2eadf",
          200: "#e4d4bd",
          400: "#bf9364",
          500: "#a97848",
          600: "#8c5d38"
        }
      },
      boxShadow: {
        card: "0 18px 45px -28px rgba(20, 47, 35, 0.32)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
