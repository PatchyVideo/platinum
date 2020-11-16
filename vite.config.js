const path = require('path')

/**
 * Vite Configuration File
 */
module.exports = {
  alias: {
    '/@/': path.resolve(__dirname, './packages/'),
    '/@@/': path.resolve(__dirname, './'),
  },
  sourcemap: true,
  optimizeDeps: {
    include: ['@apollo/client/core', 'vue'],
    exclude: ['@apollo/client'],
  },
}
