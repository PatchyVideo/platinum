<template>
  <div v-if="status === 'loading'">
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <div class="border-b-1 pb-1" v-text="t('search.search-result.video.main-body.loading.searching')"></div>
      <div v-for="index in limit" :key="index" class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
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
        v-for="index in limit"
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
  <div v-else-if="status === 'error'">
    <div>{{ t('search.search-result.playlist.main-body.failed.search-failed') }}</div>
    <div>{{ t('search.search-result.playlist.main-body.failed.search-failed-reason') + errMsg }}</div>
  </div>
  <div v-else-if="count === 0">
    {{ t('search.search-result.playlist.main-body.successful.search-no-result') }}
  </div>
  <div v-else-if="status === 'result'">
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
import { defineProps, defineEmit, ref, computed, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { screenSizes } from '@/tailwindcss'
import { useVModel } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { getCoverImage } from '@/common/lib/imageUrl'
import { backTop } from '@/ui/lib/backTop'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import NProgress from 'nprogress'

const props = defineProps({
  pageCount: { type: Number, required: true },
})
const emit = defineEmit(['update:pageCount'])

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const limit = 20
const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const playlists = ref<schema.Playlist[]>()
const pageCount = useVModel(props, 'pageCount', emit)

/* Precess URL query */
const queryWord = computed(() =>
  String(route.query.i ? (Array.isArray(route.query.i) ? route.query.i.join(' ') : route.query.i) : '')
)
const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
)
const Orders = [
  { value: 'last_modified', name: t('search.search-result.order.last-modified') },
  { value: 'video_oldest', name: t('search.search-result.order.video-oldest') },
]
const order = computed(() =>
  String(
    route.query.order ? (Array.isArray(route.query.order) ? route.query.order[0] : route.query.order) : Orders[0].value
  )
)

/* Refresh query result for URL query change */
const URLQuery = computed(() => route.query)
watch(
  URLQuery,
  () => {
    fetchMore({
      variables: {
        offset: offset.value * limit,
        limit: limit,
        query: queryWord.value,
        order: order.value,
      },
    }).then((v) => {
      result.value = v.data
    })
  },
  { deep: true }
)
const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
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
  {
    offset: offset.value * limit,
    limit: limit,
    query: queryWord.value,
    order: order.value,
  }
)
watchEffect(() => {
  if (loading.value) {
    status.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    status.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})

const resultData = useResult(result, null, (data) => data.listPlaylist)
watchEffect(() => {
  if (resultData.value) {
    count.value = resultData.value.count
    pageCount.value = resultData.value.pageCount
    playlists.value = resultData.value.playlists
  }
  backTop()
})
onError((err) => {
  errMsg.value = err.message
  status.value = 'error'
})

/* Jump to detail page */
function jumpToPlaylist(id: string): void {
  const { href } = router.resolve({
    path: '/playlist/' + id,
  })
  window.open(href, '_blank')
}
</script>

<style lang="postcss" scoped>
.search-result-backimg {
  @apply bg-center;
  @apply bg-no-repeat;
  @apply bg-contain;
  background-image: url('../assets/SearchResultBackImg.png');
}
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
