import { useLocalStorage } from '@vueuse/core'

export const useThemeDarkCoverFilter = () =>
  useLocalStorage('theme_dark_cover_filter', true, {
    writeDefaults: false,
    listenToStorageChanges: true,
  })
