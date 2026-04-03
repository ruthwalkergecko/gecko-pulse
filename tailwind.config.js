/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gecko: {
          // Theme-aware — switch with CSS vars in globals.css
          dark:         'var(--gecko-dark)',
          card:         'var(--gecko-card)',
          'card-hover': 'var(--gecko-card-hover)',
          border:       'var(--gecko-border)',
          muted:        'var(--gecko-muted)',
          subtext:      'var(--gecko-subtext)',
          // Brand colours — fixed regardless of theme
          green:        '#8de971',
          'green-dim':  '#6abf54',
          blue:         '#9adbe8',
          'blue-dim':   '#72c4d4',
          white:        '#ffffff',
          red:          '#f85149',
          amber:        '#f0883e',
          yellow:       '#d29922',
        },
      },
      fontFamily: {
        // DM Sans for body — warmer, friendlier than Inter
        sans: ['var(--font-dm-sans)', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        // Syne for display/metrics — geometric, distinctive, confident
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-dot': 'pulseDot 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(0.75)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
