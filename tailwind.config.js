/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef1fa',
          100: '#c5cef0',
          200: '#9daae5',
          300: '#7487db',
          400: '#4c63d0',
          500: '#3349b5',
          600: '#27398e',
          700: '#1b2968',
          800: '#0f1942',
          900: '#0F2356',
          950: '#080f2b',
        },
        gold: {
          50:  '#fdf8ec',
          100: '#f8edca',
          200: '#f2dfa0',
          300: '#e8c96b',
          400: '#d9af3b',
          500: '#C8A951',
          600: '#b08a2e',
          700: '#8a6920',
          800: '#644c17',
          900: '#3e300f',
        },
        cream: '#FAFAF8',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
