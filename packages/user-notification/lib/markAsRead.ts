import { useMutation, gql } from '@/graphql'
import type { Mutation } from '@/graphql'
import { ref, watchEffect } from 'vue'

const { mutate, loading } = useMutation<Mutation>(
  gql`
    mutation ($markAll: Boolean, $noteType: String, $noteIds: [String!]) {
      markAsRead(para: { markAll: $markAll, noteType: $noteType, noteIds: $noteIds }) {
        empty
      }
    }
  `
)
export function markAsRead(markAll = false, noteType: string, noteId: string[]): void {
  mutate({ markAll: markAll, noteType: noteType, noteIds: noteId })
  if (markAll) location.reload
}

export const markAsReadStatus = ref<'ready' | 'loading' | 'result'>('ready')
watchEffect(() => {
  if (loading.value) {
    markAsReadStatus.value = 'loading'
  } else {
    markAsReadStatus.value = 'result'
  }
})
