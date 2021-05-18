import { computed } from 'vue'
import { createI18n } from 'vue-i18n'

const messages = Object.fromEntries(
  Object.entries(import.meta.globEager('./*.json')).map(([key, value]) => [
    key.replace(/.+\/(.+)\.json/, '$1'),
    value.default,
  ])
)

const langs = Object.keys(messages)

const i18n = createI18n({
  legacy: false,
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
  }
  return navigator.language
}

function setBrowserLang(lang: string) {
  if (lang === navigator.language) localStorage.removeItem('lang')
  if (langs.includes(lang)) localStorage.setItem('lang', lang)
}

export const locale = computed({
  get: () => {
    return i18n.global.locale.value
  },
  set: (x: string) => {
    setBrowserLang(x)
    i18n.global.locale.value = x
    if (confirm(i18n.global.t('locales.change-lang-reload-hint'))) location.reload()
  },
})

function BCP47ToISO639(code: string): string {
  const map: Record<string, string> = {
    zh: 'CHS',
    'zh-CN': 'CHS',
    'zh-Hant-HK-yue': 'CHS',
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
export const iso639nav = computed(() => BCP47ToISO639(navigator.language))

export const languagesList = [
  { id: 1, value: 'CHS', label: '简体中文' },
  { id: 2, value: 'CHT', label: '繁體中文' },
  { id: 3, value: 'CSY', label: 'čeština' },
  { id: 4, value: 'NLD', label: 'Nederlands' },
  { id: 5, value: 'ENG', label: 'English' },
  { id: 6, value: 'FRA', label: 'français' },
  { id: 7, value: 'DEU', label: 'Deutsch' },
  { id: 8, value: 'HUN', label: 'magyar nyelv' },
  { id: 9, value: 'ITA', label: 'italiano' },
  { id: 10, value: 'JPN', label: '日本語' },
  { id: 11, value: 'KOR', label: '한국어' },
  { id: 12, value: 'PLK', label: 'polski' },
  { id: 13, value: 'PTB', label: 'português' },
  { id: 14, value: 'ROM', label: 'limba română' },
  { id: 15, value: 'RUS', label: 'русский язык' },
  { id: 16, value: 'ESP', label: 'español' },
  { id: 17, value: 'TRK', label: 'Türk dili' },
  { id: 18, value: 'VIN', label: 'Tiếng Việt' },
]
function IDToISO639(id: number): string {
  return languagesList.find((item) => item.id === id)?.value || 'NAL'
}

interface LangItemWithName {
  lang: string
  value: string
}
interface LangItemWithID {
  l: number
  w: string
}
export function behMostMatch(valueWithLang: LangItemWithName[]): string {
  const lang = iso639locale.value
  for (const value of valueWithLang) {
    if (value.lang === lang) return value.value
  }
  return valueWithLang[0].value || 'undifined'
}
export function langBestMatchName(valueWithLang: LangItemWithName[]): string {
  const siteLang = iso639locale.value
  const browserlang = iso639nav.value
  for (const value of valueWithLang) {
    if (value.lang === siteLang) return value.value
    else if (value.lang === browserlang) return value.value
  }
  return valueWithLang[0].value || 'undifined'
}
export function langBestMatchID(valueWithLang: LangItemWithID[]): string {
  const siteLang = iso639locale.value
  const browserlang = iso639nav.value
  for (const value of valueWithLang) {
    if (IDToISO639(value.l) === siteLang) return value.w
    else if (IDToISO639(value.l) === browserlang) return value.w
  }
  return valueWithLang[0].w || 'undifined'
}
