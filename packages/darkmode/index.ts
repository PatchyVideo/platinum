import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

const html = document.documentElement

export const themes = ['system', 'light', 'dark'] as const
export type Themes = typeof themes[number]
export const themePreference = useLocalStorage<Themes>('themePreference', 'system', {
  listenToStorageChanges: true,
  flush: 'post',
  serializer: {
    read(raw): Themes {
      return (themes as readonly string[]).includes(raw) ? (raw as Themes) : 'system'
    },
    write(value): string {
      return value
    },
  },
})
export const isDark = computed(() =>
  themePreference.value === 'system' ? usePreferredDark().value : themePreference.value === 'dark'
)

function updateDOM(v: boolean) {
  if (v) {
    if (!html.classList.contains('dark')) html.classList.add('dark')
  } else {
    if (html.classList.contains('dark')) html.classList.remove('dark')
  }
}

watchEffect(
  () => {
    updateDOM(isDark.value)
  },
  {
    flush: 'post',
  }
)
