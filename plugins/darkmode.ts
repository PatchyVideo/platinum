// plugins/theme.ts
import { applyTheme } from '~/composables/darkmode'

export default defineNuxtPlugin(() => {
  applyTheme()
})
