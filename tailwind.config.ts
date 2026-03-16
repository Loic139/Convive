import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          DEFAULT: '#F5F0E8',
          dark: '#EAE3D2',
          darker: '#D9CFBB',
        },
        terracotta: {
          DEFAULT: '#C4714A',
          light: '#D4876A',
          dark: '#A85C38',
          50: '#FBF0EB',
          100: '#F5DDD3',
        },
        sage: {
          DEFAULT: '#7D9B76',
          light: '#96B08F',
          dark: '#5E7A58',
          50: '#EEF4ED',
          100: '#D8EBD6',
        },
        amber: {
          warm: '#D4934A',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
