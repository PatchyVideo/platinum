/**
 * TailwindCSS Configuration File
 *
 * Docs: https://tailwindcss.com/docs/configuration
 * Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  darkMode: 'class',
  theme: {
    filter: {
      none: 'none',
      brightness: 'brightness(80%)',
    },
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
  variants: {
    filter: ['responsive'],
  },
  plugins: [
    // https://github.com/tailwindlabs/tailwindcss-typography#usage
    require('windicss/plugin/typography'),
    require('windicss/plugin/filters'),
  ],
}
