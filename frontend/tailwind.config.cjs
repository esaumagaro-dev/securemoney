module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B5FFF',
          dark: '#0044CC',
        },
        card: '#FFFFFF',
        muted: '#6B7280',
      },
      boxShadow: {
        premium: '0 4px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
