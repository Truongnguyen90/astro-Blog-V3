/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.5rem" }],
      base: ["1rem", { lineHeight: "1.75rem" }],
      lg: ["1.125rem", { lineHeight: "2rem" }],
      xl: ["1.25rem", { lineHeight: "2rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["2rem", { lineHeight: "2.5rem" }],
      "4xl": ["2.5rem", { lineHeight: "3.5rem" }],
      "5xl": ["3rem", { lineHeight: "3.5rem" }],
      "6xl": ["3.75rem", "1"],
      "7xl": ["4.5rem", "1.1"],
      "8xl": ["6rem", "1"],
      "9xl": ["8rem", "1"],
    },
    fontFamily: {
      sans: ["Satoshi", ...defaultTheme.fontFamily.sans],
      mono: ["JetBrains Mono", ...defaultTheme.fontFamily.sans],
      display: ["Instrument Serif", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      white: colors.white,
      black: colors.black,
      zinc: colors.neutral,
      blue: colors.blue,
      transparent: colors.transparent,
      currentColor: colors.currentColor,
      base: "#191919",
    },
    extend: {
      boxShadow: {
        "3xl":
          "rgba(0, 0, 0, 0.1) 0px 4px 10px -2px, rgba(0, 0, 0, 0.1) 0px 2px 2px -1px, rgba(255, 255, 255, 0.08) 0px 0px 0px 1px",
        "3xlHover":
          "0 -2px 6px hsla(0,0%,100%,.17),0 5px 18px rgba(0,0,0,.4),0 4px 40px 8px rgba(0,0,0,.4),0 1px 4px -1px rgba(0,0,0,.302),inset 0 0 0 .3px hsla(0,0%,100%,.3),0 0 0 .5px hsla(0,0%,100%,.4)",
      },

      animation: {
        marquee: "marquee 12s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
