export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A2B4C',
        accent: '#28A745',
        ink: '#0f172a',
        surface: '#F7F9FB',
        platinum: '#B0B0B0'
      },
      boxShadow: {
        soft: '0 20px 60px -30px rgba(15, 23, 42, 0.35)',
        glow: '0 18px 45px -18px rgba(40, 167, 69, 0.45)'
      }
    }
  },
  plugins: []
};
