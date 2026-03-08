export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#5F8B6E',
          hover: '#4D7359',
        },
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(22,27,24,0.03), 0 2px 8px rgba(22,27,24,0.04)',
        soft: '0 4px 16px rgba(22,27,24,0.06), 0 2px 6px rgba(22,27,24,0.04)',
      },
    },
  },
  plugins: [],
}
