import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6b9d',
          dark: '#ff3370',
          light: '#ffb0c8',
        },
        accent: {
          DEFAULT: '#c44dff',
          dark: '#9d3fd9',
          light: '#d980ff',
        },
        surface: {
          DEFAULT: '#0a0a0f',
          card: 'rgba(10, 10, 20, 0.92)',
          hover: 'rgba(255, 100, 150, 0.15)',
        },
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff6b9d, #c44dff)',
        'gradient-card': 'linear-gradient(135deg, rgba(255, 80, 130, 0.1), rgba(180, 60, 255, 0.1))',
      },
      boxShadow: {
        glow: '0 0 60px rgba(255, 50, 100, 0.05)',
        'glow-strong': '0 0 15px rgba(255, 100, 150, 0.3)',
      },
      animation: {
        pulse: 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
