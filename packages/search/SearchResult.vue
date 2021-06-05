<template>
  <div class="max-w-screen-3xl mx-auto dark:bg-gray-700">
    <NavTop :show-search-bar="false"></NavTop>

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
      ></AutoComplete>
      <AutoComplete
        v-else
        class="md:w-4/6 lg:w-3/6"
        size="lg"
        :keyword="queryWord"
        @search="searchResult"
      ></AutoComplete>
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
              md:text-base
              md:font-bold
              md:p-5
              md:pt-3
            "
            :class="{ 'active-tab': tabs.value === tab }"
            @click="changeTab(tabs.value)"
          >
            {{ tabs.name }}
          </div>
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
              md:text-base
              md:font-bold
              md:px-5
              md:py-2
            "
            :class="{ 'active-opt': orders.value === order }"
            @click="changeOrder(orders.value)"
            >{{ orders.name }}</label
          >
        </div>
      </div>

      <!-- Videos -->
      <div v-if="tab === Tabs[0].value">
        <div v-if="status === Status.loading">{{ t('search.search-result.video.main-body.loading.searching') }}</div>
        <div v-else-if="status === Status.error">
          <div>{{ t('search.search-result.video.main-body.failed.search-failed') }}</div>
          <div>{{ t('search.search-result.video.main-body.failed.search-failed-reason') + errMsg }}</div>
        </div>
        <div v-else-if="count === 0">{{ t('search.search-result.video.main-body.successful.search-no-result') }}</div>
        <div v-else-if="status === Status.result">
          <div class="flex flex-wrap-reverse justify-between items-end border-b-1 pb-1">
            <div>
              {{ t('search.search-result.video.main-body.successful.search-result-count', { count: count }) }}
            </div>
            <div v-if="tab === 'video'" class="flex self-center space-x-2">
              <label
                v-for="sites in VisibleSites"
                :key="sites.value"
                class="
                  px-2
                  py-1
                  cursor-pointer
                  text-gray-400 text-sm
                  font-semibold
                  md:text-base
                  md:font-bold
                  md:px-3
                  md:py-1
                "
                :class="{ 'active-opt': sites.value === visibleSite }"
                @click="changeVisibleSites(sites.value)"
                >{{ sites.name }}</label
              >
            </div>
          </div>
          <!-- Mobile View -->
          <div v-if="screenSizes['<md']">
            <div
              v-for="video in videos"
              :key="video.item.title"
              class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-800"
              @click="jumpToVideoResult(video.id.toHexString())"
            >
              <div class="w-2/5 mr-0.5">
                <div class="aspect-10/16 overflow-hidden rounded-sm">
                  <img
                    class="object-cover h-full w-full dark:(filter brightness-80)"
                    :src="'https://patchyvideo.com/images/covers/' + video.item.coverImage"
                  />
                </div>
              </div>
              <div class="w-3/5 text-sm pb-1 flex flex-wrap content-between">
                <div v-if="video.item.partName" class="overflow-hidden w-full">
                  <a class="inline-block w-full truncate">{{ video.item.title }}</a>
                  <div class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300">
                    <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
                    >{{ video.item.partName }}
                  </div>
                </div>
                <a v-else class="title overflow-ellipsis overflow-hidden w-full">{{ video.item.title }}</a>
                <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                  <div>{{ t('search.search-result.video.video.source-site') }}</div>
                  <img class="cover h-full" :src="imgMod[video.item.site]" :alt="video.item.site" />
                </div>
              </div>
            </div>
          </div>
          <!-- Desktop View -->
          <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
            <div
              v-for="video in videos"
              :key="video.item.title"
              class="
                w-21/100
                my-5
                border
                shadow-sm
                rounded-lg
                bg-white bg-opacity-50
                dark:border-gray-500
                dark:bg-gray-700
              "
              @click="jumpToVideoResult(video.id.toHexString())"
            >
              <div class="aspect-10/16 overflow-hidden rounded-sm">
                <img
                  class="object-cover h-full w-full rounded-lg dark:(filter brightness-80)"
                  :src="'https://patchyvideo.com/images/covers/' + video.item.coverImage"
                />
              </div>
              <div class="p-3 text-left text-sm lg:text-base">
                <div v-if="video.item.partName">
                  <a class="inline-block w-full truncate" :title="video.item.title">{{ video.item.title }}</a>
                  <div
                    class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300"
                    :title="video.item.partName"
                  >
                    <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ': ' }}</label
                    >{{ video.item.partName }}
                  </div>
                </div>
                <a v-else class="title overflow-ellipsis overflow-hidden" :title="video.item.title">{{
                  video.item.title
                }}</a>
                <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                  <div>{{ t('search.search-result.video.video.source-site') }}</div>
                  <img class="cover" :src="imgMod[video.item.site]" :alt="video.item.site" />
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

      <!-- Playlists -->
      <div v-else-if="tab === Tabs[1].value">
        <div v-if="status === Status.loading">{{ t('search.search-result.playlist.main-body.loading.searching') }}</div>
        <div v-else-if="status === Status.error">
          <div>{{ t('search.search-result.playlist.main-body.failed.search-failed') }}</div>
          <div>{{ t('search.search-result.playlist.main-body.failed.search-failed-reason') + errMsg }}</div>
        </div>
        <div v-else-if="count === 0">
          {{ t('search.search-result.playlist.main-body.successful.search-no-result') }}
        </div>
        <div v-else-if="status === Status.result">
          <div class="border-b-1 pb-1">
            {{ t('search.search-result.playlist.main-body.successful.search-result-count', { count: count }) }}
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
                  {{ t('search.search-result.playlist.playlist.playlist-count', { count: playlist.item.count }) }}
                </div>
              </div>
            </div>
          </div>
          <!-- Desktop View -->
          <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
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
                    {{ t('search.search-result.playlist.playlist.playlist-count', { count: playlist.item.count }) }}
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
    </div>
    <BackTop></BackTop>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import AutoComplete from '@/search/components/AutoComplete.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import BackTop from '@/ui/components/BackTop.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NProgress from 'nprogress'
import { useQuery, gql } from '@/graphql'
import { Video, Playlist } from '@/graphql/__generated__/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { pageOfVideo } from '@/video/lib/biliHelper'
import { screenSizes } from '@/tailwindcss'

const imgMod = Object.fromEntries(
  Object.entries(import.meta.globEager('/packages/common/assets/WebIcons/*.png')).map(([key, value]) => [
    key.replace(/\/packages\/common\/assets\/WebIcons\/(.+)\.png/, '$1'),
    value.default,
  ])
)

export default defineComponent({
  components: { NavTop, AutoComplete, Footer, BackTop, PvPagination },
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
    const VisibleSites = [
      {
        value: '',
        name: t('search.search-result.video.visible-sites.all'),
      },
      {
        value: 'ANY(site:acfun site:bilibili site:zcool)',
        name: t('search.search-result.video.visible-sites.home'),
      },
      {
        value: 'ANY(site:nicovideo site:twitter site:youtube site:ipfs)',
        name: t('search.search-result.video.visible-sites.abroad'),
      },
    ]
    const visibleSite = computed(() =>
      String(
        route.query.visible_site
          ? typeof route.query.visible_site === 'object'
            ? route.query.visible_site[0]
            : route.query.visible_site
          : localStorage.getItem('VisibleSite') || VisibleSites[0].value
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
          : Orders[0].value || ''
      )
    )

    /* Refresh query result for URL query change */
    const URLQuery = computed(() => route.query)
    watch(
      URLQuery,
      () => {
        switch (tab.value) {
          case Tabs[0].value:
            queryVideos()
            break
          case Tabs[1].value:
            queryPlaylists()
            break
        }
      },
      {
        immediate: true,
      }
    )

    async function queryVideos(): Promise<void> {
      if (!queryWord.value || status.value === Status.loading) return
      status.value = Status.loading
      try {
        if (!NProgress.isStarted()) NProgress.start()
        const res = await useQuery({
          query: gql`
            query ($offset: Int, $limit: Int, $query: String, $order: String, $additionalConstraint: String) {
              listVideo(
                para: {
                  offset: $offset
                  limit: $limit
                  humanReadableTag: true
                  query: $query
                  order: $order
                  additionalConstraint: $additionalConstraint
                }
              ) {
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
            order: order.value,
            additionalConstraint: visibleSite.value,
          },
        })
        if (NProgress.isStarted()) NProgress.done()
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
    async function queryPlaylists(): Promise<void> {
      if (status.value === Status.loading) return
      status.value = Status.loading
      try {
        if (!NProgress.isStarted()) NProgress.start()
        const res = await useQuery({
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
    function jumpToVideoResult(id: string): void {
      const { href } = router.resolve({
        path: '/video/' + id,
      })
      window.open(href, '_blank')
    }
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
      offset,
      Tabs,
      tab,
      VisibleSites,
      visibleSite,
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
      pageOfVideo,
      searchResult,
      jumpToPreviousPage,
      jumpToNextPage,
      jumpToSelectedPage,
      changeTab,
      changeVisibleSites,
      changeOrder,
      jumpToVideoResult,
      jumpToPlaylist,
      imgMod,
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
</style>
