import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        reader: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      colors: {
        ink: '#21133f',
        flame: '#ff5a35',
        sun: '#ffcf23',
        violet: '#7835e8',
      },
      boxShadow: {
        soft: '0 22px 60px rgba(33, 19, 63, 0.12)',
      },
    },
  },
  plugins: [typography],
}
