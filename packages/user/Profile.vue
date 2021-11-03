<template>
  <LayoutDefault>
    <div v-if="user" class="max-w-screen-xl mx-auto">
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
            :alt="user.username"
            :image="user.image"
            :gravatar="user.gravatar"
          />
        </div>
        <div class="mt-1 sm:mt-2 ml-2 sm:ml-6">
          <!-- username -->
          <h1 class="text-lg sm:text-2xl font-bold" v-text="user.username"></h1>
          <div class="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
            {{ t('user.profile.info.created-at', { date: user.meta.createdAt.toLocaleDateString() }) }}
          </div>
          <!-- bio -->
          <p class="whitespace-pre break-normal line-clamp-4" v-text="user.desc"></p>
        </div>
      </div>
      <div class="mt-4 ml-8">这里还什么都没有哦……</div>
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
import UserAvatar from './components/UserAvatar.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const uid = computed(() => route.params.uid as string)
const { result, loading } = useQuery<Query>(
  gql`
    query ($uid: String!) {
      getUser(para: { uid: $uid }) {
        id
        username
        desc
        image
        gravatar
        meta {
          createdAt
        }
      }
    }
  `,
  {
    uid: uid.value,
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
const user = useResult(result, null, (data) => data?.getUser)
// change title
watchEffect(() => {
  if (user.value) setSiteTitle(t('user.profile.title', { username: user.value.username }))
})
</script>
