const themes = ['system', 'light', 'dark'] as const
export type Themes = typeof themes[number]

export const themePreference = useLocalStorage<Themes>('theme_preference', 'system', {
  listenToStorageChanges: true,
  serializer: {
    read(raw): Themes {
      return themes.includes(raw as any) ? (raw as Themes) : 'system'
    },
    write(value): string {
      return value
    },
  },
})

export const isDark = computed(() =>
  themePreference.value === 'system' ? usePreferredDark().value : themePreference.value === 'dark',
)

export function applyTheme() {
  // Attention: only client has 'document' object
  if (process.client) {
    const html = document.documentElement
    const metaTag = document.querySelector('meta[name="theme-color"]')
    watchEffect(() => {
      if (isDark.value) {
        html.classList.add('dark')
        if (metaTag)
          metaTag.setAttribute('content', '#1f2937')
      }
      else {
        html.classList.remove('dark')
        if (metaTag)
          metaTag.setAttribute('content', '#ffffff')
      }
    })
  }
}
