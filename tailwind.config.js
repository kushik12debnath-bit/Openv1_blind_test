/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coke: {
          DEFAULT: '#F40009',
          hover: '#D10007',
          subtle: 'rgba(244, 0, 9, 0.08)',
        },
        executive: '#09090B',
        surface: '#F8FAFC',
        card: '#FFFFFF',
        edge: '#E2E8F0',
        competitor: '#3B82F6',
        indecisive: '#94A3B8',
      },
      boxShadow: {
        ambient: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        lift: '0 12px 40px -8px rgba(15, 23, 42, 0.18)',
      },
      borderRadius: {
        bento: '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
