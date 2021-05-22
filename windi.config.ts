import { defineConfig } from 'windicss/helpers'

/**
 * WindiCSS Configuration File
 *
 * Docs: https://windicss.org/guide/configuration.html
 */
export default defineConfig({
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },
      colors: {
        copyright: '#a0a',
        language: '#585455',
        character: '#0a0',
        author: '#a00',
        general: '#0073ff',
        meta: '#f80',
        soundtrack: '#ff7792',
      },
      lineClamp: {
        '3': 3,
      },
    },
  },
  plugins: [
    // https://github.com/tailwindlabs/tailwindcss-typography#usage
    require('windicss/plugin/typography'),
    require('windicss/plugin/line-clamp'),
    require('windicss/plugin/aspect-ratio'),
  ],
})
