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
        lg: '1201px',
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
    },
  },
  plugins: [
    // https://github.com/tailwindlabs/tailwindcss-typography#usage
    require('windicss/plugin/typography'),
  ],
})
