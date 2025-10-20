/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'wood-brown': {
          50: '#faf7f0',
          100: '#f4ede0',
          200: '#e8d9c0',
          300: '#d9c195',
          400: '#c9a570',
          500: '#b8884f',
          600: '#a67843',
          700: '#8b613a',
          800: '#704f33',
          900: '#5c412b'
        },
        'natural-green': {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce4bc',
          300: '#8ed18e',
          400: '#5bb85b',
          500: '#3a9f3a',
          600: '#2d7f2d',
          700: '#266526',
          800: '#225122',
          900: '#1e431e'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}