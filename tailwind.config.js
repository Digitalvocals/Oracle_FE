/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'matrix-dark': '#000000',
        'matrix-medium': '#0a0a0a',
        'matrix-light': '#1a1a1a',
        'matrix-green': '#00ff00',
        'matrix-green-bright': '#39ff14',
        'matrix-green-dim': '#006600',
        'matrix-accent': '#00cc00',
      },
      fontFamily: {
        'mono': ['"Courier New"', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00' },
          '100%': { textShadow: '0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00' },
        }
      }
    },
  },
  plugins: [],
}
