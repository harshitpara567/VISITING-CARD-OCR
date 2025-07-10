// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-600': '#2563eb',
      },
      padding: {
        '2.5': '10px',
        '6': '24px',
        '16': '64px',
        '24': '96px',
      },
      margin: {
        '1.5': '6px',
      },
      fontSize: {
        base: '16px',
      },
      fontWeight: {
        semibold: '600',
      },
    },
  },
  plugins: [],
};
