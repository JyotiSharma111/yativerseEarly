/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
       display: ["'Syne'", "system-ui", "sans-serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "#050814",
          bg2: "#070a1a",
          gold: "#C9A84C",
          gold2: "#F5D27A",
          purple: "#605CFF",
          pink: "#C86DD7",
          teal: "#4ECDC4",
          rose: "#FF6B8A",
        },
      },
      backgroundImage: {
        "grad-gold":
          "linear-gradient(135deg, #C9A84C 0%, #F5D27A 50%, #C9A84C 100%)",
        "grad-brand":
          "linear-gradient(135deg, #605CFF 0%, #C86DD7 55%, #FF6B8A 100%)",
        "grad-text": "linear-gradient(135deg, #605CFF, #C86DD7, #FF6B8A)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
