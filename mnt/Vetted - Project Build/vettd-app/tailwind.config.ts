import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080707',
          2: '#0f0d0d',
          3: '#150f0f',
          4: '#1e1212',
        },
        border: {
          DEFAULT: '#2a1515',
          2: '#3d1c1c',
        },
        vettd: {
          text: '#f0e8e8',
          muted: '#b08888',
          faint: '#6e4a4a',
          red: '#dc2626',
          'red-l': '#f87171',
          'red-d': '#b91c1c',
          accent: '#fca5a5',
          green: '#10b981',
          amber: '#f59e0b',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
    },
  },
  plugins: [],
}

export default config
