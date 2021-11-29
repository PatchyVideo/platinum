<!-- eslint-disable vue/no-v-html -->
<template>
  <div ref="autoCompleteRoot" class="relative inline-block">
    <div
      class="flex h-9 justify-start items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
    >
      <icon-uil-search class="flex-shrink-0 inline ml-2 mr-1" @click="onSearchContentChange()" />
      <input
        ref="autoComplete"
        v-model="searchContent"
        class="inline-block h-full outline-none dark:bg-gray-900 w-full rounded-lg"
        placeholder="search!"
        @keydown.arrow-up.prevent="selectAutocompleteKeyword(true)"
        @keydown.arrow-down.prevent="selectAutocompleteKeyword(false)"
        @keydown.enter="completeKeywordOrSearch()"
        @click="onSearchContentChange()"
      />
      <div class="inline-block ml-1 mr-2" @click="searchContent = ''">
        <icon-uil-times-circle v-show="searchContent" class="flex-shrink-0 text-sm" />
      </div>
      <button
        v-if="width > 500"
        class="flex-shrink-0 bg-pink-300 h-full px-3 rounded-r-lg transition-colors focus:outline-none focus:ring focus:ring-pink-300 hover:bg-pink-200 w-20"
        @click="completeKeywordOrSearch(true)"
        v-text="t('search.auto-complete.search')"
      ></button>
    </div>
    <div
      class="absolute z-11 top-full left-0 w-full overflow-hidden"
      :class="{ 'pt-1': !hideContainer && !teleportResult }"
    >
      <Transition
        :css="false"
        :persisted="true"
        @enter="
          (_, done) => {
            if (motionel) {
              motion.set({ y: -motionel.clientHeight - 20, opacity: 0.5 })
              motion
                .apply({ y: 0, opacity: 1, transition: { y: { type: 'keyframes', ease: 'out', duration: 200 } } })
                ?.then(() => done())
            } else done()
          }
        "
        @after-enter="
          () => {
            transitionStatus = 'enter'
          }
        "
        @leave="
          (_, done) => {
            if (motionel) {
              motion
                .apply({
                  y: -motionel.clientHeight - 20,
                  opacity: 0.5,
                  transition: { y: { type: 'keyframes', ease: 'out', duration: 200 } },
                })
                ?.then(() => done())
            } else done()
          }
        "
        @after-leave="
          () => {
            transitionStatus = 'leave'
          }
        "
      >
        <div
          v-show="!hideContainer && !teleportResult"
          ref="motionel"
          class="w-full rounded bg-white dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-600"
        >
          <Teleport :disabled="!teleportResult" :to="teleportResult">
            <div v-if="!listHidden && searchResult.length > 0" role="listbox" class="w-full">
              <div
                v-for="(item, index) in searchResult.map(lang2tag)"
                :key="item.tag"
                class="px-3 py-1 transition-colors cursor-pointer hover:bg-gray-100 flex justify-between dark:hover:bg-gray-700"
                :class="{ 'bg-gray-100 dark:bg-gray-700': index === activeSearchResult }"
                @click="clickAutocompleteKeyword(item.tag)"
              >
                <div class="text-left">
                  <div
                    :class="{
                      'text-copyright': item.cat === 2,
                      'text-language': item.cat === 5,
                      'text-character': item.cat === 1,
                      'text-author': item.cat === 3,
                      'text-general': item.cat === 0,
                      'text-meta': item.cat === 4,
                      'text-soundtrack': item.cat === 6,
                    }"
                    v-text="item.tag"
                  ></div>
                  <template v-if="item.sub"
                    ><div class="text-xs text-gray-600 dark:text-gray-300" v-text="item.sub"></div
                  ></template>
                </div>
                <div class="text-gray-400">{{ item.cnt || '' }}</div>
              </div>
            </div>
            <div v-else-if="!listHidden" class="p-3 w-full text-center" v-text="'没有搜索建议'"></div>
            <div
              v-else-if="loading"
              class="p-3 w-full text-center"
              v-text="searchSuccess ? t('search.auto-complete.loading') : t('search.auto-complete.loading-failed')"
            ></div>
            <div v-else-if="(!teleportResult || !hideContainer) && showRecommendations" class="w-full">
              <div>
                <h4 class="mx-2 font-light">
                  <icon-uil-tag-alt
                    class="inline-block w-4 h-4 mr-0.5 align-middle text-gray-600 dark:text-gray-300"
                  />热门标签<icon-uil-spinner-alt v-if="popularTags.length === 0" class="inline animate-spin" />
                </h4>
                <div v-if="popularTags" class="mx-0.5 line-clamp-4 text-gray-800 dark:text-gray-300">
                  <div
                    v-for="tag in popularTags"
                    :key="tag"
                    class="inline-block mx-1.5 cursor-pointer select-none"
                    @click="
                      () => {
                        if (
                          searchContent.length > 0 &&
                          [' ', '\t', '\n', '\v', '\f', '\r'].indexOf(
                            searchContent.charAt(searchContent.length - 1)
                          ) === -1
                        )
                          searchContent += ' '
                        searchContent += tag + ' '
                        if (autoComplete) autoComplete.focus()
                      }
                    "
                    v-text="tag.replaceAll(/_/g, ' ')"
                  ></div>
                </div>
              </div></div
          ></Teleport>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, watchEffect, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { throttledWatch, until, useElementSize, useEventListener, useVModel } from '@vueuse/core'
import { behMostMatch, iso639locale } from '@/locales'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { useMotion } from '@vueuse/motion'

const props = withDefaults(
  defineProps<{
    keyword?: string
    teleportResult?: HTMLElement
    showRecommendations?: boolean
  }>(),
  {
    keyword: '',
    teleportResult: undefined,
    showRecommendations: false,
  }
)
const emit = defineEmits<{
  (event: 'update:keyword', value: string): void
  (event: 'search', searchContent: string): void
  (event: 'searching', searching: boolean): void
}>()

const { t } = useI18n()
interface resultType {
  tag?: string
  sub?: string
  cat: number
  cnt: null | string
  langs?: langs[]
  keyword?: string
}
interface langs {
  l: number
  w: string
}
const listHidden = ref<boolean>(true)
const loading = ref<boolean>(false)
const searchSuccess = ref<boolean>(true)
const searchContent = useVModel(props, 'keyword', emit, { passive: true })
let cutHeadSearchContent: string
let cutTailSearchContent: string
const searchResult = ref<resultType[]>([])
const activeSearchResult = ref(-1)
let sitesAndKeywords: resultType[] = reactive([
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

// Send query and show the list
const onSearchContentChange = () => {
  if (!searchContent.value || !getSearchKeyword()) {
    activeSearchResult.value = -1
    listHidden.value = true
    hideContainer.value = false
    return
  }
  const searchKeyword = getSearchKeyword() || ''
  if (searchKeyword) {
    getSearchList(searchKeyword)
  } else {
    hideContainer.value = false
  }
}
throttledWatch(searchContent, () => nextTick(onSearchContentChange), { throttle: 500 })

// Slice the search key word
const autoComplete = shallowRef<HTMLInputElement | null>(null)
function getSearchKeyword(): string | null {
  let endlocation = autoComplete.value?.selectionStart || 0
  let query = searchContent.value?.slice(0, endlocation) || ''
  let startlocation = matchSearchKeywordStart(query)
  cutHeadSearchContent = searchContent.value?.slice(0, startlocation) || ''
  cutTailSearchContent = searchContent.value?.slice(endlocation, searchContent.value.length) || ''
  query = query.slice(startlocation, endlocation)
  if (isEmptyString(query)) return null
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
        if (i > 0 && text.charAt(i - 1) === '_') {
          continue
        } else {
          return i + 1
        }
      }
    }
  }
  return 0
}
const isEmptyString = (str: string): boolean => !str.trim()

// Search for Search list
async function getSearchList(searchKeyword: string): Promise<void> {
  activeSearchResult.value = -1
  listHidden.value = true
  loading.value = true
  let listData: resultType[] = sitesAndKeywords.filter(siteOrKeywordFilter(searchKeyword))
  await fetch(`https://patchyvideo.com/be/autocomplete/ql?q=${searchKeyword}`)
    .then((data) => data.json())
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
  return (siteOrKeyword: resultType): boolean => siteOrKeyword.tag?.toLowerCase().indexOf(query.toLowerCase()) === 0
}
function ConvertLangRes(langs: langs[], keyword = ''): { main: string; sub?: string } {
  const level = [10, 5, 1, 2]

  // Fetch the sub language
  // Level: Japanese, English, Simplified Chinese, Traditional Chinese
  // 优先级：日本語，English，简体中文，繁體中文
  let SubLangWord = null
  for (let i = 0; i < level.length; i++) {
    SubLangWord = langs.find((x) => {
      return x.l == level[i]
    })
    if (SubLangWord) break
  }
  const subLang = SubLangWord ? SubLangWord.w : keyword

  // Composite
  return {
    main: keyword.replace(/_/g, ' '),
    sub: subLang.replace(/_/g, ' '),
  }
}

// Click to hide the list
const autoCompleteRoot = shallowRef<HTMLDivElement | null>()
const hideContainer = ref(true)
useEventListener(document, 'click', async (e: MouseEvent): Promise<void> => {
  activeSearchResult.value = -1
  if (!autoCompleteRoot.value?.contains(e.target as HTMLElement)) {
    hideContainer.value = true
    await until(transitionStatus).toBe('leave')
    listHidden.value = true
    loading.value = false
  }
})

// Select the keyword from the search list with keyboard
function selectAutocompleteKeyword(up: boolean): void {
  if (!searchResult.value.length) return
  if (up) {
    if (activeSearchResult.value === 0) {
      activeSearchResult.value = searchResult.value.length - 1
    } else {
      activeSearchResult.value--
    }
  } else {
    if (activeSearchResult.value === searchResult.value.length - 1) {
      activeSearchResult.value = 0
    } else {
      activeSearchResult.value++
    }
  }
}
// Select the keyword from the search list with mouse
function clickAutocompleteKeyword(tag: string): void {
  searchContent.value = formatSearchContent(cutHeadSearchContent + tag.replace(/ /g, '_') + ' ' + cutTailSearchContent)
  activeSearchResult.value = -1
  listHidden.value = true
  autoComplete.value?.focus()
}

//  Select the keyword from the search list with keyboard or search
function completeKeywordOrSearch(usingSearchButton = false): void {
  loading.value = false
  if (usingSearchButton || activeSearchResult.value === -1) {
    if (searchContent.value) emit('search', searchContent.value)
    return
  } else {
    const item = searchResult.value[activeSearchResult.value]
    searchContent.value = formatSearchContent(
      cutHeadSearchContent + lang2tag(item).tag.replace(/ /g, '_') + ' ' + cutTailSearchContent
    )
    searchResult.value = []
  }
}

// Delete extra spaces
function formatSearchContent(content: string): string {
  content = content.replace(/\s+/g, ' ')
  return content
}

const lang2tag = (item: resultType) => {
  const l = ConvertLangRes(item.langs || [], item.keyword)
  return { ...item, tag: item.tag || l.main, sub: l.sub }
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
  }
)
const popularTags = useResult(
  result,
  [],
  (data) =>
    [...(data?.getPopularTags.popularTags ?? [])]
      .sort((a, b) => b.popluarity - a.popluarity)
      .map((v) => behMostMatch(v.tag.languages)) ?? []
)

const motionel = shallowRef<HTMLElement | null>(null)
const motion = useMotion(motionel)
const transitionStatus = ref<'enter' | 'leave'>('leave')

defineExpose({
  focus,
})
</script>
