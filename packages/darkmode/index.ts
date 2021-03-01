import { usePreferredDark } from '@vueuse/core'
import { ref, watchEffect,watch } from 'vue'

const htmlRoot = document.querySelector('html')
const themeMeta = document.querySelector('meta[name="color-scheme"]')

document.querySelector('body')?.classList.add('dark:bg-gray-700')
function updateDOM(v: boolean) {
  if (v) {
    htmlRoot?.classList.contains('dark') || htmlRoot?.classList.add('dark')
    themeMeta?.setAttribute("content", "dark")
  } else {
    htmlRoot?.classList.contains('dark') && htmlRoot?.classList.remove('dark')
    themeMeta?.setAttribute("content", "light")
  }
}

export const isDark = ref(false)

if ('themePreference' in localStorage) {
  isDark.value = localStorage.getItem('themePreference') === 'dark'
} else {
  isDark.value = usePreferredDark().value
}

function setIsDark(v: boolean) {
  if ('themePreference' in localStorage && v === usePreferredDark().value) {
    localStorage.removeItem('themePreference')
  } else if (v !== usePreferredDark().value) {
    localStorage.setItem('themePreference', v ? 'dark' : 'light')
  }
  updateDOM(v)
  isDark.value = v
}

watchEffect(
  () => {
    setIsDark(isDark.value)
  },
  {
    flush: 'post',
  }
)
