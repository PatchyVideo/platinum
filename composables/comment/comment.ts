import type { schema } from '@/composables/graphql'

export type CommentItemType = Omit<schema.Comment, 'content' | 'meta' | 'deleted' | 'children'> & {
  content: NonNullable<schema.Comment['content']>
  meta: schema.Meta & { createdBy: NonNullable<schema.Meta['createdBy']> }
  deleted: false
  children?: CommentItemType[]
}
