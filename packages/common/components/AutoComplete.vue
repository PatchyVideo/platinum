<template>
  <div ref="autoCompleteRoot" class="relative inline-block">
    <div class="shadow rounded-full h-9 text-center bg-white dark:bg-gray-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="black"
        width="30px"
        height="30px"
        class="fill-current inline align-middle ml-2"
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <input
        ref="autoComplete"
        v-model="searchContent"
        class="inline-block min-w-70 h-full mr-8 outline-none dark:bg-gray-800 dark:text-white"
        placeholder="search!"
        @keydown.arrow-up.prevent="selectAutocompleteKeyword(true)"
        @keydown.arrow-down.prevent="selectAutocompleteKeyword(false)"
        @keydown.enter="completeKeywordOrSearch()"
      />
      <button
        class="bg-pink-300 h-full px-3 rounded-r-full transition-colors focus:outline-none focus:ring focus:ring-pink-300 hover:bg-pink-200"
        @click="searchContent && search()"
      >
        t('common.autoComplete.search')
      </button>
    </div>
    <div
      role="listbox"
      :class="{ listHidden: listHidden }"
      class="shadow rounded bg-white w-full absolute top-14/12 left-0 z-10 space-y-2"
    >
      <div
        v-for="item in searchResult"
        :key="item.tag"
        class="p-2 transition-colors cursor-pointer hover:bg-gray-100"
        :class="{ activeListItem: item.active }"
        @click="clickAutocompleteKeyword(item.tag)"
      >
        {{ item.tag }}
      </div>
    </div>
    <div
      :class="[loading ? 'loading' : 'noloading']"
      class="shadow rounded bg-white w-full absolute top-14/12 left-0 z-11"
      v-text="searchSuccess ? t('common.autoComplete.loading') : t('common.autoComplete.loadingFailed')"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { isDark } from '@/darkmode'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {},
  props: {
    search: {
      type: Function,
      default: (): void => {
        alert('search!')
        return
      },
    },
  },
  setup(props) {
    const { t } = ref(useI18n)
    interface resultType {
      tag: string
      cat: number
      cnt: null | string
      active?: boolean
    }
    let listHidden = ref<boolean>(true)
    let loading = ref<boolean>(false)
    let searchSuccess = ref<boolean>(true)
    let searchContent = ref<null | string>('')
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
      await fetch(`https://patchyvideo.com/be/autocomplete/?q=${searchKeyword}`)
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
        return siteOrKeyword.tag.toLowerCase().indexOf(query.toLowerCase()) === 0
      }
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
      searchContent.value = cutHeadSearchContent + tag + ' ' + cutTailSearchContent // There can be multiple spaces between words, someday fix them?
      searchResult.value = []
      listHidden.value = true
      autoComplete.value?.focus()
    }

    // Complete keyword or search
    function completeKeywordOrSearch(): void {
      let i = 0
      for (i; i < searchResult.value.length; i++) {
        if (searchResult.value[i].active === true) {
          break
        }
      }
      if (i == searchResult.value.length) {
        searchContent.value && props.search()
        return
      } else {
        searchContent.value = cutHeadSearchContent + searchResult.value[i].tag + ' ' + cutTailSearchContent // There can be multiple spaces between words, someday fix them?
        searchResult.value = []
        listHidden.value = true
      }
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
}
.loading {
  @apply visible;
}
.noloading {
  @apply max-h-0;
  @apply invisible;
}
</style>
