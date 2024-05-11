<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = withDefaults(defineProps<{
  query?: string
  placeholder?: string
  searchFunction?: Function
  showPoplarTags?: boolean
}>(), {
  query: '',
  placeholder: '搜索你想看的内容',
  showPoplarTags: true,
})
const emit = defineEmits<{
  (event: 'update:query', value: boolean): void
}>()
const query = useVModel(props, 'query', emit)
if (query.value)
  query.value += ' '
const cursor = ref(query.value.length)

const router = useRouter()

const { locale } = useI18n()

const comboEl = shallowRef<HTMLDivElement>()
const inputEl = shallowRef<HTMLInputElement>()

function setCursorPos(pos: number) {
  if (!inputEl.value)
    return

  inputEl.value.focus()
  inputEl.value.setSelectionRange(pos, pos)
}

interface ComboTag {
  type: 'tag' | 'keyword'
  id: string
  tag: string
  sub?: string
  cnt?: number
}

function findLangMatch(langs: Record<string, string>, lang: string) {
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
const getPopularTags = computed(() => popularTagsData.value!.getPopularTags)
const popularTags = computed<ComboTag[]>(() =>
  [...getPopularTags.value.popularTags || []]
    .sort((a, b) => b.popluarity - a.popluarity)
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
interface QueryKeyword {
  cat: number
  cnt: number
  keyword: string
}
const queryLangMap = ['NAL', 'CHS', 'CHT', 'CSY', 'NLD', 'ENG', 'FRA', 'DEU', 'HUN', 'ITA', 'JPN', 'KOR', 'PLK', 'PTB', 'ROM', 'RUS', 'ESP', 'TRK', 'VIN']
const SearchKeywords: QueryKeyword[] = [
  { keyword: 'site:acfun', cat: 6, cnt: 0 },
  { keyword: 'site:bilibili', cat: 6, cnt: 0 },
  { keyword: 'site:nicovideo', cat: 6, cnt: 0 },
  { keyword: 'site:twitter', cat: 6, cnt: 0 },
  { keyword: 'site:youtube', cat: 6, cnt: 0 },
  { keyword: 'site:zcool', cat: 6, cnt: 0 },
  { keyword: 'site:ipfs', cat: 6, cnt: 0 },
  { keyword: 'AND', cat: 6, cnt: 0 },
  { keyword: 'OR', cat: 6, cnt: 0 },
  { keyword: 'NOT', cat: 6, cnt: 0 },
  { keyword: 'date:', cat: 6, cnt: 0 },
  { keyword: 'tags:', cat: 6, cnt: 0 },
]
function siteOrKeywordFilter(query: string) {
  return (siteOrKeyword: QueryKeyword): boolean => !(query === '') && (siteOrKeyword.keyword?.toLowerCase().indexOf(query.toLowerCase()) === 0)
}

const { data: queryData, refresh, pending } = useLazyFetch<QueryResult[]>(
  () => `https://patchyvideo.com/be/autocomplete/ql?q=${queryKeyword.value}`,
  { immediate: Boolean(props.query), watch: false },
)
watchThrottled(queryKeyword, (value) => {
  if (value)
    refresh()
}, { throttle: 500, leading: false, trailing: true })

const completes = computed<ComboTag[]>(() => {
  if (queryKeyword.value === '') {
    if (props.showPoplarTags)
      return popularTags.value
    else
      return []
  }
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
const completesWithKeyword = computed<ComboTag[]>(
  () => {
    const a: ComboTag[] = SearchKeywords
      .filter(siteOrKeywordFilter(queryKeyword.value))
      .map((item) => {
        return {
          type: 'keyword',
          id: `keyword:${item.keyword}`,
          tag: item.keyword,
          cnt: item.cnt,
        }
      })
    return a.concat(completes.value)
  },
)

const inFocus = ref(false)
function onBodyClick(event: MouseEvent) {
  if (comboEl.value && !comboEl.value.contains(event.target as Node))
    inFocus.value = false
}
onMounted(() => {
  document.addEventListener('click', onBodyClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onBodyClick)
})

const active = ref(-1)
const activeCombo = computed(() => completesWithKeyword.value[active.value])

function search() {
  if (props.searchFunction) {
    props.searchFunction()
    return
  }
  query.value = query.value.trim()
  router.push({ path: '/search', query: { q: query.value } })
}

function onKeyDown(e: KeyboardEvent) {
  inFocus.value = true

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      e.stopPropagation()
      if (active.value < completesWithKeyword.value.length - 1)
        active.value++
      else active.value = 0
      break

    case 'PageDown':
      e.preventDefault()
      e.stopPropagation()
      active.value = completesWithKeyword.value.length - 1
      break

    case 'ArrowUp':
      e.preventDefault()
      e.stopPropagation()
      if (active.value >= 0)
        active.value--
      else active.value = completesWithKeyword.value.length - 1
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
    case 'Enter':
      e.preventDefault()
      e.stopPropagation()
      if (activeCombo.value)
        onComboClick()
      else
        search()
      inFocus.value = false
      break
  }
}

function onComboClick(index?: number) {
  if (index !== undefined)
    active.value = index
  query.value = `${queryPrefix.value}${activeCombo.value.tag}${querySuffix.value || ''} `
  const pos = query.value.length
  active.value = -1
  setCursorPos(pos)
  inFocus.value = false
}
</script>

<template>
  <div ref="comboEl" class="relative">
    <div class="flex items-center rounded-md border-2 border-purple-200 dark:border-gray-700 dark:bg-gray-800">
      <input
        ref="inputEl"
        v-model="query"
        class="focus:outline-none w-full ml-4 py-1 dark:bg-gray-800"
        :placeholder="props.placeholder"
        @focus="() => inFocus = true"
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
        class="absolute w-[calc(100%-1rem)] max-h-80vh mt-2 ml-2 rounded-lg ring-2 ring-purple-300 dark:ring-gray-600 bg-white dark:bg-gray-800 overflow-auto"
      >
        <div
          v-if="completesWithKeyword.length === 0"
          class="px-2 py-8 w-full text-lg text-center text-gray-400"
        >
          {{ pending ? '少女祈祷中...' : '没什么可做的' }}
        </div>

        <li
          v-for="(combo, index) in completesWithKeyword"
          :key="combo.id"
          class="px-2 py-1 w-full list-none border-b border-purple-200 dark:border-gray-600 last:border-b-0 transition-colors duration-75 cursor-pointer"
          :class="{ 'bg-purple-200 bg-opacity-10': active === index }"
          @click="onComboClick(index)"
        >
          <div v-if="combo.type === 'keyword'" class="flex items-center">
            <div class="i-uil:tag-alt flex-shrink-0 my-1 mr-1 text-xl text-purple-600" />
            <div
              class="truncate transition-colors duration-75"
              :class="{ 'text-purple-500': active === index }"
              :title="combo.tag"
            >
              {{ combo.tag }}
            </div>
          </div>
          <div v-else-if="combo.type === 'tag'" class="flex items-center">
            <div class="i-uil:tag-alt flex-shrink-0 my-1 mr-1 text-xl text-purple-600" />
            <div class="truncate md:flex md:items-center md:space-x-2">
              <div
                class="truncate transition-colors duration-75"
                :class="{ 'text-purple-500': active === index }"
                :title="combo.tag"
              >
                {{ combo.tag.replace(/_/g, ' ') }}
              </div>
              <div
                v-if="combo.sub"
                class="truncate text-gray-600 dark:text-gray-300 text-xs md:text-sm font-light"
                :title="combo.sub"
              >
                {{ combo.sub.replace(/_/g, ' ') }}
              </div>
            </div>
          </div>
        </li>
      </div>
    </Transition>
  </div>
</template>
