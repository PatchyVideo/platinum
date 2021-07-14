module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  watchPathIgnorePatterns: ['node_modules'],
}
