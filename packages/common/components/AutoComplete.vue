<template>
  <div ref="autoCompleteRoot" class="relative inline-block">
    <div class="shadow rounded-full h-9 text-center bg-white dark:bg-gray-800">
      <icon-uil-search class="inline ml-2 mr-1" />
      <input
        ref="autoComplete"
        v-model="searchContent"
        class="inline-block h-full outline-none dark:bg-gray-800"
        :class="{ 'w-75': size === 'deskTop', 'mr-8': size === 'mobile' }"
        placeholder="search!"
        @keydown.arrow-up.prevent="selectAutocompleteKeyword(true)"
        @keydown.arrow-down.prevent="selectAutocompleteKeyword(false)"
        @keydown.enter="completeKeywordOrSearch()"
      />
      <button
        v-if="size === 'deskTop'"
        class="bg-pink-300 h-full px-3 rounded-r-full transition-colors focus:outline-none focus:ring focus:ring-pink-300 hover:bg-pink-200"
        @click="searchContent && $emit('search', searchContent)"
      >
        {{ t('common.autoComplete.search') }}
      </button>
    </div>
    <div
      role="listbox"
      :class="{ listHidden: listHidden }"
      class="shadow rounded bg-white w-full absolute top-14/12 left-0 z-10 space-y-2 dark:bg-gray-800"
    >
      <div
        v-for="item in searchResult"
        :key="item.tag"
        class="p-3 transition-colors cursor-pointer hover:bg-gray-100 flex justify-between hover:dark:bg-gray-900"
        :class="{ activeListItem: item.active }"
        @click="clickAutocompleteKeyword(item.tag || ConvertLangRes(item.langs || [], false) || '')"
      >
        <div>
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
            v-html="item.tag || ConvertLangRes(item.langs || [])"
          ></div>
        </div>
        <div class="text-gray-400">{{ item.cnt || '' }}</div>
      </div>
    </div>
    <div
      :class="[loading ? 'loading' : 'noloading']"
      class="p-3 text-center shadow rounded bg-white w-full absolute top-14/12 left-0 z-11 dark:bg-gray-800"
      v-text="searchSuccess ? t('common.autoComplete.loading') : t('common.autoComplete.loadingFailed')"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { isDark } from '@/darkmode'
import { useI18n } from 'vue-i18n'
import { locale } from '@/locales'

export default defineComponent({
  props: {
    keyword: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      validator: (value: string) => {
        return ['deskTop', 'mobile'].indexOf(value) !== -1
      },
      default: 'deskTop',
    },
  },
  emits: ['search'],
  setup(props, { emit }) {
    const { t } = useI18n()
    interface resultType {
      tag?: string
      cat: number
      cnt: null | string
      active?: boolean
      langs?: langs[]
    }
    interface langs {
      l: number
      w: string
    }
    let listHidden = ref<boolean>(true)
    let loading = ref<boolean>(false)
    let searchSuccess = ref<boolean>(true)
    let searchContent = ref<null | string>(props.keyword)
    let cutHeadSearchContent: string
    let cutTailSearchContent: string
    let searchResult = ref<resultType[]>([])
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
    let timer: ReturnType<typeof setTimeout> | null = null
    watch(searchContent, () => {
      const searchDelay = 500
      const searchKeyword: string = getSearchKeyword() || ''
      if (!searchContent.value || !searchKeyword) {
        timer && clearTimeout(timer)
        listHidden.value = true
        return
      }
      timer && clearTimeout(timer)
      timer = setTimeout(() => {
        //  New search keyword should be calculated
        const newSearchKeyword = getSearchKeyword() || ''
        newSearchKeyword && getSearchList(newSearchKeyword)
      }, searchDelay)
    })

    // Slice the search key word
    let autoComplete = ref<HTMLInputElement | null>(null)
    function getSearchKeyword(): string | null {
      let endlocation: number = autoComplete.value?.selectionStart || 0
      let query: string = searchContent.value?.slice(0, endlocation) || ''
      let startlocation: number = match(query)
      cutHeadSearchContent = searchContent.value?.slice(0, startlocation) || ''
      cutTailSearchContent = searchContent.value?.slice(endlocation, searchContent.value.length) || ''
      query = query.slice(startlocation, endlocation)
      if (isNull(query)) {
        return null
      }
      return query
    }
    function match(text: string): number {
      let i: number = text.length
      while (i--) {
        if (
          text.charAt(i) == ' ' ||
          text.charAt(i) == '\t' ||
          text.charAt(i) == '\n' ||
          text.charAt(i) == '\v' ||
          text.charAt(i) == '\f' ||
          text.charAt(i) == '\r' ||
          text.charAt(i).charCodeAt(0) == 41 // 41 is the ascII code of  ')'
        ) {
          return i + 1
        } else if (text.charAt(i).charCodeAt(0) == 40) {
          // 40 is the ascII code of  ')'
          if (i > 0 && text.charAt(i - 1) == '_') {
            continue
          } else {
            return i + 1
          }
        }
      }
      return 0
    }
    function isNull(str: string): boolean {
      if (str == '') return true
      let regu = '^[ ]+$'
      let re = new RegExp(regu)
      return re.test(str)
    }

    // Search for Search list
    async function getSearchList(searchKeyword: string): Promise<void> {
      listHidden.value = true
      loading.value = true
      let listData: resultType[] = sitesAndKeywords.filter(siteOrKeywordFilter(searchKeyword))
      await fetch(`https://patchyvideo.com/be/autocomplete/ql?q=${searchKeyword}`)
        .then((data) => data.json())
        .then((res) => {
          listData = listData.concat(res)
          loading.value = false
          for (let i = 0; i < listData.length; i++) {
            listData[i].active = false
          }
          searchResult.value = listData
          listHidden.value = false
        })
        .catch((err) => {
          searchSuccess.value = false
          console.log(err)
        })
    }
    function siteOrKeywordFilter(query: string) {
      return (siteOrKeyword: resultType): boolean => {
        return siteOrKeyword.tag?.toLowerCase().indexOf(query.toLowerCase()) === 0
      }
    }
    function ConvertLangRes(langs: langs[], hastran = true): string | void {
      if (!langs) return
      const LangList = [
        { id: 1, lang: 'CHS' },
        { id: 2, lang: 'CHT' },
        { id: 5, lang: 'ENG' },
        { id: 10, lang: 'JPN' },
      ]
      const level = [10, 5, 1, 2]
      let Lang = ''
      let mainLang = ''
      let subLang = ''
      // Calculate the main language and the sub language

      // Fetch current language's ID
      let CurrLangIDObject = LangList.find((x) => {
        return x.lang === locale.value
      })
      let CurrLangID: number = CurrLangIDObject ? CurrLangIDObject.id : 1

      // Fetch content with ID
      let CurrLangWord = langs.find((x) => {
        return x.l == CurrLangID
      })
      if (!CurrLangWord) {
        for (let i = 0; i < level.length; i++) {
          CurrLangWord = langs.find((x) => {
            return x.l == level[i]
          })
          if (CurrLangWord) break
        }
      }
      mainLang = CurrLangWord?.w || ''

      if (hastran) {
        // Fetch the sub language
        // Level: Japanese, English, Simplified Chinese, Traditional Chinese
        // 优先级：日本語，English，简体中文，繁體中文
        let SubLangWord = null
        for (let i = 0; i < level.length; i++) {
          if (level[i] == CurrLangWord?.l) continue
          SubLangWord = langs.find((x) => {
            return x.l == level[i]
          })
          if (SubLangWord) break
        }
        subLang = SubLangWord ? SubLangWord.w : mainLang

        // Composite
        Lang = `${mainLang.replace(/_/g, ' ')}`
        Lang += `<span style='font-size:8px;color: gray;display: block;'>${subLang.replace(/_/g, ' ')}</span>`
      } else {
        Lang = mainLang
      }
      return Lang
    }

    // Click to hide the list
    const autoCompleteRoot = ref<HTMLDivElement | null>(null)
    const autoCompleteListener = (e: MouseEvent): void => {
      for (let j = 0; j < searchResult.value.length; j++) {
        searchResult.value[j].active = false
      }
      if (!autoCompleteRoot.value?.contains(e.target as HTMLElement)) {
        listHidden.value = true
        loading.value = false
      }
    }
    onMounted((): void => {
      document.addEventListener('click', autoCompleteListener)
    })
    onUnmounted((): void => {
      document.removeEventListener('click', autoCompleteListener)
    })

    // Select the keyword from the search list with keyboard
    function selectAutocompleteKeyword(up: boolean): void {
      if (!searchResult.value.length) return
      let i = 0
      for (i; i < searchResult.value.length; i++) {
        if (searchResult.value[i].active === true) {
          break
        }
      }
      for (let j = 0; j < searchResult.value.length; j++) {
        searchResult.value[j].active = false
      }
      if (up) {
        if (i === searchResult.value.length || i === 0) {
          searchResult.value[searchResult.value.length - 1].active = true
        } else {
          searchResult.value[i - 1].active = true
        }
      } else {
        if (i === searchResult.value.length || i === searchResult.value.length - 1) {
          searchResult.value[0].active = true
        } else {
          searchResult.value[i + 1].active = true
        }
      }
    }
    // Select the keyword from the search list with mouse
    function clickAutocompleteKeyword(tag: string): void {
      searchContent.value = formatSearchContent(cutHeadSearchContent + tag + ' ' + cutTailSearchContent)
      listHidden.value = true
      autoComplete.value?.focus()
    }

    //  Select the keyword from the search list with keyboard or search
    function completeKeywordOrSearch(): void {
      let i = 0
      for (i; i < searchResult.value.length; i++) {
        if (searchResult.value[i].active === true) {
          break
        }
      }
      if (i == searchResult.value.length) {
        searchContent.value && emit('search', searchContent.value)
        return
      } else {
        searchContent.value = formatSearchContent(
          cutHeadSearchContent +
            (searchResult.value[i].tag || ConvertLangRes(searchResult.value[i].langs || [], false)) +
            ' ' +
            cutTailSearchContent
        )
        searchResult.value = []
        listHidden.value = true
      }
    }
    // Delete extra spaces
    function formatSearchContent(content: string): string {
      var formater = new RegExp('\\s\\s+', 'g')
      content = content.replace(formater, ' ')
      return content
    }

    return {
      t,
      isDark,
      listHidden,
      loading,
      searchSuccess,
      searchResult,
      autoCompleteRoot,
      searchContent,
      autoComplete,
      ConvertLangRes,
      selectAutocompleteKeyword,
      clickAutocompleteKeyword,
      completeKeywordOrSearch,
    }
  },
})
</script>

<style lang="postcss" scoped>
.listHidden {
  @apply max-h-0;
  @apply invisible;
}
.activeListItem {
  @apply bg-gray-100;
  @apply dark:bg-gray-900;
}
.loading {
  @apply visible;
}
.noloading {
  @apply max-h-0;
  @apply invisible;
}
</style>
