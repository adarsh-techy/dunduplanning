/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "brand" = pink, used for actions/accents (buttons, active states, links).
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // "navy" = the fixed dark-blue chrome color for the Navbar and
        // Sidebar -- deliberately NOT theme-dependent, so the app shell
        // stays the same dark blue whether the content area is in light or
        // dark mode.
        navy: {
          600: '#243b6b',
          700: '#1b2c52',
          800: '#131f3d',
          900: '#0d1730',
          950: '#080f20',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.06)',
        card: '0 4px 16px -4px rgb(15 23 42 / 0.10), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
};
