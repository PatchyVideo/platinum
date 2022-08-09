<!-- eslint-disable vue/no-v-html -->
<template>
  <div ref="autoCompleteRoot" class="relative inline-block">
    <div
      class="flex h-9 justify-start items-center rounded-lg border border-purple-300 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div class="flex-shrink-0 inline i-uil:search text-lg ml-2 mr-1" @click="onSearchContentChange()" />
      <input
        ref="autoComplete"
        v-model="searchContent"
        class="inline-block h-full outline-none dark:bg-gray-800 w-full rounded-lg"
        :placeholder="placeholder"
        @keydown.arrow-up.prevent="selectAutocompleteKeyword(true)"
        @keydown.arrow-down.prevent="selectAutocompleteKeyword(false)"
        @keydown.enter="completeKeywordOrSearch()"
        @click="onSearchContentChange()"
      >
      <div
        v-show="searchContent"
        class="i-uil:times-circle flex-shrink-0 inline-block ml-1 mr-2"
        @click="searchContent = ''"
      />
      <button
        v-if="width > 500"
        class="flex-shrink-0 h-full px-3 text-purple-900 dark:text-white rounded-r-lg border-l-1 border-l-purple-200 dark:border-l-gray-700 bg-purple-100 dark:bg-gray-700 hover:bg-purple-200 focus:outline-none focus:ring focus:ring-purple-300 transition-colors"
        @click="completeKeywordOrSearch(true)"
        v-text="t('search.auto-complete.search')"
      />
    </div>

    <div
      class="absolute z-11 top-full left-0 w-full overflow-hidden"
      :class="{ 'pt-1': !hideContainer && !teleportResult }"
    >
      <Transition
        enter-active-class="transform transition duration-100 ease-out"
        enter-from-class="scale-95 -translate-y-1/20 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transform transition duration-75 ease-out"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 -translate-y-1/20 opacity-0"
      >
        <div
          v-show="!hideContainer && !teleportResult"
          class="w-full rounded-md border-purple-300 shadow-lg bg-white dark:border-gray-700 dark:bg-gray-900"
          :class="{ 'border-1': !listHidden || loading || ((!teleportResult || !hideContainer) && showRecommendations) }"
        >
          <Teleport :disabled="!teleportResult" :to="teleportResult">
            <ul v-if="!listHidden && searchResult.length > 0" role="listbox" class="w-full rounded-md divide-y-1 divide-purple-200 divide-dashed overflow-hidden dark:divide-gray-600">
              <li
                v-for="(item, index) in searchResult.map(lang2tag)"
                :key="item.tag"
                class="flex px-3 py-1 gap-2 justify-between transition-colors cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700"
                :class="{ 'bg-purple-50 dark:bg-gray-700': index === activeSearchResult }"
                @click="clickAutocompleteKeyword(item)"
              >
                <div class="flex min-w-0 flex-col">
                  <div class="flex gap-px items-center">
                    <div
                      class="i-uil:tag-alt flex-shrink-0"
                      :class="{
                        'text-copyright': item.cat === 2,
                        'text-language': item.cat === 5,
                        'text-character': item.cat === 1,
                        'text-author': item.cat === 3,
                        'text-general': item.cat === 0,
                        'text-meta': item.cat === 4,
                        'text-soundtrack': item.cat === 6,
                      }"
                    />
                    <div class="truncate" :class="{ 'text-purple-900 dark:text-purple-50': index === activeSearchResult }">
                      {{ item.tag }}
                    </div>
                  </div>
                  <div
                    v-if="item.sub"
                    class="text-xs text-gray-700 dark:text-gray-200 truncate"
                  >
                    {{ item.sub }}
                  </div>
                </div>
                <div v-if="showTagCnt" class="text-gray-400">
                  {{ item.cnt || '' }}
                </div>
              </li>
            </ul>

            <div
              v-else-if="!listHidden"
              class="flex w-full py-5 justify-center items-center gap-1 text-2xl text-gray-600 font-light"
            >
              {{ t('search.auto-complete.loading-nothing') }}
            </div>

            <div
              v-else-if="loading"
              class="flex w-full py-5 justify-center items-center gap-1 text-2xl text-gray-300 font-light"
            >
              <template v-if="searchSuccess">
                <div class="i-uil:spinner-alt text-3xl animate-spin" />
                {{ t('search.auto-complete.loading') }}
              </template>
              <template v-else>
                {{ t('search.auto-complete.loading-failed') }}
              </template>
            </div>

            <div v-else-if="(!teleportResult || !hideContainer) && showRecommendations" class="w-full py-1">
              <div>
                <h4 class="mx-2 font-light">
                  <div class="i-uil:tag-alt inline-block text-lg align-middle text-gray-600 dark:text-gray-300" />
                  {{ t('search.auto-complete.hot-tags') }}
                  <div v-if="popularTags.length === 0" class="i-uil:spinner-alt inline animate-spin" />
                </h4>
                <div v-if="popularTags" class="mx-0.5 line-clamp-4 text-gray-800 dark:text-gray-300">
                  <div
                    v-for="tag in popularTags"
                    :key="tag"
                    class="inline-block mx-1.5 cursor-pointer select-none"
                    @click="
                      () => {
                        if (
                          searchContent.length > 0
                          && [' ', '\t', '\n', '\v', '\f', '\r'].indexOf(
                            searchContent.charAt(searchContent.length - 1),
                          ) === -1
                        )
                          searchContent += ' '
                        searchContent += `${tag} `
                        if (autoComplete) autoComplete.focus()
                      }
                    "
                    v-text="tag.replaceAll(/_/g, ' ')"
                  />
                </div>
              </div>
            </div>
          </Teleport>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, reactive, ref, shallowRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementSize, useEventListener, useVModel, watchDebounced } from '@vueuse/core'
import { behMostMatch, iso639locale } from '@/locales'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'

const props = withDefaults(
  defineProps<{
    keyword?: string
    placeholder?: string
    teleportResult?: HTMLElement
    showRecommendations?: boolean
    showTagCnt?: boolean
  }>(),
  {
    keyword: '',
    placeholder: 'search!',
    teleportResult: undefined,
    showRecommendations: false,
    showTagCnt: true,
  },
)
const emit = defineEmits<{
  (event: 'update:keyword', value: string): void
  (event: 'search', searchContent: string): void
  (event: 'searching', searching: boolean): void
  (event: 'suggestionClick', item: AutoCompleteResult): void
}>()

const { t } = useI18n()

const listHidden = ref(true)
const loading = ref(false)
const searchSuccess = ref(true)
const searchContent = useVModel(props, 'keyword', emit, { passive: true })
let cutHeadSearchContent: string
let cutTailSearchContent: string
const searchResult = ref<AutoCompleteResult[]>([])
const activeSearchResult = ref(-1)
const sitesAndKeywords: AutoCompleteResult[] = reactive([
  { tag: 'site:acfun', cat: 6, cnt: null, active: false },
  { tag: 'site:bilibili', cat: 6, cnt: null, active: false },
  { tag: 'site:nicovideo', cat: 6, cnt: null, active: false },
  { tag: 'site:twitter', cat: 6, cnt: null, active: false },
  { tag: 'site:youtube', cat: 6, cnt: null, active: false },
  { tag: 'site:zcool', cat: 6, cnt: null, active: false },
  { tag: 'site:ipfs', cat: 6, cnt: null, active: false },
  { tag: 'AND', cat: 6, cnt: null, active: false },
  { tag: 'OR', cat: 6, cnt: null, active: false },
  { tag: 'NOT', cat: 6, cnt: null, active: false },
  { tag: 'date:', cat: 6, cnt: null, active: false },
  { tag: 'tags:', cat: 6, cnt: null, active: false },
])

// Click to hide the list
const autoCompleteRoot = shallowRef<HTMLDivElement | null>()
const hideContainer = ref(true)
useEventListener(document, 'click', async (e: MouseEvent): Promise<void> => {
  activeSearchResult.value = -1
  if (!autoCompleteRoot.value?.contains(e.target as HTMLElement)) {
    hideContainer.value = true
    await nextTick()
    listHidden.value = true
    loading.value = false
  }
})

// Send query and show the list
const onSearchContentChange = () => {
  if (!searchContent.value || !getSearchKeyword()) {
    activeSearchResult.value = -1
    listHidden.value = true
    hideContainer.value = false
    return
  }
  const searchKeyword = getSearchKeyword() || ''
  if (searchKeyword)
    getSearchList(searchKeyword)
  else
    hideContainer.value = false
}
watchDebounced(searchContent, () => nextTick(onSearchContentChange), { debounce: 500 })

// Slice the search key word
const autoComplete = shallowRef<HTMLInputElement | null>(null)
const isEmptyString = (str: string): boolean => !str.trim()
function getSearchKeyword(): string | null {
  const endlocation = autoComplete.value?.selectionStart || 0
  let query = searchContent.value?.slice(0, endlocation) || ''
  const startlocation = matchSearchKeywordStart(query)
  cutHeadSearchContent = searchContent.value?.slice(0, startlocation) || ''
  cutTailSearchContent = searchContent.value?.slice(endlocation, searchContent.value.length) || ''
  query = query.slice(startlocation, endlocation)
  if (isEmptyString(query))
    return null
  return query
}
function matchSearchKeywordStart(text: string): number {
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
}

// Search for Search list
async function getSearchList(searchKeyword: string): Promise<void> {
  activeSearchResult.value = -1
  listHidden.value = true
  loading.value = true
  let listData: AutoCompleteResult[] = sitesAndKeywords.filter(siteOrKeywordFilter(searchKeyword))
  await fetch(`https://patchyvideo.com/be/autocomplete/ql?q=${searchKeyword}`)
    .then(data => data.json())
    .then((res) => {
      // console.log(res)
      listData = listData.concat(res)
      loading.value = false
      activeSearchResult.value = -1
      searchResult.value = listData
      listHidden.value = false
      hideContainer.value = false
    })
    .catch(() => {
      searchSuccess.value = false
      hideContainer.value = false
    })
}
function siteOrKeywordFilter(query: string) {
  return (siteOrKeyword: AutoCompleteResult): boolean => siteOrKeyword.tag?.toLowerCase().indexOf(query.toLowerCase()) === 0
}
function convertLangRes(langs: AutoCompleteLangs[], keyword = ''): { main: string; sub?: string } {
  const level = [10, 5, 1, 2]

  // Fetch the sub language
  // Level: Japanese, English, Simplified Chinese, Traditional Chinese
  // 优先级：日本語，English，简体中文，繁體中文
  let SubLangWord = null
  for (let i = 0; i < level.length; i++) {
    SubLangWord = langs.find((x) => {
      return x.l === level[i]
    })
    if (SubLangWord)
      break
  }
  const subLang = SubLangWord ? SubLangWord.w : keyword

  // Composite
  return {
    main: keyword.replace(/_/g, ' '),
    sub: subLang.replace(/_/g, ' '),
  }
}

// Select the keyword from the search list with keyboard
function selectAutocompleteKeyword(up: boolean): void {
  if (!searchResult.value.length)
    return
  if (up) {
    if (activeSearchResult.value === 0)
      activeSearchResult.value = searchResult.value.length - 1
    else
      activeSearchResult.value--
  }
  else {
    if (activeSearchResult.value === searchResult.value.length - 1)
      activeSearchResult.value = 0
    else
      activeSearchResult.value++
  }
}
// Select the keyword from the search list with mouse
function clickAutocompleteKeyword(item: AutoCompleteResult): void {
  if (!item.tag)
    return
  searchContent.value = formatSearchContent(`${cutHeadSearchContent + item.tag.replace(/ /g, '_')} ${cutTailSearchContent}`)
  activeSearchResult.value = -1
  listHidden.value = true
  autoComplete.value?.focus()
  emit('suggestionClick', item)
}

//  Select the keyword from the search list with keyboard or search
const lang2tag = (item: AutoCompleteResult) => {
  const l = convertLangRes(item.langs || [], item.keyword)
  return { ...item, tag: item.tag || l.main, sub: l.sub }
}
function completeKeywordOrSearch(usingSearchButton = false): void {
  loading.value = false
  if (usingSearchButton || activeSearchResult.value === -1) {
    if (searchContent.value)
      emit('search', searchContent.value)
  }
  else {
    const item = searchResult.value[activeSearchResult.value]
    const tag = lang2tag(item).tag
    searchContent.value = formatSearchContent(
      `${cutHeadSearchContent + tag.replace(/ /g, '_')} ${cutTailSearchContent}`,
    )
    searchResult.value = []
    emit('suggestionClick', item)
  }
}

// Delete extra spaces
function formatSearchContent(content: string): string {
  content = content.replace(/\s+/g, ' ')
  return content
}

/**
 * Focus input
 */
const focus = () => {
  autoComplete.value?.focus()
}

watchEffect(() => {
  emit('searching', !listHidden.value || loading.value)
})

const { width } = useElementSize(autoCompleteRoot)

/* popular tags */
const { result } = useQuery<Query>(
  gql`
    query ($lang: String!) {
      getPopularTags(para: { lang: $lang }) {
        popularTags {
          popluarity
          tag {
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
    lang: iso639locale.value,
  },
)
const popularTags = useResult(
  result,
  [],
  data =>
    [...(data?.getPopularTags.popularTags ?? [])]
      .sort((a, b) => b.popluarity - a.popluarity)
      .map(v => behMostMatch(v.tag.languages)) ?? [],
)

defineExpose({
  focus,
})
</script>

<script lang="ts">
export interface AutoCompleteResult {
  tag?: string
  sub?: string
  cat: number
  cnt: null | string
  id?: number
  langs?: AutoCompleteLangs[]
  keyword?: string
}
export interface AutoCompleteLangs {
  l: number
  w: string
}
</script>
