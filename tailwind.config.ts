import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rethink Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        thermal: {
          base: '#0a0f1e',
          card: '#0f172a',
          cold: '#38bdf8',
          warm: '#f97316',
          rad: '#e879f9',
          hot: '#ef4444',
        },
      },
      boxShadow: {
        glow: '0 0 18px rgba(56, 189, 248, 0.08)',
        warm: '0 0 16px rgba(249, 115, 22, 0.08)',
        rad: '0 0 16px rgba(232, 121, 249, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
