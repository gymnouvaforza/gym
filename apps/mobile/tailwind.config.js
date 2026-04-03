/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/mobile-contracts/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nf: {
          base: "#FAFAF5",
          surface: "#FFFFFF",
          soft: "#F4F4EF",
          muted: "#E3E3DE",
          panel: "#1A1C19",
          primary: "#AE0011",
          accent: "#D71920",
          info: "#00588F",
          line: "#E5E0D8",
          text: "#1A1C19",
          secondary: "#5D3F3C",
          inactive: "#A8A29E",
        },
      },
      fontFamily: {
        display: ["Epilogue_900Black"],
        "display-bold": ["Epilogue_700Bold"],
        sans: ["Inter_400Regular"],
        "sans-bold": ["Inter_700Bold"],
        "sans-black": ["Inter_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
