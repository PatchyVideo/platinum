const typography = require('@tailwindcss/typography')
const lineClamp = require('@tailwindcss/line-clamp')
const aspectRatio = require('@tailwindcss/aspect-ratio')

/**
 * TailwindCSS Configuration File
 *
 * Docs: https://tailwindcss.com/docs/configuration
 */
module.exports = {
  mode: 'jit',
  purge: ['./packages/**/*.{html,vue,ts,tsx,js,jsx,css}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: (() => {
        const screens = Object.entries({
          sm: '576px',
          md: '720px',
          lg: '992px',
          xl: '1200px',
          '2xl': '1400px',
          '3xl': '1540px',
          '4xl': '1860px',
          '5xl': '2480px',
        })
        return {
          ...Object.fromEntries(screens),
          ...Object.fromEntries(screens.map(([k, v]) => ['<' + k, { max: v }])),
          ...Object.fromEntries(screens.map(([k, v], i) => ['@' + k, { min: v, max: (screens[i + 1] ?? [])[1] }])),
        }
      })(),
      colors: {
        copyright: '#a0a',
        language: '#585455',
        character: '#0a0',
        author: '#a00',
        general: '#0073ff',
        meta: '#f80',
        soundtrack: '#ff7792',
      },
      typography: (theme) => ({
        dark: {
          css: [
            {
              color: theme('colors.gray.400'),
              '[class~="lead"]': {
                color: theme('colors.gray.300'),
              },
              a: {
                color: theme('colors.white'),
              },
              strong: {
                color: theme('colors.white'),
              },
              'ol > li::before': {
                color: theme('colors.gray.400'),
              },
              'ul > li::before': {
                backgroundColor: theme('colors.gray.600'),
              },
              hr: {
                borderColor: theme('colors.gray.200'),
              },
              blockquote: {
                color: theme('colors.gray.200'),
                borderLeftColor: theme('colors.gray.600'),
              },
              h1: {
                color: theme('colors.white'),
              },
              h2: {
                color: theme('colors.white'),
              },
              h3: {
                color: theme('colors.white'),
              },
              h4: {
                color: theme('colors.white'),
              },
              'figure figcaption': {
                color: theme('colors.gray.400'),
              },
              code: {
                color: theme('colors.white'),
              },
              'a code': {
                color: theme('colors.white'),
              },
              pre: {
                color: theme('colors.gray.200'),
                backgroundColor: theme('colors.gray.800'),
              },
              thead: {
                color: theme('colors.white'),
                borderBottomColor: theme('colors.gray.400'),
              },
              'tbody tr': {
                borderBottomColor: theme('colors.gray.600'),
              },
            },
          ],
        },
      }),
    },
  },
  plugins: [
    // https://github.com/tailwindlabs/tailwindcss-typography#usage
    typography,
    lineClamp,
    aspectRatio,
  ],
}
