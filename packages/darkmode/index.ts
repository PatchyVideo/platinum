import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { ref, watch } from 'vue'

const body = document.body

const themePreference = useLocalStorage('themePreference', '', { listenToStorageChanges: true, flush: 'post' })
const themes = ['light', 'dark']

function updateDOM(v: boolean) {
  if (v) {
    if (!body.classList.contains('dark')) body.classList.add('dark')
  } else {
    if (body.classList.contains('dark')) body.classList.remove('dark')
  }
}

export const isDark = ref(false)

watch(
  [themePreference],
  () => {
    if (themes.includes(themePreference.value)) {
      isDark.value = themePreference.value === 'dark'
    } else {
      isDark.value = usePreferredDark().value
    }
  },
  {
    flush: 'post',
    immediate: true,
  }
)

watch(
  [isDark],
  () => {
    if (themes.includes(themePreference.value) && isDark.value === usePreferredDark().value) {
      themePreference.value = ''
    } else if (isDark.value !== usePreferredDark().value) {
      themePreference.value = isDark.value ? 'dark' : 'light'
    }
    updateDOM(isDark.value)
  },
  {
    flush: 'post',
  }
)

updateDOM(isDark.value)
