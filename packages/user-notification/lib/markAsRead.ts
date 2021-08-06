import { ref } from 'vue'
export const markAsReadStatus = ref<'ready' | 'loading' | 'result'>('ready')
