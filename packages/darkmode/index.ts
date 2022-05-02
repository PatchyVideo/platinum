import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

const html = document.documentElement
const metaTag = document.querySelector('meta[name="theme-color"]')!

export const themes = ['system', 'light', 'dark'] as const
export type Themes = typeof themes[number]
export const themePreference = useLocalStorage<Themes>('theme_preference', 'system', {
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
  themePreference.value === 'system' ? usePreferredDark().value : themePreference.value === 'dark',
)

watchEffect(
  () => {
    if (isDark.value) {
      if (!html.classList.contains('dark'))
        html.classList.add('dark')
      metaTag.setAttribute('content', '#1f2937')
    }
    else {
      if (html.classList.contains('dark'))
        html.classList.remove('dark')
      metaTag.setAttribute('content', '#ffffff')
    }
  },
  {
    flush: 'post',
  },
)
