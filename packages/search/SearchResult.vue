<template>
  <div class="dark:bg-gray-700">
    <nav-top :show-search-bar="false"></nav-top>

    <div class="text-center">
      <h3 class="text-lg font-semibold p-4 px-auto">
        {{ '搜索结果 - ' + queryWord }}
      </h3>
      <auto-complete class="md:hidden" size="mobile" :keyword="queryWord" @search="searchResult"></auto-complete>
      <auto-complete class="hidden md:inline-block" :keyword="queryWord" @search="searchResult"></auto-complete>
    </div>

    <div class="p-2 md:m-auto lg:w-7/10">
      <div v-if="status === 'loading'">搜索中......</div>
      <div v-else-if="status === 'error'">
        <div>加载失败了QAQ</div>
        <div>{{ '错误原因：' + errMsg }}</div>
      </div>
      <div v-else-if="count === 0">没有搜索到视频QAQ</div>
      <div v-else-if="status === 'result'">
        <div class="border-b-1 pb-1">{{ '共搜索到' + count + '个视频' }}</div>
        <!-- Mobile View -->
        <div class="md:hidden">
          <div
            v-for="video in videos"
            :key="video.item.title"
            class="py-1 flex items-start hover:bg-gray-50 dark:hover:bg-gray-800"
            @click="jumpToVideoResult(video.id.toHexString())"
          >
            <div class="img-box w-2/5 mr-0.5 overflow-hidden rounded-sm">
              <img
                class="object-cover h-full w-full"
                :src="'https://patchyvideo.com/images/covers/' + video.item.coverImage"
              />
            </div>
            <div class="w-3/5 text-sm">
              <div v-if="video.item.partName">
                <a class="inline-block w-full truncate">{{ video.item.title }}</a>
                <div class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300">
                  <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
                  >{{ video.item.partName }}
                </div>
              </div>
              <a v-else class="title overflow-ellipsis overflow-hidden">{{ video.item.title }}</a>
              <div>{{ '源网站：' + video.item.site }}</div>
            </div>
          </div>
        </div>
        <!-- Desktop View -->
        <div class="justify-evenly flex-wrap hidden md:flex">
          <div
            v-for="video in videos"
            :key="video.item.title"
            class="w-21/100 my-5 border rounded-lg dark:border-gray-500"
            @click="jumpToVideoResult(video.id.toHexString())"
          >
            <div class="img-box-md overflow-hidden rounded-sm lg:img-box-lg">
              <img
                class="object-cover h-full w-full rounded-lg"
                :src="'https://patchyvideo.com/images/covers/' + video.item.coverImage"
              />
            </div>
            <div class="p-1 text-left text-sm lg:text-base">
              <div v-if="video.item.partName">
                <a class="inline-block w-full truncate" :title="video.item.title">{{ video.item.title }}</a>
                <div
                  class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300"
                  :title="video.item.partName"
                >
                  <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
                  >{{ video.item.partName }}
                </div>
              </div>
              <a v-else class="title overflow-ellipsis overflow-hidden" :title="video.item.title">{{
                video.item.title
              }}</a>
              <div>{{ '源网站：' + video.item.site }}</div>
            </div>
          </div>
        </div>
        <div class="border-t-1 pt-1 flex-1 flex justify-between items-center">
          <a
            v-if="offset"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:text-gray-500 dark:bg-gray-600 dark:border-gray-700 dark:hover:bg-black"
            @click="jumpToPreviousPage"
          >
            上一页
          </a>
          <div>{{ '第' + (offset + 1) + '/' + pageCount + '页' }}</div>
          <a
            v-if="offset + 1 != pageCount"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:text-gray-500 dark:bg-gray-600 dark:border-gray-700 dark:hover:bg-black"
            @click="jumpToNextPage"
          >
            下一页
          </a>
        </div>
      </div>
    </div>
    <BackTop></BackTop>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import AutoComplete from '@/common/components/AutoComplete.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import BackTop from '@/common/components/BackTop.vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@/graphql'
import { gql } from '@apollo/client/core'
import { Video } from '@/graphql/__generated__/graphql'

enum Status {
  loading = 'loading',
  result = 'result',
  error = 'error',
}

export default defineComponent({
  components: { NavTop, AutoComplete, Footer, BackTop },
  props: {},
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const limit = 20
    const status = ref<Status>()
    const errMsg = ref('')
    const count = ref(0)
    const pageCount = ref(0)
    const videos = ref<Video[]>()

    /* Precess URL query */
    const queryWord = computed(() => {
      const query = route.query.i ? (typeof route.query.i === 'object' ? route.query.i.join(' ') : route.query.i) : ''
      if (query) {
        document.title = t('search.title') + query
      }
      return query
    })
    const offsetChangeFromOtherQuery = ref(false)
    const offset = computed(() =>
      Number(route.query.page ? (typeof route.query.page === 'object' ? route.query.page[0] : route.query.page) : 0)
    )

    /* Refresh query result for URL query change */
    watch(
      queryWord,
      () => {
        queryVideos()
        offsetChangeFromOtherQuery.value = false
      },
      {
        immediate: true,
      }
    )
    watch(offset, () => {
      if (offsetChangeFromOtherQuery.value) {
        offsetChangeFromOtherQuery.value = false
        return
      }
      queryVideos()
    })

    async function queryVideos(): Promise<void> {
      if (!queryWord.value || status.value === Status.loading) return
      status.value = Status.loading
      try {
        const res = await useQuery({
          query: gql`
            query($offset: Int, $limit: Int, $query: String) {
              listVideo(para: { offset: $offset, limit: $limit, humanReadableTag: true, query: $query }) {
                count
                pageCount
                videos {
                  id
                  item {
                    coverImage
                    title
                    site
                    cid
                    partName
                    url
                  }
                }
              }
            }
          `,
          variables: {
            offset: offset.value * limit,
            limit: limit,
            query: queryWord.value,
          },
        })
        // console.log(res)

        const resultData = res.data.listVideo
        count.value = resultData.count
        pageCount.value = resultData.pageCount
        videos.value = resultData.videos

        status.value = Status.result
      } catch (err) {
        // console.log(err)
        errMsg.value = err.message
        status.value = Status.error
      }
    }

    /* Get part name number from Bilibili video's URL */
    const pageOfVideo = computed(() => {
      return (url: string): string => {
        return url.slice(url.indexOf('=') + 1, url.length)
      }
    })

    /* Change the router query to trigger the search function */
    function searchResult(searchContent: string): void {
      offsetChangeFromOtherQuery.value = true
      router.push({ path: '/search-result', query: { i: searchContent, page: 0 } })
    }
    function jumpToPreviousPage(): void {
      router.push({ path: '/search-result', query: { i: queryWord.value, page: offset.value - 1 } })
    }
    function jumpToNextPage(): void {
      router.push({ path: '/search-result', query: { i: queryWord.value, page: offset.value + 1 } })
    }

    /* Jump to video detail page */
    function jumpToVideoResult(id: string): void {
      router.push({ path: '/video/' + id })
    }
    return {
      t,
      queryWord,
      offset,
      status,
      errMsg,
      count,
      pageCount,
      videos,
      pageOfVideo,
      searchResult,
      jumpToPreviousPage,
      jumpToNextPage,
      jumpToVideoResult,
    }
  },
})
</script>

<style lang="postcss" scoped>
.img-box {
  height: 25vw;
}
.img-box-md {
  height: 13.75vw;
}
@variants lg {
  .lg\:img-box-lg {
    height: 9.2vw;
  }
}
.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
