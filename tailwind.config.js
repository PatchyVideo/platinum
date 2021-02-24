const defaultTheme = require('windicss/defaultTheme')

/**
 * TailwindCSS Configuration File
 *
 * Docs: https://tailwindcss.com/docs/configuration
 * Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
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
      typography: {
        DEFAULT: { css: [{ maxWidth: 'inherit' }] },
        light: {
          css: [
            {
              color: defaultTheme.colors.gray[200],
              '[class~="lead"]': {
                color: defaultTheme.colors.gray[100],
              },
              a: {
                color: defaultTheme.colors.white,
              },
              strong: {
                color: defaultTheme.colors.white,
              },
              'ol > li::before': {
                color: defaultTheme.colors.gray[200],
              },
              'ul > li::before': {
                backgroundColor: defaultTheme.colors.gray[600],
              },
              hr: {
                borderColor: defaultTheme.colors.gray[200],
              },
              blockquote: {
                color: defaultTheme.colors.gray[50],
                borderLeftColor: defaultTheme.colors.gray[600],
              },
              h1: {
                color: defaultTheme.colors.white,
              },
              h2: {
                color: defaultTheme.colors.white,
              },
              h3: {
                color: defaultTheme.colors.white,
              },
              h4: {
                color: defaultTheme.colors.white,
              },
              'figure figcaption': {
                color: defaultTheme.colors.gray[200],
              },
              code: {
                color: defaultTheme.colors.white,
              },
              'a code': {
                color: defaultTheme.colors.white,
              },
              pre: {
                color: defaultTheme.colors.gray[100],
                backgroundColor: defaultTheme.colors.gray[800],
              },
              thead: {
                color: defaultTheme.colors.white,
                borderBottomColor: defaultTheme.colors.gray[400],
              },
              'tbody tr': {
                borderBottomColor: defaultTheme.colors.gray[600],
              },
            },
          ],
        },
      },
    },
  },
  plugins: [
    // https://github.com/tailwindlabs/tailwindcss-typography#usage
    require('windicss/plugin/typography'),
  ],
}
