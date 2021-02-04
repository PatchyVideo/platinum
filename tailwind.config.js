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
      minWidth: {
        300: '300px',
      },
      screens: {
        '3xl': '1920px',
        '2xl': '1200px',
        xs: '480px',
      },
      spacing: {
        72: '18rem',
        84: '21rem',
        96: '24rem',
      },
      colors: {
        baseWhite: '#F9FAFB',
        baseDark: '#374151',
        textWhite: '#FFFFFF',
        textAlert: '#EF4444',
      },
      zIndex: {
        '-1': '-1',
      },
      rotate: {
        24: '24deg',
        '-24': '-24deg',
      },
      inset: {
        '-2/12': '-16.666667%;',
      },
    },
  },
  variants: {
    borderWidth: ['responsive', 'hover', 'focus', 'dark'],
  },
  plugins: [
    // https://github.com/tailwindlabs/tailwindcss-typography#usage
    require('@tailwindcss/typography'),
  ],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './index.html',
      './packages/**/*.css',
      './packages/**/*.js',
      './packages/**/*.ts',
      './packages/**/*.jsx',
      './packages/**/*.tsx',
      './packages/**/*.vue',
    ],
  },
}
