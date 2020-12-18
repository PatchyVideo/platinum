module.exports = {
  client: {
    service: {
      name: 'pvgql',
      // URL to the GraphQL API
      url: 'http://localhost:8080/graphql',
    },
    // Files processed by the extension
    includes: ['packages/**/*.vue', 'packages/**/*.ts', 'packages/**/*.js'],
  },
}
