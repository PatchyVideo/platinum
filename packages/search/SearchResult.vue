<template>
  <div class="max-w-screen-3xl mx-auto dark:bg-gray-700">
    <NavTop :show-search-bar="false" />

    <div class="text-center flex flex-col justify-start items-center">
      <h3 v-if="screenSizes['sm']" class="text-lg font-semibold p-4 px-auto">
        {{ t('search.search-result.search-keywords') + queryWord }}
      </h3>
      <AutoComplete
        v-if="screenSizes['<md']"
        class="mt-3 sm:w-4/6 w-5/6"
        size="mobile"
        :keyword="queryWord"
        @search="searchResult"
      />
      <AutoComplete v-else class="md:w-4/6 lg:w-3/6" size="lg" :keyword="queryWord" @search="searchResult" />
    </div>

    <div class="p-2 md:m-auto xl:w-9/10 2xl:w-8/10">
      <div class="my-2 md:m-0 md:flex md:justify-between">
        <div class="flex">
          <div
            v-for="tabs in Tabs"
            :key="tabs.value"
            class="
              px-5
              py-2
              cursor-pointer
              text-gray-400 text-sm
              font-semibold
              border-t-4 border-transparent
              md:text-base md:font-bold md:p-5 md:pt-3
            "
            :class="{ 'active-tab': tabs.value === tab }"
            @click="changeTab(tabs.value)"
            v-text="tabs.name"
          ></div>
        </div>
        <div v-if="tab === 'video' || tab === 'playlist'" class="flex self-center">
          <label
            v-for="orders in Orders"
            :key="orders.value"
            class="
              px-2
              py-1
              cursor-pointer
              text-gray-400 text-sm
              font-semibold
              md:text-base md:font-bold md:px-5 md:py-2
            "
            :class="{ 'active-opt': orders.value === order }"
            @click="changeOrder(orders.value)"
            v-text="orders.name"
          ></label>
        </div>
      </div>

      <!-- Videos -->
      <SearchVideo v-if="tab === Tabs[0].value" :query-word="queryWord" :order="order" :page-count="pageCount" />

      <!-- Playlists -->
    </div>
    <PvPagination
      :page-count="pageCount"
      :page="page"
      @previous="jumpToPreviousPage"
      @next="jumpToNextPage"
      @change="jumpToSelectedPage"
    />
    <BackTop ref="backTop" />
    <Footer />
  </div>
</template>

<script lang="ts">
import AutoComplete from '@/search/components/AutoComplete.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import BackTop from '@/ui/components/BackTop.vue'
import SearchVideo from '@/search/components/SearchVideo.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import { computed, defineComponent, ref, watch, Component } from 'vue'
import { templateRef } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NProgress from 'nprogress'
import { gql, injectClient } from '@/graphql'
import { Video, Playlist } from '@/graphql/__generated__/graphql'
import { getCoverImage } from '@/common/lib/imageUrl'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { screenSizes } from '@/tailwindcss'

export default defineComponent({
  components: { NavTop, AutoComplete, Footer, BackTop, SearchVideo, PvPagination },
  props: {},
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const limit = 20
    enum Status {
      loading = 'loading',
      result = 'result',
      error = 'error',
    }
    const status = ref<Status>()
    const errMsg = ref('')
    const count = ref(0)
    const pageCount = ref(0)
    const videos = ref<Video[]>()
    const playlists = ref<Playlist[]>()

    /* Precess URL query */
    const queryWord = computed(() => {
      const query = String(
        route.query.i ? (typeof route.query.i === 'object' ? route.query.i.join(' ') : route.query.i) : ''
      )
      if (query) {
        setSiteTitle(t('search.search-result.title') + query)
      }
      return query
    })
    const offset = computed(() =>
      Number(route.query.page ? (typeof route.query.page === 'object' ? route.query.page[0] : route.query.page) : 0)
    )
    const page = computed(() => offset.value + 1)
    const Tabs = [
      {
        value: 'video',
        name: t('search.search-result.video.tab'),
      },
      {
        value: 'playlist',
        name: t('search.search-result.playlist.tab'),
      },
    ]
    const tab = computed(() =>
      String(
        route.query.tab ? (typeof route.query.tab === 'object' ? route.query.tab[0] : route.query.tab) : Tabs[0].value
      )
    )

    const Orders = [
      { value: 'last_modified', name: t('search.search-result.order.last-modified') },
      { value: 'video_oldest', name: t('search.search-result.order.video-oldest') },
    ]
    const order = computed(() =>
      String(
        route.query.order
          ? typeof route.query.order === 'object'
            ? route.query.order[0]
            : route.query.order
          : Orders[0].value
      )
    )

    /* Refresh query result for URL query change */
    const URLQuery = computed(() => route.query)
    const client = injectClient()
    watch(
      URLQuery,
      () => {
        switch (tab.value) {
          case Tabs[1].value:
            queryPlaylists()
            break
        }
      },
      {
        immediate: true,
      }
    )
    async function queryPlaylists(): Promise<void> {
      if (status.value === Status.loading) return
      status.value = Status.loading
      try {
        if (!NProgress.isStarted()) NProgress.start()
        const res = await client.query({
          query: gql`
            query ($offset: Int, $limit: Int, $query: String, $order: String) {
              listPlaylist(para: { offset: $offset, limit: $limit, query: $query, order: $order }) {
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
            query: queryWord.value,
            order: order.value,
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
      toTop()
    }
    const backTop = templateRef<(typeof BackTop & Component & Element) | null>('backTop')
    function toTop() {
      if (backTop.value) backTop.value.backUp()
    }

    /* Change the router query to trigger the search function */
    function searchResult(searchContent: string): void {
      const query = JSON.parse(JSON.stringify(route.query))
      query.i = searchContent
      query.page = 0
      router.push({ path: route.path, query })
    }
    function jumpToPreviousPage(): void {
      const query = JSON.parse(JSON.stringify(route.query))
      query.page = offset.value - 1
      router.push({ path: route.path, query })
    }
    function jumpToNextPage(): void {
      const query = JSON.parse(JSON.stringify(route.query))
      query.page = offset.value + 1
      router.push({ path: route.path, query })
    }
    function jumpToSelectedPage(page: number): void {
      const query = JSON.parse(JSON.stringify(route.query))
      query.page = page - 1
      router.push({ path: route.path, query })
    }
    function changeTab(value: string): void {
      const query = JSON.parse(JSON.stringify(route.query))
      query.page = 0
      query.tab = value
      delete query.visible_site
      delete query.order
      router.push({ path: route.path, query })
    }
    function changeOrder(value: string): void {
      const query = JSON.parse(JSON.stringify(route.query))
      query.page = 0
      query.order = value
      router.push({ path: route.path, query })
    }
    function changeVisibleSites(value: string): void {
      localStorage.setItem('VisibleSite', value)
      const query = JSON.parse(JSON.stringify(route.query))
      query.page = 0
      query.visible_site = value
      router.push({ path: route.path, query })
    }

    /* Jump to detail page */
    function jumpToPlaylist(id: string): void {
      const { href } = router.resolve({
        path: '/playlist/' + id,
      })
      window.open(href, '_blank')
    }

    return {
      t,
      screenSizes,
      queryWord,
      Tabs,
      tab,
      Orders,
      order,
      Status,
      status,
      errMsg,
      page,
      count,
      pageCount,
      videos,
      playlists,
      getCoverImage,
      searchResult,
      jumpToPreviousPage,
      jumpToNextPage,
      jumpToSelectedPage,
      changeTab,
      changeVisibleSites,
      changeOrder,
      jumpToPlaylist,
    }
  },
})
</script>

<style lang="postcss" scoped>
.active-tab {
  @apply text-black;
  @apply border-pink-300;
  @apply dark:text-white;
}
.active-opt {
  @apply text-black;
  @apply rounded-full;
  @apply bg-gray-100;
  @apply dark:text-white
  @apply dark:bg-gray-500;
}
.search-result-backimg {
  @apply bg-center;
  @apply bg-no-repeat;
  @apply bg-contain;
  background-image: url('./assets/SearchResultBackImg.png');
}
.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
