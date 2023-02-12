<template>
  <LayoutDefault>
    <div class="md:my-4 xl:my-6 max-w-screen-xl mx-auto">
      <template v-if="playlist">
        <div class="md:ml-4 md:flex justify-start space-x-2 md:space-x-4">
          <div class="flex-shrink-0 flex-grow-0 md:w-80 lt-md:h-30 overflow-hidden">
            <div class="md:aspect-ratio-8/5 lt-md:relative lt-md:top-1/2 lt-md:transform lt-md:-translate-y-1/2">
              <img
                class="inline-block lt-md:w-full md:border-purple-300 md:rounded-xl md:border-2"
                width="320"
                height="200"
                :src="getCoverImage({ image: playlist.item.cover })"
              >
            </div>
          </div>
          <div class="mt-2">
            <h1 class="text-2xl font-semibold" v-text="playlist.item.title" />
            <div class="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
              {{
                t('playlist.playlist.info.video-count', {
                  count: playlist.item.count,
                })
              }}<span v-if="playlist.rating">
                · {{ t('playlist.playlist.info.rating', { rating: playlist.rating.totalRating }) }}</span><span v-if="playlist.meta.modifiedAt || playlist.meta.createdAt">
                ·
                <i18n-t keypath="playlist.playlist.info.edit-date" tag="span"><template #date><RelativeDate :date="playlist.meta.modifiedAt ?? playlist.meta.createdAt" /></template></i18n-t></span>
            </div>
            <div v-if="playlist.meta.createdBy" class="mt-2">
              <RouterLink class="flex flex-row items-center" :to="`/user/${playlist.meta.createdBy.id.toHexString()}`">
                <UserAvatarPopper :uid="playlist.meta.createdBy.id.toHexString()">
                  <UserAvatar
                    class="inline-block w-8 rounded-full"
                    :image="playlist.meta.createdBy.image"
                    :gravatar="playlist.meta.createdBy.gravatar ?? undefined"
                    hide-title
                  />
                </UserAvatarPopper>
                <div class="inline-block align-middle pl-2" v-text="playlist.meta.createdBy.username" />
              </RouterLink>
            </div>
            <div class="py-2">
              <div
                ref="descText"
                class="overflow-hidden transform transition-all duration-600 ease-in-out"
                :style="{
                  height: expandDesc && descScrollHeight > 0 ? `${descScrollHeight}px` : '96px',
                }"
              >
                <div ref="descBlock">
                  <MarkdownBlock size="sm" :text="playlist.item.desc" @html-changed="updateScrollHeight" />
                </div>
              </div>
            </div>
            <div
              v-if="shouldClampDesc || expandDesc"
              class="w-full rounded text-sm text-gray-800 py-0.5 px-1 transition-colors duration-150 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600"
              @click="expandDesc = !expandDesc"
            >
              <div class="i-uil:arrow-down inline transform" :class="{ 'rotate-180': expandDesc }" />
              {{ !expandDesc ? t('playlist.playlist.expand') : t('playlist.playlist.collapse') }}
            </div>
          </div>
        </div>
        <div class="pt-2 xl:pt-4">
          <RouterLink
            v-for="(video, index) in playlist.videos"
            :key="video.id.toHexString()"
            :ref="index === playlist.videos.length - 4 ? 'observerTarget' : undefined"
            class="flex justify-start space-x-1 md:space-x-2 xl:space-x-3 py-2 xl:py-3 md:px-2 transition-colors duration-150 odd:bg-gray-50 dark:odd:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 hover:odd:bg-purple-50 dark:hover:odd:bg-gray-700"
            :to="`/video/${video.id.toHexString()}?list=${pid}`"
            target="_blank"
          >
            <div
              class="flex flex-col flex-shrink-0 flex-grow-0 justify-around w-8 self-center items-center text-center md:space-y-1"
            >
              <div
                v-if="playlist.editable"
                class="i-uil:arrow-up md:text-3xl text-gray-400 dark:text-gray-600 transition-colors duration-100 hover:text-blue-600"
              />
              <div class="lt-md:text-xs" v-text="offset + index + 1" />
              <div
                v-if="playlist.editable"
                class="i-uil:arrow-down md:text-3xl text-gray-400 dark:text-gray-600 transition-colors duration-100 hover:text-blue-600"
              />
            </div>
            <div class="flex-shrink-0 flex-grow-0 w-28 md:w-60">
              <div class="aspect-ratio-8/5">
                <img
                  class="inline-block rounded-lg border-purple-200 border-2"
                  width="240"
                  height="150"
                  :src="getCoverImage({ image: video.item.coverImage })"
                >
              </div>
            </div>
            <div class="overflow-hidden">
              <h1
                class="text-sm md:text-lg font-semibold lt-md:line-clamp-2 md:truncate"
                v-text="video.item.title"
              />
              <h2
                v-if="video.item.partName"
                class="-mt-1 text-sm text-gray-800 truncate dark:text-gray-200"
                v-text="`P${pageOfVideo(video.item.url)}: ${video.item.partName}`"
              />
              <div
                v-if="screenSizes.md"
                class="mt-1 line-clamp-3 text-sm whitespace-normal"
                v-text="video.item.desc"
              />
            </div>
          </RouterLink>
          <div v-if="fetchingMore" class="flex justify-center pt-4">
            <div class="i-uil:spinner-alt text-2xl animate-spin" />
          </div>
        </div>
      </template>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, shallowRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useElementBounding, useIntersectionObserver } from '@vueuse/core'
import MarkdownBlock from '@/markdown/components/MarkdownBlock.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import UserAvatarPopper from '@/user/components/UserAvatarPopper.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { getCoverImage } from '@/common/libs/imageUrl'
import { pageOfVideo } from '@/video/libs/biliHelper'
import { screenSizes } from '@/css'
import { startProgress, stopProgress } from '@/nprogress'

const { t } = useI18n()

const observerTarget = shallowRef<HTMLLinkElement | null>(null)

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
  },
)

/* basic info */
const playlist = useResult(result, null, data => data?.getPlaylist)
// change title
watchEffect(() => {
  if (playlist.value)
    setSiteTitle(playlist.value.item.title)
})
watchEffect(() => {
  if (loading.value)
    startProgress()
  else
    stopProgress()
})

const fetchingMore = ref(false)
const { stop: stopObserver } = useIntersectionObserver(observerTarget, ([{ isIntersecting }]) => {
  if (playlist.value && playlist.value.videos.length >= playlist.value.item.count) {
    stopObserver()
    return
  }
  if (isIntersecting && !fetchingMore.value && playlist.value) {
    fetchingMore.value = true
    fetchMore({
      variables: {
        offset: playlist.value.videos.length,
      },
      // TODO remove it
      updateQuery(previousQueryResult, { fetchMoreResult }) {
        if (!fetchMoreResult)
          return previousQueryResult
        return {
          ...previousQueryResult,
          getPlaylist: {
            ...previousQueryResult.getPlaylist,
            videos: [...previousQueryResult.getPlaylist.videos, ...fetchMoreResult.getPlaylist.videos],
          },
        }
      },
    })?.then((v) => {
      nextTick(() => {
        fetchingMore.value = false
      })
    })
  }
})

const descText = shallowRef<HTMLDivElement | null>(null)
const descBlock = shallowRef<HTMLDivElement | null>(null)
const { height: descBoundingHeight } = useElementBounding(descText)
const descScrollHeight = ref(0)
const updateScrollHeight = () => {
  descScrollHeight.value = descBlock.value?.scrollHeight || 0
}
const expandDesc = ref(false)
const shouldClampDesc = computed(() => descScrollHeight.value > descBoundingHeight.value)
</script>
