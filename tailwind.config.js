/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dynamic theme colors from CSS variables
        'theme-primary': 'var(--color-primary)',
        'theme-secondary': 'var(--color-secondary)',
        'theme-accent': 'var(--color-accent)',
        'theme-gold': 'var(--color-gold)',
        'theme-background': 'var(--color-background)',
        'theme-text': 'var(--color-text)',
        'theme-text-light': 'var(--color-text-light)',
        'theme-primary-light': 'var(--color-primary-light)',
        'theme-primary-dark': 'var(--color-primary-dark)',
        'theme-secondary-light': 'var(--color-secondary-light)',
        'theme-secondary-dark': 'var(--color-secondary-dark)',

        // Static color palette for fallbacks
        primary: {
          50: '#e6eef5',
          100: '#ccdcea',
          200: '#99b9d5',
          300: '#6696c0',
          400: '#3373ab',
          500: '#1a3d52', // Navy - main brand color
          600: '#153246',
          700: '#10263a',
          800: '#0a1a2d',
          900: '#050d17',
        },
        secondary: {
          50: '#e6f7f5',
          100: '#ccefeb',
          200: '#99dfd7',
          300: '#66cfc3',
          400: '#33bfaf',
          500: '#00a89c', // Teal - secondary color
          600: '#00867d',
          700: '#00655e',
          800: '#00433e',
          900: '#00221f',
        },
        accent: {
          50: '#fde8eb',
          100: '#fbd1d8',
          200: '#f7a3b1',
          300: '#f3758a',
          400: '#ef4763',
          500: '#c41e3a', // Red - accent color
          600: '#9d182e',
          700: '#761223',
          800: '#4e0c17',
          900: '#27060c',
        },
        gold: {
          50: '#fcf8eb',
          100: '#f9f1d7',
          200: '#f3e3af',
          300: '#edd587',
          400: '#e7c75f',
          500: '#d4a851', // Gold - premium accent
          600: '#aa8641',
          700: '#7f6531',
          800: '#554320',
          900: '#2a2210',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Event category colors
        sports: '#00a89c',
        cultural: '#8b5cf6',
        academic: '#3b82f6',
        social: '#f59e0b',
        workshop: '#8b5cf6',
        networking: '#10b981',
        celebration: '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(0, 168, 156, 0.3)',
        'glow-gold': '0 0 15px rgba(212, 168, 81, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
