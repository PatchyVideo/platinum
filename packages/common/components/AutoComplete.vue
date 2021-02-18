<template>
  <div ref="autoCompleteRoot" class="relative inline-block">
    <div class="shadow rounded-full h-9 text-center bg-white dark:bg-gray-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="black"
        width="30px"
        height="30px"
        class="fill-current inline ml-2"
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <input
        v-model="searchContent"
        class="inline-block min-w-300 h-full mr-8 outline-none dark:bg-gray-800 dark:text-white"
        placeholder="search!"
      />
      <button
        class="bg-pink-300 h-full px-3 rounded-r-full transition-colors focus:outline-none focus:ring focus:ring-pink-300 hover:bg-pink-200"
        @click="listHidden = !listHidden"
      >
        搜索
      </button>
    </div>
    <div
      :class="{ listHidden: listHidden }"
      class="shadow rounded bg-white w-full absolute top-14/12 left-0 z-10 space-y-2"
    >
      <div
        v-for="item in searchResult"
        :key="item.resultName"
        class="p-2 transition-colors cursor-pointer hover:bg-gray-100"
      >
        {{ item.resultName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { isDark } from '@/darkmode'
// import { useI18n } from 'vue-i18n'
// import { locale } from '@/locales'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    let listHidden = ref<boolean>(true)
    let searchResult: {
      resultName: string
    }[] = reactive([
      { resultName: 'patchyvideo' },
      { resultName: 'thvideo' },
      { resultName: '好耶' },
      { resultName: '看板娘世界第一可爱！' },
    ])
    let searchContent = ref<null | string>('')
    let t: ReturnType<typeof setTimeout> | null = null
    function getSearchKeyword(): string | null {
      const lastChar = searchContent.value?.charAt(searchContent.value?.length - 1)
      if (lastChar === ' ' || lastChar === '(' || lastChar === ')') return null
      else return searchContent.value
    }
    watch(searchContent, () => {
      const searchDelay = 500
      const SearchKeyword = getSearchKeyword()
      if (!searchContent.value || !SearchKeyword) {
        t && clearTimeout(t)
        listHidden.value = true
        return
      }
      t && clearTimeout(t)
      t = setTimeout(() => {
        console.log(searchContent.value)
        listHidden.value = false
      }, searchDelay)
    })
    const autoCompleteRoot = ref<HTMLDivElement | null>(null)
    const autoCompleteListener = (e: MouseEvent): void => {
      if (!autoCompleteRoot.value?.contains(e.target as HTMLElement)) listHidden.value = true
    }
    onMounted((): void => {
      document.addEventListener('click', autoCompleteListener)
    })
    onUnmounted((): void => {
      document.removeEventListener('click', autoCompleteListener)
    })

    return {
      isDark,
      listHidden,
      searchResult,
      autoCompleteRoot,
      searchContent,
    }
  },
})
</script>

<style lang="postcss" scoped>
.listHidden {
  @apply max-h-0;
  @apply invisible;
}
</style>
