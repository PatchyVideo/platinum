module.exports = {
  client: {
    service: {
      name: 'PatchyVideo GraphQL API (local)',
      localSchemaFile: './composables/graphql/dist/schema.graphql',
    },
    includes: ['./**/*.{graphql,js,ts,jsx,tsx,vue}'],
    excludes: ['./composables/graphql/dist/*'],
    validationRules: [], // disable validation for now, most of the validations are incompatible with the current graphql plugin.
    tagName: 'gql',
  },
}
