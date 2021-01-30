const graphqlCompose = require('graphql-compose')
const fs = require('fs')
const path = require('path')
const { printSchema, buildSchema } = require('graphql')

const schemaComposer = graphqlCompose.schemaComposer.clone()

function newScalar(name) {
  schemaComposer.createScalarTC({ name })
}

function modifyFieldType(objectName, fieldName, fieldType) {
  console.log(`${objectName}: ${fieldName} -> ${fieldType}`)

  const object = schemaComposer.types.get(objectName)

  object.setField(fieldName, {
    ...object.getField(fieldName),
    type: fieldType,
  })

  schemaComposer.types.set(objectName, object)
}

schemaComposer.merge(
  buildSchema(fs.readFileSync(path.resolve(__dirname, '../__generated__/originalSchema.graphql')).toString())
)

newScalar('FETagCategories')
modifyFieldType('TagObject', 'category', 'FETagCategories!')
modifyFieldType('RegularTagObject', 'category', 'FETagCategories!')
modifyFieldType('AuthorTagObject', 'category', 'FETagCategories!')

newScalar('FEUserImage')
modifyFieldType('User', 'image', 'FEUserImage!')
modifyFieldType('Author', 'avatar', 'FEUserImage!')

newScalar('FECoverImage')
modifyFieldType('VideoItem', 'coverImage', 'FECoverImage!')
modifyFieldType('PlaylistMeta', 'cover', 'FECoverImage!')

fs.writeFileSync(
  path.resolve(__dirname, '../__generated__/builtSchema.graphql'),
  printSchema(
    schemaComposer.buildSchema({
      keepUnusedTypes: true,
    })
  )
)
