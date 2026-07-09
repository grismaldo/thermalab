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
          rad: '#a78bfa',
          hot: '#ef4444',
        },
      },
      boxShadow: {
        glow: '0 0 28px rgba(56, 189, 248, 0.14)',
        warm: '0 0 24px rgba(249, 115, 22, 0.12)',
        rad: '0 0 24px rgba(167, 139, 250, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
