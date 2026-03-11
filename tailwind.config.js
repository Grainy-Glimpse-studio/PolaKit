/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#EBE4D8',
        },
        polaroid: {
          white: '#FEFEFE',
          shadow: 'rgba(0, 0, 0, 0.08)',
        },
        // Pixel-style color palette (coordinated with cream theme)
        pixel: {
          bg: '#FAF8F5',        // cream-100
          panel: '#FFFFFF',      // panel background
          border: '#2a2a2a',     // hard border
          text: '#2a2a2a',       // text
          accent: '#8b5cf6',     // violet-500 (legacy)
          shadow: '#1a1a1a',     // 3D shadow
          gray: '#c0c0c0',       // button default gray
          // Polaroid brand colors
          orange: '#f97316',     // Orange (GaussianBg)
          yellow: '#fdc800',     // Polaroid Supernova (Cropper)
          cyan: '#00a3e2',       // Polaroid Cerulean (PrintLayout)
          rose: '#f43f5e',       // rose-500 (legacy)
        },
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'polaroid': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'polaroid-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 30px 60px -15px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
}
