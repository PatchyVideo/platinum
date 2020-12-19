/**
 * TailwindCSS Configuration File
 *
 * Docs: https://tailwindcss.com/docs/configuration
 * Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      spacing: {
        72: '18rem',
        84: '21rem',
        96: '24rem',
      },
      zIndex: {
        '-1': '-1',
      },
    },
  },
  variants: {
    borderWidth: ['responsive', 'hover', 'focus', 'dark'],
  },
  plugins: [],
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
