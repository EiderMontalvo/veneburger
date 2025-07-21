/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#ff6b35',
          'secondary': '#f7c59f',
          'dark': '#2b2d42',
          'light': '#f8f9fa',
          'text': '#333333',
          'border': '#dddddd',
        },
        fontFamily: {
          'sans': ['Poppins', 'system-ui', 'sans-serif'],
          'heading': ['Poppins', 'system-ui', 'sans-serif'],
        },
        boxShadow: {
          'light': '0 3px 10px rgba(0, 0, 0, 0.1)',
          'medium': '0 8px 15px rgba(0, 0, 0, 0.2)',
        },
        borderRadius: {
          'xl': '12px',
          'button': '25px',
        },
        screens: {
          'xs': '375px',
          'sm': '576px',
          'md': '768px',
          'lg': '992px',
          'xl': '1200px',
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          }
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-out forwards',
        },
      },
    },
    plugins: [],
  }