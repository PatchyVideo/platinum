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

    <div class="p-2">
      <div v-if="status === 'loading'">搜索中......</div>
      <div v-else-if="status === 'error'">
        <div>加载失败了QAQ</div>
        <div>{{ '错误原因：' + errMsg }}</div>
      </div>
      <div v-else-if="status === 'result'">
        <div>{{ '共搜索到' + count + '个视频' }}</div>
        <div v-for="video in videos" :key="video.item.title" class="py-1 flex items-start hover:bg-gray-50">
          <div class="img-box w-2/5 pr-0.5 inline-block overflow-hidden">
            <img
              class="object-cover h-full w-full"
              :src="'https://patchyvideo.com/images/covers/' + video.item.coverImage"
            />
          </div>
          <div class="w-3/5 pl-0.5 text-sm inline-block">
            <router-link
              :to="'/video/' + video.id"
              class="title overflow-ellipsis overflow-hidden"
              :title="video.item.title"
              >{{ video.item.title }}</router-link
            >
            <div>{{ '源网站：' + video.item.site }}</div>
          </div>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import AutoComplete from '@/common/components/AutoComplete.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
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
  components: { NavTop, AutoComplete, Footer },
  props: {},
  setup() {
    const { t } = useI18n()

    /* Get the query Word and query result */
    const limit = 20
    const offset = ref(0)
    const status = ref<Status>()
    const errMsg = ref('')
    const count = ref(0)
    const pageCount = ref(0)
    const videos = ref<Video[]>()
    const queryWord = computed(() => {
      const i = useRoute().query.i
      const query = i ? (typeof i === 'object' ? i.join(' ') : i) : ''
      if (query) {
        document.title = t('search.title') + query
      }
      return query
    })

    watch(
      queryWord,
      async () => {
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
                    }
                  }
                }
              }
            `,
            variables: {
              offset: offset.value,
              limit: limit,
              query: queryWord.value,
            },
          })
          console.log(res)

          const resultData = res.data.listVideo
          count.value = resultData.count
          pageCount.value = resultData.pageCount
          videos.value = resultData.videos

          status.value = Status.result
        } catch (err) {
          status.value = Status.error
          // console.log(err)
          errMsg.value = err.message
        }
      },
      {
        immediate: true,
      }
    )

    // Change the router query to trigger the search function
    const router = useRouter()
    function searchResult(searchContent: string): void {
      router.push({ path: '/search-result', query: { i: searchContent } })
    }
    return {
      t,
      offset,
      status,
      errMsg,
      count,
      pageCount,
      videos,
      queryWord,
      searchResult,
    }
  },
})
</script>

<style lang="postcss" scoped>
.img-box {
  height: 25vw;
}
.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
