<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const { locale } = useI18n()

const inputEl = shallowRef<HTMLInputElement>()

const setCursorPos = (pos: number) => {
  if (!inputEl.value)
    return

  inputEl.value.focus()
  inputEl.value.setSelectionRange(pos, pos)
}

interface ComboTag {
  type: 'tag'
  id: string
  tag: string
  sub?: string
  cnt?: number
}

const findLangMatch = (langs: Record<string, string>, lang: string) => {
  if (lang in langs)
    return langs[lang]

  if (lang === 'CHS' && 'CHT' in langs)
    return langs.CHT
  if (lang === 'CHT' && 'CHS' in langs)
    return langs.CHS

  for (const l of ['JPN', 'ENG', 'CHS', 'CHT']) {
    if (l in langs)
      return langs[l]
  }

  return Object.values(langs)[0]
}

const { data: popularTagsData } = await useAsyncQuery<Query>(
  gql`
    query ($lang: String!) {
      getPopularTags(para: { lang: $lang, count: 10 }) {
        popularTags {
          popluarity
          tag {
            id
            count
            languages {
              lang
              value
            }
          }
        }
      }
    }
  `,
  {
    lang: locale.value,
  },
)
const popularTags = computed<ComboTag[]>(() =>
  popularTagsData.value?.getPopularTags.popularTags
    ?.sort((a, b) => b.popluarity - a.popluarity)
    .map((item) => {
      const langs = Object.fromEntries(item.tag.languages.map(lang => [lang.lang, lang.value]))
      let sub: string | undefined
      for (const l of ['JPN', 'ENG', 'CHS', 'CHT']) {
        if (l in langs) {
          sub = langs[l]
          break
        }
      }
      return {
        type: 'tag',
        id: `tag:${item.tag.id}`,
        tag: findLangMatch(langs, locale.value),
        sub,
        cnt: item.tag.count,
      }
    }) || [])

const query = ref('')
const cursor = ref(0)

const queryKeywordStart = computed(() => {
  const text = query
  let i: number = cursor.value
  while (i--) {
    switch (text.value.charAt(i)) {
      case ' ':
      case '\t':
      case '\n':
      case '\v':
      case '\f':
      case '\r':
      case ')':
        return i + 1
      case '(': {
        if (i > 0 && text.value.charAt(i - 1) === '_')
          continue
        else
          return i + 1
      }
    }
  }
  return 0
})
const queryKeywordEnd = computed(() => {
  const keywordEnd = query.value.slice(queryKeywordStart.value).search(/[\s\(\)]/)
  return keywordEnd === -1 ? query.value.length : queryKeywordStart.value + keywordEnd
})

const queryKeyword = computed(() => query.value.slice(queryKeywordStart.value, queryKeywordEnd.value))
const queryPrefix = computed(() => query.value.slice(0, queryKeywordStart.value))
const querySuffix = computed(() => query.value.slice(queryKeywordEnd.value))

interface QueryResult {
  cat: number
  cnt: number
  id: number
  langs: QueryResultLangs[]
  keyword: string
  alias: string[]
}
interface QueryResultLangs {
  l: number
  w: string
}
const queryLangMap = ['NAL', 'CHS', 'CHT', 'CSY', 'NLD', 'ENG', 'FRA', 'DEU', 'HUN', 'ITA', 'JPN', 'KOR', 'PLK', 'PTB', 'ROM', 'RUS', 'ESP', 'TRK', 'VIN']

const { data: queryData, refresh, pending } = useLazyFetch<QueryResult[]>(
  () => `https://patchyvideo.com/be/autocomplete/ql?q=${queryKeyword}`,
  { immediate: false })
watchThrottled(queryKeyword, (value) => {
  if (value)
    refresh()
}, { throttle: 500, leading: false, trailing: true })

const completes = computed<ComboTag[]>(() => {
  if (queryKeyword.value === '')
    return popularTags.value
  if (!queryData.value?.length)
    return []

  return queryData.value
    .map((item) => {
      const langs = Object.fromEntries(item.langs.map(lang => [queryLangMap[lang.l], lang.w]))
      let sub: string | undefined
      for (const l of ['JPN', 'ENG', 'CHS', 'CHT']) {
        if (l in langs) {
          sub = langs[l]
          break
        }
      }
      return {
        type: 'tag',
        id: `tag:${item.keyword}`,
        tag: item.keyword,
        sub,
        cnt: item.cnt,
      }
    })
})

const inFocus = ref(false)
const active = ref(-1)
const activeCombo = computed(() => completes.value[active.value])

const search = () => {}

const onKeyDown = (e: KeyboardEvent) => {
  inFocus.value = true

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      e.stopPropagation()
      if (active.value < completes.value.length - 1)
        active.value++
      else active.value = 0
      break

    case 'PageDown':
      e.preventDefault()
      e.stopPropagation()
      active.value = completes.value.length - 1
      break

    case 'ArrowUp':
      e.preventDefault()
      e.stopPropagation()
      if (active.value >= 0)
        active.value--
      else active.value = completes.value.length - 1
      break

    case 'PageUp':
      e.preventDefault()
      e.stopPropagation()
      active.value = 0
      break

    case 'Escape':
      e.preventDefault()
      e.stopPropagation()
      active.value = -1
      inFocus.value = false
      break

    case 'Tab':
      e.preventDefault()
      e.stopPropagation()
      if (activeCombo) {
        query.value = `${queryPrefix}${activeCombo.value.tag}${querySuffix || ' '}`
        const pos = queryPrefix.value.length + activeCombo.value.tag.length + 1
        nextTick(() => setCursorPos(pos))
        active.value = -1
      }
      break

    case 'Enter':
      e.preventDefault()
      e.stopPropagation()
      if (activeCombo) {
        query.value = `${queryPrefix}${activeCombo.value.tag}${querySuffix || ' '}`
        active.value = -1
      }
      inFocus.value = false
      search()
      break
  }
}

const onComboClick = (combo: ComboTag) => {
  query.value = `${queryPrefix}${combo.tag}${querySuffix || ' '}`
  const pos = queryPrefix.value.length + combo.tag.length + 1
  nextTick(() => setCursorPos(pos))
  active.value = -1
}
</script>

<template>
  <div class="relative">
    <div class="flex items-center rounded-md border-2 border-purple-200">
      <input
        ref="inputEl"
        v-model="query"
        class="focus:outline-none w-full ml-4 py-1"
        placeholder="搜索你想看的内容"
        @focus="() => inFocus = true"
        @blur="() => inFocus = false"
        @keydown="onKeyDown"
        @keyup="(e) => cursor = (e.target as HTMLInputElement).selectionStart || 0"
      >
      <div class="px-2 py-1 cursor-pointer" @click="search">
        <div class="i-uil:search w-6 h-6" />
      </div>
    </div>

    <Transition
      enter-active-class="transform transition duration-100 ease-out"
      enter-from-class="scale-95 -translate-y-1/20 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transform transition duration-75 ease-out"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 -translate-y-1/20 opacity-0"
    >
      <div
        v-show="inFocus"
        static
        class="absolute w-[calc(100%-1rem)] mt-2 ml-2 rounded-lg ring-2 ring-purple-300 bg-white overflow-hidden"
      >
        <div
          v-if="completes.length === 0"
          class="px-2 py-8 w-full text-lg text-center text-gray-400"
        >
          {{ pending ? '正在努力搜索' : '没什么可做的' }}
        </div>

        <li
          v-for="(combo, index) in completes"
          :key="combo.id"
          class="px-2 py-1 w-full border-b border-purple-200 last:border-b-0 transition-colors duration-75 cursor-pointer"
          :class="{ 'bg-purple-200 bg-opacity-10': active === index }"
          @click="onComboClick(combo)"
        >
          <div v-if="combo.type === 'tag'" class="flex items-center">
            <div class="i-uil:tag-alt my-1 mr-1 text-xl text-purple-600" />
            <div
              class="min-w-0 truncate transition-colors duration-75"
              :class="{ 'text-purple-500': active === index }"
              :title="combo.tag"
            >
              {{ combo.tag.replace(/_/g, ' ') }}
            </div>
            <div
              v-if="combo.sub"
              class="min-w-0 ml-1 truncate text-gray-600 dark:text-gray-300 text-sm font-light"
              :title="combo.sub"
            >
              {{ combo.sub.replace(/_/g, ' ') }}
            </div>
          </div>
        </li>
      </div>
    </Transition>
  </div>
</template>
