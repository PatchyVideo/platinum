import { usePreferredDark } from '@vueuse/core'
import { computed } from 'vue'

const htmlRoot = document.querySelector('html')

document.querySelector('body')?.classList.add('dark:bg-gray-700')

function updateDOM(v: boolean) {
  if (v) {
    htmlRoot?.classList.contains('dark') || htmlRoot?.classList.add('dark')
  } else {
    htmlRoot?.classList.contains('dark') && htmlRoot?.classList.remove('dark')
  }
}

export const isDark = computed<boolean>({
  get() {
    if ('themePreference' in localStorage) {
      return localStorage.themePreference === 'dark'
    }
    return usePreferredDark().value
  },
  set(v) {
    if ('themePreference' in localStorage && v === usePreferredDark().value) {
      localStorage.removeItem('themePreference')
    } else if (v !== usePreferredDark().value) {
      localStorage.setItem('themePreference', v ? 'dark' : 'light')
    }
    updateDOM(v)
  },
})

updateDOM(isDark.value)
