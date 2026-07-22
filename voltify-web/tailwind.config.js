/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Voltify tasarım renkleri (design system)
        primary: '#366b00',
        'primary-container': '#7bc043',
        'on-primary': '#ffffff',
        'on-primary-container': '#244b00',
        secondary: '#00658d',
        'secondary-container': '#c6e7ff',
        'on-secondary': '#ffffff',
        tertiary: '#705d00',
        'tertiary-container': '#ccac00',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        surface: '#f7faf9',
        'surface-container': '#ebefed',
        'surface-container-low': '#f1f4f3',
        'surface-container-high': '#e6e9e7',
        'on-surface': '#181c1c',
        'on-surface-variant': '#414939',
        outline: '#727a67',
        'outline-variant': '#c1cab4',
      },
      fontFamily: {
        // Tasarımda kullanılan fontlar
        heading: ['Geist', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
      },
    },
  },
  plugins: [],
}