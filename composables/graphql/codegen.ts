import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://patchyvideo.com/be/gql/graphql',
  generates: {
    'composables/graphql/dist/types.ts': {
      plugins: [
        'typescript',
      ],
      config: {
        useImplementingTypes: true,
        addUnderscoreToArgsType: true,
        nonOptionalTypename: true,
        scalars: {
          DateTimeUtc: 'string',
          UtcDateTime: 'string',
          ObjectId: 'string',
        },
      },
    },
    'composables/graphql/dist/fragments.ts': {
      plugins: [
        'fragment-matcher',
      ],
    },
    'composables/graphql/dist/schema.graphql': {
      plugins: [
        'schema-ast',
      ],
    },
  },
}

export default config
