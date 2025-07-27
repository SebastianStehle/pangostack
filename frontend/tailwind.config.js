/** @type {import('tailwindcss').Config} */
const Color = require('color')
const darken = (clr, val) => Color(clr).darken(val).rgb().string();

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        "header": "oklch(var(--header) / <alpha-value>)",
        "google": "#DB4437",
        "google-hover": darken("#DB4437", 0.1),
        "microsoft": "#00A4EF",
        "microsoft-hover": darken("#00A4EF", 0.1),
        "cc": "rgb(27, 195, 139)"
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          ...require("daisyui/src/theming/themes")["light"],
          "--rounded-box": ".375rem",
          "--rounded-btn": ".375rem",
        },
      },
    ],
  },
}

