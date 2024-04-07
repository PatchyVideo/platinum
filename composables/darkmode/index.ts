const themes = ['system', 'light', 'dark'] as const
export type Themes = typeof themes[number]

export const themePreference = ref<Themes>('system')
export const isDark = ref(false)

export function applyTheme() {
  // Attention: only client has 'document' object
  if (process.client) {
    const storedPreference = useLocalStorage<Themes>('theme_preference', 'system', {
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
    themePreference.value = storedPreference.value

    watchEffect(() => {
      isDark.value = themePreference.value === 'system' ? usePreferredDark().value : themePreference.value === 'dark'
    })
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
