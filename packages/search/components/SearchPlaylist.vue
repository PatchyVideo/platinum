<template>
  <div v-if="status === Status.loading">
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <div class="border-b-1 pb-1" v-text="t('search.search-result.video.main-body.loading.searching')"></div>
      <div v-for="index in 20" :key="index" class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
        <div class="w-2/5 mr-0.5">
          <div class="aspect-10/16 overflow-hidden rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
        </div>
        <div class="w-3/5 flex flex-wrap content-between">
          <div
            class="
              title-mobile
              overflow-ellipsis overflow-hidden
              w-full
              rounded-md
              bg-gray-400
              dark:bg-gray-600
              animate-pulse
            "
          >
            &nbsp;
          </div>
          <div
            class="w-2/5 text-sm text-gray-600 dark:text-gray-300 rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse"
          >
            &nbsp;
          </div>
        </div>
      </div>
    </div>
    <!-- Desktop View -->
    <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
      <div
        v-for="index in 20"
        :key="index"
        class="
          w-48/100
          my-5
          p-2
          border
          shadow-md
          rounded-lg
          bg-white bg-opacity-50
          dark:border-gray-500 dark:bg-gray-700
        "
      >
        <div
          class="
            block
            border-b-1
            py-3
            text-center text-xl
            truncate
            font-semibold
            lg:text-2xl
            rounded-md
            bg-gray-400
            dark:bg-gray-600
            animate-pulse
          "
        >
          &nbsp;
        </div>
        <div class="flex p-2 pt-3">
          <div class="w-1/2 mr-5">
            <div class="aspect-10/16 overflow-hidden rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
          </div>
          <div class="w-1/2 py-2 flex flex-wrap content-between">
            <div class="desc w-full overflow-ellipsis overflow-hidden">
              <div v-for="i in 3" :key="i" class="mb-1 w-full rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse">
                &nbsp;
              </div>
            </div>
            <div class="w-full text-right text-sm text-gray-600 dark:text-gray-300">
              <div class="w-2/5 float-right rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
              :src="getCoverImage({ image: playlist.item.cover })"
            />
          </div>
        </div>
        <div class="w-3/5 flex flex-wrap content-between">
          <div class="title-mobile overflow-ellipsis overflow-hidden w-full" v-text="playlist.item.title"></div>
          <div
            class="w-full text-sm text-gray-600 dark:text-gray-300"
            v-text="t('search.search-result.playlist.playlist.playlist-count', { count: playlist.item.count })"
          ></div>
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
          dark:border-gray-500 dark:bg-gray-700
        "
      >
        <RouterLink
          :to="'/playlist/' + playlist.id"
          class="block border-b-1 py-3 text-center text-xl truncate font-semibold lg:text-2xl"
          v-text="playlist.item.title"
        ></RouterLink>
        <div class="flex p-2 pt-3">
          <div class="w-1/2 mr-5">
            <div class="aspect-10/16 overflow-hidden">
              <img
                class="object-cover h-full w-full rounded-lg dark:(filter brightness-80)"
                :src="getCoverImage({ image: playlist.item.cover })"
              />
            </div>
          </div>
          <div class="w-1/2 py-2 flex flex-wrap content-between">
            <div class="desc w-full overflow-ellipsis overflow-hidden" v-text="playlist.item.desc"></div>
            <div
              class="w-full text-right text-sm text-gray-600 dark:text-gray-300"
              v-text="t('search.search-result.playlist.playlist.playlist-count', { count: playlist.item.count })"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineProps, defineEmit, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { screenSizes } from '@/tailwindcss'
import { useVModel } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { getCoverImage, imageMod } from '@/common/lib/imageUrl'
import { pageOfVideo } from '@/video/lib/biliHelper'
import { gql, injectClient } from '@/graphql'
// import { Playlist } from '@/graphql/__generated__/graphql'
import NProgress from 'nprogress'

const props = defineProps({
  queryWord: { type: String, required: true },
  pageCount: { type: Number, required: true },
  order: {
    type: String,
    validator: (value: string) => {
      return ['last_modified', 'video_oldest'].indexOf(value) !== -1
    },
    required: true,
  },
})
const emit = defineEmit(['update:pageCount', 'order:pageCount'])

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const limit = 20
const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const videos = ref()
const queryWord = ref<string>(props.queryWord)
const pageCount = useVModel(props, 'pageCount', emit)
const order = useVModel(props, 'order', emit)

const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
)
const page = computed(() => offset.value + 1)

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
      ? Array.isArray(route.query.visible_site)
        ? route.query.visible_site[0]
        : route.query.visible_site
      : localStorage.getItem('VisibleSite') || VisibleSites[0].value
  )
)

/* Refresh query result for URL query change */
const URLQuery = computed(() => route.query)
const client = injectClient()
watch(
  URLQuery,
  () => {
    queryVideos()
  },
  {
    immediate: true,
  }
)
async function queryVideos(): Promise<void> {
  if (!queryWord.value || status.value === 'loading') return
  status.value = 'loading'
  try {
    if (!NProgress.isStarted()) NProgress.start()
    const res = await client.query({
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

    status.value = 'result'
  } catch (err) {
    // console.log(err)
    errMsg.value = err.message
    status.value = 'error'
  }
}

/* Change the router query to trigger the search function */
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
</script>

<style lang="postcss" scoped>
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
