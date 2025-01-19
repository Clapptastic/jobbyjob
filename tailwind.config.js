/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: 'var(--color-neon-pink)',
          blue: 'var(--color-neon-blue)',
          purple: 'var(--color-neon-purple)',
          cyan: 'var(--color-neon-cyan)',
        },
        cyber: {
          dark: 'var(--color-cyber-dark)',
          darker: 'var(--color-cyber-darker)',
          light: 'var(--color-cyber-light)',
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, var(--color-cyber-dark) 0%, var(--color-cyber-light) 100%)',
        'neon-gradient': 'linear-gradient(135deg, var(--color-neon-pink) 0%, var(--color-neon-purple) 100%)',
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(255, 45, 85, 0.5)',
        'blue-glow': '0 0 20px rgba(46, 60, 255, 0.5)',
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        ping: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};