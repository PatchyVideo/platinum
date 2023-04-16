import { disableFragmentWarnings } from '@apollo/client/core'
import RawObjectID from 'bson-objectid'

import type * as schema from './dist/types'

export type { schema }
export { TagCategoryEnum } from './dist/types'
export type Query = schema.Query
export type Mutation = schema.Mutation
export type Subscription = schema.Subscription

disableFragmentWarnings()

export class ObjectID extends RawObjectID {
  toJSON() {
    return this.toHexString()
  }
}
