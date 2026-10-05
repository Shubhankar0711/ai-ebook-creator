/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map to CSS variables — dark mode just swaps the variable values
        background: 'var(--color-background)',
        card:       'var(--color-card)',
        border:     'var(--color-border)',
        text: {
          DEFAULT:   'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
        },
        accent: {
          DEFAULT:    'var(--color-accent)',
          foreground: 'var(--color-text)',
        },
        primary: {
          DEFAULT:    'var(--color-primary)',
          foreground: '#ffffff',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger:  'var(--color-danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn .3s ease-out',
        'slide-up': 'slideUp .3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        sm:      '0 1px 2px 0 rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0,0,0,0.08)',
        md:      '0 4px 6px -1px rgba(0,0,0,0.08)',
        lg:      '0 10px 15px -3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
