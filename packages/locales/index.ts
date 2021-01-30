import { computed } from 'vue'
import { createI18n } from 'vue-i18n'

import i18n_zh_CN from './zh-CN.json'
import i18n_en_US from './en-US.json'

const messages = {
  'zh-CN': i18n_zh_CN,
  'en-US': i18n_en_US,
}

const langs = Object.keys(messages)

const i18n = createI18n({
  locale: getBrowserLang() || 'zh-CN',
  availableLocales: langs,
  fallbackLocale: 'zh-CN',
  messages,
})

export default i18n

function getBrowserLang(): string | undefined {
  if ('lang' in localStorage) {
    const lang = localStorage.getItem('lang')
    if (lang)
      if (langs.includes(lang)) {
        return lang // return lang in localStorage
      } else {
        localStorage.removeItem('lang') // reset invalid lang
      }
  }
  if (langs.includes(navigator.language)) return navigator.language // return browser lang
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      if (langs.includes(lang)) return lang // return lang in browser langs
    }
    // for (const ilang of langs) {
    //   for (const lang in navigator.languages) {
    //     if (ilang.indexOf(lang + '-') > -1) return lang // return lang that is similar
    //   }
    // }
  }
}

function setBrowserLang(lang: string) {
  if (lang === navigator.language) localStorage.removeItem('lang')
  if (langs.includes(lang)) localStorage.setItem('lang', lang)
}

export const locale = computed({
  get: () => {
    return i18n.global.locale
  },
  set: (x: string) => {
    setBrowserLang(x)
    i18n.global.locale = x
    if (confirm(i18n.global.t('locales.change-lang-reload-hint'))) location.reload()
  },
})

function BCP47ToISO639(code: string): string {
  const map: Record<string, string> = {
    zh: 'CHS',
    'zh-CN': 'CHS',
    'zh-TW': 'CHT',
    'zh-HK': 'CHT',
    en: 'ENG',
    'en-US': 'ENG',
    'en-GB': 'ENG',
    ja: 'JPN',
  }
  return code in map ? map[code] : 'CHS'
}

export const iso639locale = computed(() => BCP47ToISO639(locale.value))

export function behMostMatch(valueWithLang: { lang: string; value: string }[]): string {
  const lang = iso639locale.value
  for (const value of valueWithLang) {
    if (value.lang === lang) return value.value
  }
  return valueWithLang[0].value || 'undifined'
}
