import { computed, ref } from 'vue'
export const markAsReadStatus = computed<'ready' | 'loading'>(() => {
  if (markAsReadMutationCount.value) return 'loading'
  else return 'ready'
})
export const markAsReadMutationCount = ref<number>(0)
