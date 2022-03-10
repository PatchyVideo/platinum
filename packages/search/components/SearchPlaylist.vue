<template>
  <div v-if="status === 'loading'">
    <div class="border-b pb-1" v-text="t('search.search-result.video.main-body.loading.searching')"></div>
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <div v-for="index in limit" :key="index" class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
        <div class="w-2/5 mr-0.5">
          <CoverPlaceholder class="rounded-md"></CoverPlaceholder>
        </div>
        <div class="w-3/5 flex flex-wrap content-between">
          <div class="line-clamp-2 overflow-ellipsis overflow-hidden w-full rounded-md bg-gray-400 dark:bg-gray-600">
            &nbsp;
          </div>
          <div class="w-2/5 text-sm text-gray-600 dark:text-gray-300 rounded-md bg-gray-300 dark:bg-gray-600">
            &nbsp;
          </div>
        </div>
      </div>
    </div>
    <!-- Desktop View -->
    <div v-else class="search-result-backimg flex flex-wrap justify-evenly bg-center bg-no-repeat bg-contain">
      <div
        v-for="index in limit"
        :key="index"
        class="w-12/25 my-5 p-2 border border-purple-400 shadow-md rounded-lg bg-white bg-opacity-50 dark:border-purple-800 dark:bg-gray-900"
      >
        <div
          class="block border-b py-3 text-center text-xl truncate font-semibold lg:text-2xl rounded-md bg-gray-400 dark:bg-gray-600"
        >
          &nbsp;
        </div>
        <div class="flex p-2 pt-3">
          <div class="w-1/2 mr-5">
            <CoverPlaceholder class="rounded-md"></CoverPlaceholder>
          </div>
          <div class="w-1/2 py-2 flex flex-wrap content-between">
            <div class="line-clamp-3 w-full overflow-ellipsis overflow-hidden">
              <div v-for="i in 3" :key="i" class="mb-1 w-full rounded-md bg-gray-300 dark:bg-gray-600">&nbsp;</div>
            </div>
            <div class="w-full text-right text-sm text-gray-600 dark:text-gray-300">
              <div class="w-2/5 float-right rounded-md bg-gray-300 dark:bg-gray-600">&nbsp;</div>
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
    <div class="border-b pb-1">
      {{ t('search.search-result.playlist.main-body.successful.search-result-count', { count: count }) }}
    </div>
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <RouterLink
        v-for="playlist in playlists"
        :key="playlist.item.title"
        class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        :to="'/playlist/' + playlist.id.toHexString()"
      >
        <div class="w-2/5 mr-0.5">
          <div class="aspect-ratio-16/10 overflow-hidden rounded-sm">
            <img
              class="object-cover h-full w-full dark:filter dark:brightness-75"
              :src="getCoverImage({ image: playlist.item.cover })"
            />
          </div>
        </div>
        <div class="w-3/5 flex flex-wrap content-between">
          <div class="line-clamp-2 overflow-ellipsis overflow-hidden w-full" v-text="playlist.item.title"></div>
          <div
            class="w-full text-sm text-gray-600 dark:text-gray-300"
            v-text="t('search.search-result.playlist.playlist.playlist-count', { count: playlist.item.count })"
          ></div>
        </div>
      </RouterLink>
    </div>
    <!-- Desktop View -->
    <div v-else class="search-result-backimg flex flex-wrap justify-evenly bg-center bg-no-repeat bg-contain">
      <div
        v-for="playlist in playlists"
        :key="playlist.item.title"
        class="w-12/25 my-5 p-2 border border-purple-400 shadow-md rounded-lg bg-white bg-opacity-50 dark:border-purple-800 dark:bg-gray-900"
      >
        <RouterLink
          :to="'/playlist/' + playlist.id"
          class="block border-b py-3 text-center text-xl truncate font-semibold lg:text-2xl"
          v-text="playlist.item.title"
        ></RouterLink>
        <div class="flex p-2 pt-3">
          <div class="w-1/2 mr-5">
            <div class="aspect-ratio-16/10 overflow-hidden">
              <img
                class="object-cover h-full w-full rounded-lg dark:filter dark:brightness-75"
                :src="getCoverImage({ image: playlist.item.cover })"
              />
            </div>
          </div>
          <div class="w-1/2 py-2 flex flex-wrap content-between">
            <div class="line-clamp-3 w-full overflow-ellipsis overflow-hidden" v-text="playlist.item.desc"></div>
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

<script lang="ts" setup>
import CoverPlaceholder from '@/video/components/CoverPlaceholder.vue'
import { ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { screenSizes } from '@/css'
import { useVModels } from '@vueuse/core'
import { getCoverImage } from '@/common/lib/imageUrl'
import { backTop } from '@/ui/lib/backTop'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import NProgress from 'nprogress'

const props = defineProps<{
  query: string
  limit: number
  offset: number
  order: string
  pageCount: number
}>()

const emit = defineEmits<{
  (event: 'update:query', value: string): void
  (event: 'update:limit', value: number): void
  (event: 'update:offset', value: number): void
  (event: 'update:order', value: string): void
  (event: 'update:pageCount', value: number): void
}>()

const { t } = useI18n()
const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const playlists = ref<schema.Playlist[]>()
const { query, limit, offset, order, pageCount } = useVModels(props, emit)

/* Refresh query result for URL query change */
watch(
  props,
  () => {
    backTop()
    fetchMore({
      variables: {
        offset: offset.value * limit.value,
        limit: limit.value,
        query: query.value,
        order: order.value,
      },
    })?.then((v) => {
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
    offset: offset.value * limit.value,
    limit: limit.value,
    query: query.value,
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

const resultData = useResult(result, null, (data) => data?.listPlaylist)
watchEffect(() => {
  if (resultData.value) {
    count.value = resultData.value.count
    pageCount.value = resultData.value.pageCount
    playlists.value = resultData.value.playlists
  }
})
onError((err) => {
  errMsg.value = err.message
  status.value = 'error'
})
</script>

<style lang="postcss" scoped>
.search-result-backimg {
  background-image: url('../assets/SearchResultBackImg.png');
}
</style>
