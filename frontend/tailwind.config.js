/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#09090b',     // page background, near black
        panel: '#18181b',    // raised surfaces
        primary: '#fde68a',  // brand accent, pastel yellow
        danger: '#ef4444',   // fault state in the chart
        warning: '#f59e0b',  // the 50% decision threshold
        success: '#10b981',  // clear state in the chart
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.55)' },
          '70%': { boxShadow: '0 0 0 14px rgba(239,68,68,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '50%': { transform: 'translateY(8px)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'scroll-hint': 'scroll-hint 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
