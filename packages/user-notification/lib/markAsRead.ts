import { computed, ref } from 'vue'

export const markAsReadMutationCount = ref<number>(0)
export const markAsReadStatus = computed<'ready' | 'loading'>(() => {
  if (markAsReadMutationCount.value)
    return 'loading'
  else return 'ready'
})
