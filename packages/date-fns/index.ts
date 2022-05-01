import type { Locale } from 'date-fns'
import { pickBestLocale } from '@/locales'
async function getLocale(locale: string) {
  try {
    return await import(`../../node_modules/date-fns/esm/locale/${locale}/index.js`)
  }
  catch (e) {
    return await import('../../node_modules/date-fns/esm/locale/en-US/index.js')
  }
}

export const dateFnsLocale = async (): Promise<Locale> => {
  const lang = pickBestLocale(import.meta.env.VITE_DATE_FNS_LOCALE, 'en-US')
  const langFile = await getLocale(lang)
  return 'default' in langFile ? langFile.default : (await getLocale('en-US')).default
}
