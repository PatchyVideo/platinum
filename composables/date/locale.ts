import type { Locale } from 'date-fns'
import enUS from 'date-fns/esm/locale/en-US'

export const locales: Record<string, () => Promise<Locale>> = {
  ENG: () => Promise.resolve(enUS),
  CHS: () => import('date-fns/esm/locale/zh-CN').then(m => m.default),
  CHT: () => import('date-fns/esm/locale/zh-HK').then(m => m.default),
}

export async function useLocale() {
  const { locale } = useI18n()
  const dateLocale = ref<Locale>(enUS)
  const update = async () => {
    dateLocale.value = await locales[locale.value]?.() || enUS
  }
  watch(locale, update)
  await update()
  return dateLocale
}
