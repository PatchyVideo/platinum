<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const { locale } = useI18n()

interface ComboItemTag {
  type: 'tag'
  id: string
  tag: string
  sub?: string
  cnt?: number
}
type ComboItem = ComboItemTag

const encodeItem = (item: ComboItem | undefined) => {
  if (item === undefined)
    return undefined
  return JSON.stringify(item)
}
const decodeItem = (item: unknown): ComboItem | undefined => {
  if (typeof item !== 'string')
    return undefined
  return JSON.parse(item)
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
const popularTags = $computed<ComboItemTag[]>(() =>
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

const query = $ref('')

const queryKeywordIndex = $computed(() => {
  const text = query
  let i: number = text.length
  while (i--) {
    switch (text.charAt(i)) {
      case ' ':
      case '\t':
      case '\n':
      case '\v':
      case '\f':
      case '\r':
      case ')':
        return i + 1
      case '(': {
        if (i > 0 && text.charAt(i - 1) === '_')
          continue
        else
          return i + 1
      }
    }
  }
  return 0
})

const queryKeyword = $computed(() => query.slice(queryKeywordIndex))
const queryPrefix = $computed(() => query.slice(0, queryKeywordIndex))

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
watchThrottled($$(queryKeyword), (value) => {
  if (value)
    refresh()
  else queryData.value = null
}, { throttle: 500, leading: false, trailing: true })

const completes = $computed<ComboItem[]>(() => {
  if (!queryData.value?.length)
    return queryKeyword ? [] : popularTags

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

const displayValue = (encodedItem: unknown) => {
  const item = decodeItem(encodedItem)
  if (item === undefined)
    return query

  if (item.type === 'tag')
    return `${queryPrefix}${item.tag} `

  return query
}
</script>

<template>
  <HCombobox as="div" class="relative">
    <div class="flex items-center rounded-full border-2 border-purple-300">
      <HComboboxInput
        class="focus:outline-none w-full ml-4 py-1"
        placeholder="搜索你想看的内容"
        nullable
        :display-value="displayValue"
        @change="query = $event.target.value"
      />
      <div class="px-2 py-1">
        <div class="i-fluent:search-20-regular w-6 h-6" />
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
      <HComboboxOptions class="absolute w-[calc(100%-1rem)] mt-2 ml-2 rounded-lg ring-2 ring-purple-300 bg-white overflow-hidden">
        <div
          v-if="completes.length === 0"
          class="px-2 py-8 w-full text-lg text-center text-gray-400"
        >
          {{ pending ? '正在努力搜索' : '没什么可做的' }}
        </div>

        <HComboboxOption
          v-for="complete in completes"
          :key="complete.id"
          v-slot="{ active }"
          as="template"
          :value="encodeItem(complete)"
        >
          <li
            class="px-2 py-1 w-full border-b border-purple-200 last:border-b-0 transition-colors duration-75 cursor-pointer"
            :class="{ 'bg-purple-200 bg-opacity-10': active }"
          >
            <div v-if="complete.type === 'tag'" class="flex items-center">
              <div class="i-fluent:tag-20-regular my-1 mr-1 text-xl text-purple-600" />
              <div
                class="min-w-0 transition-colors duration-75"
                :class="{ 'text-purple-500': active }"
              >
                {{ complete.tag.replace(/_/g, ' ') }}
              </div>
              <div v-if="complete.sub" class="min-w-0 ml-1 truncate text-gray-600 dark:text-gray-300 text-sm font-light">
                {{ complete.sub.replace(/_/g, ' ') }}
              </div>
            </div>
          </li>
        </HComboboxOption>
      </HComboboxOptions>
    </Transition>
  </HCombobox>
</template>
