/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a0f2c',
          light: '#0d1438',
          dark: '#060a1e',
          card: '#0f1640',
        },
        cyan: {
          neon: '#00d4ff',
          glow: '#00b8d9',
          soft: '#7df5ff',
          dim: '#004d5e',
        },
        blue: {
          accent: '#1e3a8a',
          bright: '#3b82f6',
          electric: '#4f6ef7',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(0,212,255,0.2)',
          hover: 'rgba(0,212,255,0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-navy': 'linear-gradient(135deg, #0a0f2c 0%, #0d1a4a 50%, #0a0f2c 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00d4ff, #0066ff)',
        'gradient-card': 'linear-gradient(135deg, rgba(15,22,64,0.9) 0%, rgba(10,15,44,0.95) 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0,212,255,0.5), 0 0 40px rgba(0,212,255,0.2)',
        'neon-sm': '0 0 10px rgba(0,212,255,0.4)',
        'neon-lg': '0 0 40px rgba(0,212,255,0.6), 0 0 80px rgba(0,212,255,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
        'card': '0 20px 60px rgba(0,0,0,0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'glow-spin': 'glowSpin 8s linear infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.9), 0 0 80px rgba(0,212,255,0.4)' },
        },
        glowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
