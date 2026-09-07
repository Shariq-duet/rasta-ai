/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary identity: indigo. White on brand-600 is 8.0:1.
        brand: {
          50: '#eeeefb',
          100: '#dcdbf7',
          200: '#b9b7ef',
          300: '#9693e6',
          400: '#6b67d8',
          500: '#4f4bcf',
          600: '#3d3ac7',
          700: '#322fa4',
          800: '#282682',
          900: '#1b1a57',
        },
        // Accent: cyan. 300 is the identity fill; 200 is the text-on-indigo tint
        // (6.4:1 on brand-600, where 300 would only reach 4.4:1).
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#22d3ee',
          400: '#06b6d4',
          500: '#0891b2',
          600: '#0e7490',
        },
        // Positive: emerald. 400 is the identity fill; 500 is the text tone,
        // darkened to #047857 so amounts clear 4.5:1 on white (5.6:1).
        positive: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#34d399',
          400: '#059669',
          500: '#047857',
          600: '#065f46',
        },
        ink: {
          DEFAULT: '#17233e',
          soft: '#42516d',
          muted: '#78839b',
          faint: '#9ba4b6',
        },
        line: '#e8ebf2',
        surface: '#ffffff',
        canvas: '#f7f8fc',
        danger: {
          50: '#fdedef',
          500: '#d94c60',
          600: '#b93a4d',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      letterSpacing: {
        eyebrow: '0.085em',
        tightest: '-0.045em',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '0.9375rem',
        '3xl': '1.0625rem',
      },
      boxShadow: {
        card: '0 12px 35px rgba(27,44,82,0.07)',
        lift: '0 15px 27px rgba(27,44,82,0.12)',
        deep: '0 15px 38px rgba(27,44,82,0.1)',
        brand: '0 12px 25px rgba(61,58,199,0.22)',
        'brand-glow': '0 8px 18px rgba(61,58,199,0.25)',
        fab: '0 9px 20px rgba(61,58,199,0.3)',
        sheet: '0 -12px 40px rgba(14,24,45,0.16)',
        modal: '0 20px 60px rgba(14,24,45,0.25)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.86)' },
          '70%': { transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out both',
        'slide-up': 'slide-up 260ms cubic-bezier(0.22,1,0.36,1) both',
        'sheet-up': 'sheet-up 280ms cubic-bezier(0.22,1,0.36,1) both',
        'pop-in': 'pop-in 380ms cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}

export default config
