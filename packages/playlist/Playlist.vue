<template>
  <LayoutDefault>
    <div class="md:my-4 xl:my-6 max-w-screen-xl mx-auto">
      <template v-if="playlist">
        <div class="md:ml-4 md:flex justify-start space-x-2 md:space-x-4">
          <div class="flex-shrink-0 flex-grow-0 md:w-80 <md:h-30 overflow-hidden">
            <div class="md:aspect-w-8 md:aspect-h-5 <md:relative <md:top-1/2 <md:transform <md:-translate-y-1/2">
              <img
                class="inline-block <md:w-full md:border-pink-300 md:rounded-xl md:border-4"
                width="320"
                height="200"
                :src="getCoverImage({ image: playlist.item.cover })"
              />
            </div>
          </div>
          <div class="mt-2">
            <h1 class="text-2xl font-semibold" v-text="playlist.item.title"></h1>
            <div class="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
              {{
                t('playlist.playlist.info.video-count', {
                  count: playlist.item.count,
                })
              }}<span v-if="playlist.rating">
                · {{ t('playlist.playlist.info.rating', { rating: playlist.rating.totalRating }) }}</span
              ><span v-if="playlist.meta.modifiedAt || playlist.meta.createdAt">
                ·
                <i18n-t keypath="playlist.playlist.info.edit-date" tag="span"
                  ><template #date
                    ><RelativeDate :date="playlist.meta.modifiedAt ?? playlist.meta.createdAt" /></template></i18n-t
              ></span>
            </div>
            <div v-if="playlist.meta.createdBy" class="mt-2">
              <RouterLink :to="'/user/' + playlist.meta.createdBy.id.toHexString()">
                <UserAvatar
                  :image="playlist.meta.createdBy.image"
                  :gravatar="playlist.meta.createdBy.gravatar ?? undefined"
                  class="inline-block w-8 rounded-full"
                />
                <div class="inline-block align-middle pl-2" v-text="playlist.meta.createdBy.username"></div>
              </RouterLink>
            </div>
            <div
              ref="descText"
              class="overflow-hidden transform-gpu transition-all duration-600 ease-in-out my-2"
              :style="{
                height: expandDesc && descScrollHeight > 0 ? descScrollHeight + 'px' : '96px',
              }"
            >
              <MarkdownBlock size="sm" :text="playlist.item.desc" />
            </div>
            <div
              v-if="shouldClampDesc || expandDesc"
              class="
                w-full
                rounded
                text-sm text-gray-700
                py-[0.125rem]
                px-1
                transition-color
                duration-[150ms]
                dark:text-gray-200
                hover:bg-gray-100
                dark:hover:bg-gray-800
                hover:text-blue-600
              "
              @click="expandDesc = !expandDesc"
            >
              <icon-uil-arrow-down class="inline transform" :class="{ 'rotate-180': expandDesc }" />{{
                !expandDesc ? t('playlist.playlist.expand') : t('playlist.playlist.collapse')
              }}
            </div>
          </div>
        </div>
        <div class="pt-2 xl:pt-4">
          <RouterLink
            v-for="(video, index) in playlist.videos"
            :key="video.id.toHexString()"
            :ref="index === playlist.videos.length - 4 ? 'observerTarget' : undefined"
            class="
              flex
              justify-start
              space-x-1
              md:space-x-2
              xl:space-x-3
              py-2
              xl:py-3
              md:px-2
              transition-color
              duration-[150ms]
              odd:bg-gray-50
              dark:odd:bg-gray-600
              hover:bg-pink-50
              dark:hover:bg-gray-800
              hover:odd:bg-pink-50
              dark:hover:odd:bg-gray-800
            "
            :to="'/video/' + video.id.toHexString() + '?list=' + pid"
          >
            <div
              class="
                flex flex-col flex-shrink-0 flex-grow-0
                justify-around
                w-8
                self-center
                items-center
                text-center
                md:space-y-1
              "
            >
              <div v-if="playlist.editable" class="md:text-2xl transition-color duration-100 hover:text-blue-600">
                <icon-uil-arrow-up />
              </div>
              <div class="<md:text-xs" v-text="offset + index + 1"></div>
              <div v-if="playlist.editable" class="md:text-2xl transition-color duration-100 hover:text-blue-600">
                <icon-uil-arrow-down />
              </div>
            </div>
            <div class="flex-shrink-0 flex-grow-0 w-35 md:w-60">
              <div class="aspect-w-8 aspect-h-5">
                <img
                  class="inline-block rounded-lg border-gray-200 border-2"
                  width="240"
                  height="150"
                  :src="getCoverImage({ image: video.item.coverImage })"
                />
              </div>
            </div>
            <div class="overflow-hidden">
              <h1 class="text-sm md:text-lg font-semibold <md:line-clamp-2 md:truncate" v-text="video.item.title"></h1>
              <h2
                v-if="video.item.partName"
                class="-mt-1 text-sm text-gray-700 truncate dark:text-gray-200"
                v-text="`P${pageOfVideo(video.item.url)}: ${video.item.partName}`"
              ></h2>
              <div
                v-if="screenSizes.md"
                class="mt-1 line-clamp-3 text-sm whitespace-normal"
                v-text="video.item.desc"
              ></div>
            </div>
          </RouterLink>
          <div v-if="fetchingMore" class="flex justify-center pt-4">
            <icon-uil-spinner-alt class="text-xl animate-spin" />
          </div>
        </div>
      </template>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import MarkdownBlock from '@/markdown/components/MarkdownBlock.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import { computed, nextTick, ref, watchEffect, onMounted, onUpdated } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import NProgress from 'nprogress'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { getCoverImage } from '@/common/lib/imageUrl'
import { pageOfVideo } from '@/video/lib/biliHelper'
import { templateRef, useElementBounding, useIntersectionObserver } from '@vueuse/core'
import { screenSizes } from '@/tailwindcss'

const { t } = useI18n()

const observerTarget = templateRef('observerTarget')
const fetchingMore = ref(false)
const { stop: stopObserber } = useIntersectionObserver(observerTarget, ([{ isIntersecting }]) => {
  if (playlist.value && playlist.value.videos.length >= playlist.value.item.count) {
    stopObserber()
    return
  }
  if (isIntersecting && !fetchingMore.value && playlist.value) {
    fetchingMore.value = true
    fetchMore({
      variables: {
        offset: playlist.value.videos.length,
      },
    })?.then((v) => {
      // playlist is not null, so result must be not null.
      result.value!.getPlaylist.videos.concat(v.data.getPlaylist.videos)
      nextTick(() => {
        fetchingMore.value = false
      })
    })
  }
})

/* submit query */
const route = useRoute()
const pid = computed(() => route.params.pid as string)
const offset = ref(0)
const { result, loading, fetchMore } = useQuery<Query>(
  gql`
    query ($pid: String!, $offset: Int!, $limit: Int!) {
      getPlaylist(para: { pid: $pid }) {
        item {
          title
          cover
          count
          desc
        }
        rating {
          totalRating
        }
        videos(offset: $offset, limit: $limit) {
          id
          item {
            title
            partName
            desc
            coverImage
            url
          }
        }
        meta {
          createdBy {
            id
            username
            image
            gravatar
          }
          createdAt
          modifiedAt
        }
        editable
      }
    }
  `,
  {
    pid: pid.value,
    offset: offset.value,
    limit: 20,
  }
)

/* basic info */
const playlist = useResult(result, null, (data) => data?.getPlaylist)
// change title
watchEffect(() => {
  if (playlist.value) setSiteTitle(playlist.value.item.title)
})
watchEffect(() => {
  if (loading.value) {
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    if (NProgress.isStarted()) NProgress.done()
  }
})

const descText = templateRef('descText')
const { height: descBoundingHeight } = useElementBounding(descText)
const shouldClampDesc = computed(() => descScrollHeight.value > descBoundingHeight.value)
const expandDesc = ref(false)
const descScrollHeight = ref(0)
const updateScrollHeight = () => {
  descScrollHeight.value = descText.value?.scrollHeight || 0
}
onMounted(updateScrollHeight)
onUpdated(updateScrollHeight)
</script>
