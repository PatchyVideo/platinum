<template>
  <div class="max-w-screen-3xl mx-auto dark:bg-gray-700">
    <NavTop></NavTop>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-8/10">
      <div v-if="status === Status.loading">{{ t('video.video-list.main-body.loading.searching') }}</div>
      <div v-else-if="status === Status.error">
        <div>{{ t('video.video-list.main-body.failed.search-failed') }}</div>
        <div>{{ t('video.video-list.main-body.failed.search-failed-reason') + errMsg }}</div>
      </div>
      <div v-else-if="status === Status.result">
        <div class="border-b-1 pb-1">
          {{
            t('video.video-list.main-body.successful.search-result-count1') +
            count +
            t('video.video-list.main-body.successful.search-result-count2')
          }}
        </div>
        <!-- <div class="p-1 text-xs text-right md:text-sm">*已屏蔽含有敏感标签的视频</div> -->
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
            <div class="flex flex-wrap content-between w-3/5 pb-1 text-sm">
              <div v-if="video.item.partName" class="overflow-hidden w-full">
                <a class="inline-block w-full truncate">{{ video.item.title }}</a>
                <div class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300">
                  <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
                  >{{ video.item.partName }}
                </div>
              </div>
              <a v-else class="title overflow-ellipsis overflow-hidden w-full">{{ video.item.title }}</a>
              <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                <div>{{ t('video.video-list.video.source-site') }}</div>
                <img class="cover h-full" :src="imgMod[video.item.site]" :alt="video.item.site" />
              </div>
            </div>
          </div>
        </div>
        <!-- Desktop View -->
        <div v-else class="justify-evenly flex-wrap flex">
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
                  <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
                  >{{ video.item.partName }}
                </div>
              </div>
              <a v-else class="title overflow-ellipsis overflow-hidden" :title="video.item.title">{{
                video.item.title
              }}</a>
              <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                <div>{{ t('video.video-list.video.source-site') }}</div>
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
      :title="t('video.video-list.advanced-search.name')"
      @click="t('video.video-list.advanced-search.name')"
    >
      <icon-uil-file-search-alt class="text-2xl" />
    </div>
    <BackTop></BackTop>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import BackTop from '@/ui/components/BackTop.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NProgress from 'nprogress'
import { useQuery, gql } from '@/graphql'
import { Video } from '@/graphql/__generated__/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { pageOfVideo } from '@/video/lib/biliHelper'
import { progressing } from '@/common/lib/progressing'
import { screenSizes } from '@/tailwindcss'

const imgMod = Object.fromEntries(
  Object.entries(import.meta.globEager('/packages/common/assets/WebIcons/*.png')).map(([key, value]) => [
    key.replace(/\/packages\/common\/assets\/WebIcons\/(.+)\.png/, '$1'),
    value.default,
  ])
)

export default defineComponent({
  components: { NavTop, Footer, BackTop, PvPagination },
  props: {},
  setup() {
    const { t } = useI18n()
    setSiteTitle(t('video.video-list.title') + ' - PatchyVideo')
    const route = useRoute()
    const router = useRouter()
    const limit = 40
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

    /* Precess URL query */
    const offsetChangeFromOtherQuery = ref(false)
    const offset = computed(() =>
      Number(route.query.page ? (typeof route.query.page === 'object' ? route.query.page[0] : route.query.page) : 0)
    )
    const page = computed(() => offset.value + 1)

    /* Refresh query result for URL query change */
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
      if (status.value === Status.loading) return
      status.value = Status.loading
      try {
        if (!NProgress.isStarted()) NProgress.start()
        const res = await useQuery({
          query: gql`
            query ($offset: Int, $limit: Int, $query: String) {
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
            query: '',
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

    /* Change the router query to trigger the search function */
    function jumpToPreviousPage(): void {
      router.push({ path: '/video-list', query: { page: offset.value - 1 } })
    }
    function jumpToNextPage(): void {
      router.push({ path: '/video-list', query: { page: offset.value + 1 } })
    }
    function jumpToSelectedPage(page: number): void {
      router.push({ path: '/video-list', query: { page: page - 1 } })
    }

    /* Jump to video detail page */
    function jumpToVideoResult(id: string): void {
      const { href } = router.resolve({
        path: '/video/' + id,
      })
      window.open(href, '_blank')
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
      videos,
      pageOfVideo,
      jumpToPreviousPage,
      jumpToNextPage,
      jumpToSelectedPage,
      jumpToVideoResult,
      imgMod,
      progressing,
    }
  },
})
</script>

<style lang="postcss" scoped>
.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
