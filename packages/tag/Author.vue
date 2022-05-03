<template>
  <LayoutDefault>
    <div v-if="author" class="max-w-screen-xl mx-auto">
      <!-- padding for profile background -->
      <div class="w-full aspect-ratio-6/1 bg-gray-200 dark:bg-gray-600" />
      <!-- basic info -->
      <div class="flex flex-row lt-sm:mt-2 ml-4 md:ml-16">
        <div class="aspect-ratio-1/1 flex-shrink-0 flex-grow-0 sm:-mt-16">
          <div
            class="overflow-hidden border-2 border-gray-300 dark:border-gray-800 transform transition-all ease duration-300"
            :style="{ borderRadius: isHoveringAvatar ? '0.25rem' : screenSizes.md ? '14rem' : '5rem' }"
            @mouseenter="() => isHoveringAvatar = true"
            @mouseleave="() => isHoveringAvatar = false"
          >
            <UserAvatar
              class="w-20 h-20 md:w-56 md:h-56 cursor-pointer"
              openable
              hide-title
              :alt="author.tagname"
              :image="author.avatar"
            />
          </div>
        </div>
        <div class="mt-1 sm:mt-2 ml-2 sm:ml-6">
          <!-- username -->
          <h1 class="text-lg sm:text-2xl font-bold" v-text="author.tagname" />
          <div class="text-md sm:text-base text-gray-800 dark:text-gray-300">
            {{ t(`tag.author.type.${author.type}`)
            }}<template v-if="author.urls.length > 0">
              &dot;
              <div class="inline-flex align-middle flex-row space-x-1 flex-nowrap">
                <a
                  v-for="url in author.urls"
                  :key="url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :href="url"
                  class="inline-block text-lg"
                  :class="getIconForSite(getUrlSite(url))"
                />
              </div>
            </template>
          </div>
          <!-- bio -->
          <p class="whitespace-pre break-normal line-clamp-4" v-text="author.desc" />
        </div>
      </div>
      <div class="mt-4 ml-8">
        <PvTabs
          v-model="tab"
          :tabs="tabs"
        >
          <template #author-videos>
            <div v-if="authorVideos">
              <div class="flex flex-nowrap gap-2">
                <span>{{ author.tagname }}共发布了 {{ authorVideos.count }} 个视频</span>
                <RouterLink
                  :to="{ path: '/search-result', query: { i: author.tagname } }"
                  class="flex text-purple-600 flex-nowrap items-center gap-0.5 dark:text-white dark:border-b dark:border-gray-400"
                >
                  查看全部<span class="i-uil:external-link-alt text-lg" />
                </RouterLink>
              </div>
              <div
                class="grid mt-2 grid-cols-5 grid-flow-row gap-x-2"
              >
                <RouterLink
                  v-for="video in authorVideos.videos"
                  :key="video.id.toHexString()"
                  :to="`/video/${video.id.toHexString()}`"
                  class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-100"
                >
                  <Cover
                    :title="video.item.title"
                    :cover-image="video.item.coverImage"
                    class="rounded-md border border-gray-200 dark:border-gray-800"
                  />
                  <a
                    class="w-full text-sm overflow-hidden line-clamp-2 overflow-ellipsis"
                    v-text="video.item.title"
                  />
                  <div class="w-full text-xs truncate text-gray-600 dark:text-gray-300 font-light">
                    <Suspense><RelativeDate :date="video.meta.createdAt" /></Suspense>&nbsp;
                  </div>
                </RouterLink>
              </div>
            </div>
          </template>
        </PvTabs>
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import UserAvatar from '@/user/components/UserAvatar.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import Cover from '@/video/components/Cover.vue'
import { screenSizes } from '@/css'
import { startProgress, stopProgress } from '@/nprogress'
import PvTabs from '@/ui/components/PvTabs.vue'

const { t } = useI18n()
const route = useRoute()

const tid = computed(() => Number(route.params.tid as string))
const { result, loading } = useQuery<Query>(
  gql`
    query ($tid: Int!) {
      getAuthor(para: { tagid: $tid }) {
        tagname
        type
        desc
        avatar
        urls
        commonTags {
          id
          languages {
            lang
            value
          }
        }
      }
    }
  `,
  {
    tid,
  },
)

watchEffect(() => {
  if (loading.value)
    startProgress()
  else
    stopProgress()
})

// basic info
const author = useResult(result, null, data => data?.getAuthor)
// change title
watchEffect(() => {
  if (author.value)
    setSiteTitle(t('tag.author.title', { tagname: author.value.tagname }))
})

const getUrlSite = (url: string): string => {
  const urlo = new URL(url)
  if (urlo.hostname.endsWith('bilibili.com'))
    return 'bilibili'
  if (urlo.hostname.endsWith('youtube.com'))
    return 'youtube'
  // TODO find a niconico icon (real hard)
  // if (urlo.hostname.endsWith('nicovideo.jp')) return 'nicovideo'
  if (urlo.hostname.endsWith('twitter.com'))
    return 'twitter'
  return 'other'
}
const getIconForSite = (site: string): string => {
  switch (site) {
    case 'bilibili':
      return 'i-ri:bilibili-line'
    case 'youtube':
      return 'i-uil:youtube-alt'
    case 'twitter':
      return 'i-uil:twitter-alt'
    default:
      return 'i-uil:link-alt'
  }
}

const isHoveringAvatar = ref(false)

const tabs = [
  { name: 'author-videos', label: '发布的视频' },
]
const tab = ref<typeof tabs[number]['name']>('author-videos')

// author's videos
const { result: authorVideosRes } = useQuery<Query>(
  gql`
    query ($limit: Int!, $query: String!, $order: String!) {
      listVideo(
        para: {
          offset: 0
          limit: $limit
          humanReadableTag: true
          query: $query
          order: $order
          qtype: "tag"
        }
      ) {
        count
        videos {
          id
          item {
            title
            coverImage
          }
          meta {
            createdAt
          }
        }
      }
    }
  `,
  {
    limit: 20,
    query: computed(() => author.value?.tagname),
    order: 'last_modified',
  },
  () => ({
    enabled: !!author.value?.tagname,
  }),
)

const authorVideos = useResult(authorVideosRes, null, data => data?.listVideo)
</script>
