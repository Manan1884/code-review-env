module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0d0d',
        surface: '#141414',
        surfaceBorder: '#1f1f1f',
        primary: '#00ff88',
        style: '#60a5fa',
        logic: '#fbbf24',
        security: '#f87171',
        approved: '#34d399',
        rejected: '#f87171',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
