import { useLocalStorage } from '@vueuse/core'

export function useThemeDarkCoverFilter() {
  return useLocalStorage('theme_dark_cover_filter', true, {
    writeDefaults: false,
    listenToStorageChanges: true,
  })
}
