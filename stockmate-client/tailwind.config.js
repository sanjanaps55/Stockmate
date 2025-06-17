/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(12deg)' },
          '50%': { transform: 'translateY(-20px) rotate(12deg)' },
        },
        'float-medium': {
          '0%, 100%': { transform: 'translateY(0) rotate(-12deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-12deg)' },
        },
        'float-fast': {
          '0%, 100%': { transform: 'translateY(0) rotate(45deg)' },
          '50%': { transform: 'translateY(-10px) rotate(45deg)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-medium': 'float-medium 5s ease-in-out infinite',
        'float-fast': 'float-fast 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

