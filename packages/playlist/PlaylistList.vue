<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop></NavTop>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-8/10">
      <div v-if="status === Status.loading">{{ '加载中' }}</div>
      <div v-else-if="status === Status.error">
        <div>{{ '加载失败了QAQ' }}</div>
        <div>{{ '错误原因：' + errMsg }}</div>
      </div>
      <div v-else-if="status === Status.result">
        <div class="border-b-1 pb-1">
          {{ '共' + count + '个播放列表' }}
        </div>
        <!-- Mobile View -->
        <div v-if="screenSizes['<md']">
          <div
            v-for="playlist in playlists"
            :key="playlist.item.title"
            class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            @click="jumpToPlaylist(playlist.id.toHexString())"
          >
            <div class="w-2/5 mr-0.5">
              <div class="aspect-10/16 overflow-hidden rounded-sm">
                <img
                  class="object-cover h-full w-full dark:(filter brightness-80)"
                  :src="'https://patchyvideo.com/images/covers/' + playlist.item.cover"
                />
              </div>
            </div>
            <div class="w-3/5 flex flex-wrap content-between">
              <div class="title-mobile overflow-ellipsis overflow-hidden w-full">{{ playlist.item.title }}</div>
              <div class="w-full text-sm text-gray-600 dark:text-gray-300">
                {{ '共' + playlist.item.count + '个视频' }}
              </div>
            </div>
          </div>
        </div>
        <!-- Desktop View -->
        <div v-else class="justify-evenly flex-wrap flex">
          <div
            v-for="playlist in playlists"
            :key="playlist.item.title"
            class="
              w-48/100
              my-5
              p-2
              border
              shadow-md
              rounded-lg
              bg-white bg-opacity-50
              dark:border-gray-500
              dark:bg-gray-700
            "
          >
            <router-link
              :to="'/playlist/' + playlist.id"
              class="block border-b-1 py-3 text-center text-xl truncate font-semibold lg:text-2xl"
              >{{ playlist.item.title }}</router-link
            >
            <div class="flex p-2 pt-3">
              <div class="w-1/2 mr-5">
                <div class="aspect-10/16 overflow-hidden">
                  <img
                    class="object-cover h-full w-full rounded-lg dark:(filter brightness-80)"
                    :src="'https://patchyvideo.com/images/covers/' + playlist.item.cover"
                  />
                </div>
              </div>
              <div class="w-1/2 py-2 flex flex-wrap content-between">
                <div class="desc w-full overflow-ellipsis overflow-hidden">{{ playlist.item.desc }}</div>
                <div class="w-full text-right text-sm text-gray-600 dark:text-gray-300">
                  {{ '共' + playlist.item.count + '个视频' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <PvPagination
          :page-count="pageCount"
          :page="page"
          @previous="jumpToPreviousPage"
          @next="jumpToNextPage"
          @change="jumpToSelectedPage"
        ></PvPagination>
      </div>
    </div>

    <!-- Advanced Search -->
    <div
      class="
        shadow
        fixed
        bottom-20
        right-5
        bg-gray-50
        cursor-pointer
        p-2
        transition-opacity
        rounded-full
        dark:bg-gray-800
      "
      :title="'高级搜索'"
      @click="progressing('高级搜索')"
    >
      <icon-uil-file-search-alt class="text-2xl" />
    </div>
    <BackTop></BackTop>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import NProgress from 'nprogress'
import { screenSizes } from '@/tailwindcss'
import { useQuery, gql } from '@/graphql'
import { useRoute, useRouter } from 'vue-router'
import { progressing } from '@/common/lib/progressing'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import Footer from '@/common/components/Footer.vue'
import NavTop from '@/common/components/NavTop.vue'
import BackTop from '@/ui/components/BackTop.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import { Playlist } from '@/graphql/__generated__/graphql'

export default defineComponent({
  components: {
    Footer,
    NavTop,
    BackTop,
    PvPagination,
  },
  props: {},
  setup() {
    const { t } = useI18n()
    setSiteTitle('播放列表 - PatchyVideo')
    const route = useRoute()
    const router = useRouter()
    const limit = 40
    const order = 'last_modified'
    enum Status {
      loading = 'loading',
      result = 'result',
      error = 'error',
    }
    const status = ref<Status>()
    const errMsg = ref('')
    const count = ref(0)
    const pageCount = ref(0)
    const playlists = ref<Playlist[]>()
    const offsetChangeFromOtherQuery = ref(false)
    const offset = computed(() =>
      Number(route.query.page ? (typeof route.query.page === 'object' ? route.query.page[0] : route.query.page) : 0)
    )
    const page = computed(() => offset.value + 1)

    watch(
      offset,
      () => {
        if (offsetChangeFromOtherQuery.value) {
          offsetChangeFromOtherQuery.value = false
          return
        }
        queryVideos()
      },
      {
        immediate: true,
      }
    )

    async function queryVideos(): Promise<void> {
      status.value = Status.loading
      try {
        if (!NProgress.isStarted()) NProgress.start()
        const res = await useQuery({
          query: gql`
            query ($offset: Int, $limit: Int, $order: String) {
              listPlaylist(para: { offset: $offset, limit: $limit, order: $order }) {
                playlists {
                  id
                  item {
                    cover
                    title
                    desc
                    count
                  }
                }
                count
                pageCount
              }
            }
          `,
          variables: {
            offset: offset.value * limit,
            limit: limit,
            order: order,
          },
        })
        if (NProgress.isStarted()) NProgress.done()
        // console.log(res)
        const resultData = res.data.listPlaylist
        count.value = resultData.count
        pageCount.value = resultData.pageCount
        playlists.value = resultData.playlists

        status.value = Status.result
      } catch (err) {
        // console.log(err)
        errMsg.value = err.message
        status.value = Status.error
      }
    }

    /* Change the router query to trigger the search function */
    function jumpToPreviousPage(): void {
      router.push({ path: '/playlist-list', query: { page: offset.value - 1 } })
    }
    function jumpToNextPage(): void {
      router.push({ path: '/playlist-list', query: { page: offset.value + 1 } })
    }
    function jumpToSelectedPage(page: number): void {
      router.push({ path: '/playlist-list', query: { page: page - 1 } })
    }

    /* Jump to video detail page */
    function jumpToPlaylist(id: string): void {
      router.push({ path: '/playlist/' + id })
    }
    return {
      t,
      screenSizes,
      offset,
      Status,
      status,
      errMsg,
      page,
      count,
      pageCount,
      playlists,
      progressing,
      jumpToPreviousPage,
      jumpToNextPage,
      jumpToSelectedPage,
      jumpToPlaylist,
    }
  },
})
</script>

<style lang="postcss" scoped>
.title-mobile {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vrtical;
}
.desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
