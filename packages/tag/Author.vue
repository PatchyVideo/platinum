<template>
  <LayoutDefault>
    <div v-if="author" class="max-w-screen-xl mx-auto">
      <!-- padding for profile background -->
      <div class="w-full h-24 sm:h-32 md::h-40 bg-gray-200 dark:bg-gray-600"></div>
      <!-- basic info -->
      <div class="flex flex-row ltsm:mt-2 ml-4 md:ml-16">
        <div
          class="
            sm:-mt-16
            flex-shrink-0 flex-grow-0
            rounded-full
            hover:rounded-none
            border-2 border-gray-300
            dark:border-gray-600
            transform-gpu
            transition-all
            duration-300
          "
        >
          <UserAvatar
            class="
              w-20
              h-20
              md:w-56 md:h-56
              flex-shrink-0 flex-grow-0
              rounded-full
              hover:rounded-none
              transform-gpu
              transition-all
              duration-300
            "
            openable
            :alt="author.tagname"
            :image="author.avatar"
          />
        </div>
        <div class="mt-1 sm:mt-2 ml-2 sm:ml-6">
          <!-- username -->
          <h1 class="text-lg sm:text-2xl font-bold" v-text="author.tagname"></h1>
          <div class="text-md sm:text-base text-gray-800 dark:text-gray-300">
            {{ t('tag.author.type.' + author.type)
            }}<template v-if="author.urls.length > 0">
              &dot;
              <div class="inline-flex flex-row space-x-1 flex-nowrap">
                <template v-for="url in author.urls" :key="url"
                  ><a target="_blank" rel="noopener noreferrer" :href="url"
                    ><IconRiBilibiliLine v-if="getUrlSite(url) === 'bilibili'" class="inline-block" /><IconUilYoutubeAlt
                      v-else-if="getUrlSite(url) === 'youtube'"
                      class="inline-block" /><IconUilTwitterAlt
                      v-else-if="getUrlSite(url) === 'twitter'"
                      class="inline-block" /><IconUilLinkAlt v-else class="inline-block" /></a
                ></template></div
            ></template>
          </div>
          <!-- bio -->
          <p class="whitespace-pre break-normal line-clamp-4" v-text="author.desc"></p>
        </div>
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import NProgress from 'nprogress'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import UserAvatar from '@/user/components/UserAvatar.vue'
import { useI18n } from 'vue-i18n'

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
    tid: tid.value,
  }
)

/* sync process bar */
watchEffect(() => {
  if (loading.value) {
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    if (NProgress.isStarted()) NProgress.done()
  }
})

/* basic info */
const author = useResult(result, null, (data) => data?.getAuthor)
// change title
watchEffect(() => {
  if (author.value) setSiteTitle(t('tag.author.title', { tagname: author.value.tagname }))
})

const getUrlSite = (url: string): string => {
  const urlo = new URL(url)
  if (urlo.hostname.endsWith('bilibili.com')) return 'bilibili'
  if (urlo.hostname.endsWith('youtube.com')) return 'youtube'
  // TODO find a niconico icon (real hard)
  // if (urlo.hostname.endsWith('nicovideo.jp')) return 'nicovideo'
  if (urlo.hostname.endsWith('twitter.com')) return 'twitter'
  return 'other'
}
</script>
