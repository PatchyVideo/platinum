import { computedAsync } from '@vueuse/core'
import type { Ref } from 'vue'
import { inject, provide, ref, triggerRef } from 'vue'

const backendStatusKey = Symbol('backendStatus')

interface ProvidedBackendStatus {
  alive: Ref<'yes' | 'no' | 'loading'>
  refetch: () => void
}

export const createBackendStatus = () => {
  const refetchController = ref()
  const refetch = () => {
    triggerRef(refetchController)
  }

  const alive = computedAsync(
    async () => {
      // eslint-disable-next-line no-unused-expressions
      refetchController.value
      try {
        const res = await fetch('https://patchyvideo.com/be/alive.txt')
        return res.ok ? 'yes' : 'no'
      }
      catch (e) {
        return 'no'
      }
    },
    'loading',
  )

  const data = {
    alive,
    refetch,
  }

  return data
}

export const provideBackendStatus = (data: ProvidedBackendStatus) =>
  provide<ProvidedBackendStatus>(backendStatusKey, data)

export const useBackendStatus = () => {
  const backendStatus = inject<ProvidedBackendStatus>(backendStatusKey)
  if (!backendStatus)
    throw new Error('useBackendStatus: There is no backendStatus provided in the current vue instance.')
  return backendStatus
}

export const useBackendAlive = () => useBackendStatus().alive
