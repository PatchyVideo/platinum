<template>
  <LayoutDefault>
    <div v-if="user" class="max-w-screen-xl mx-auto">
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
              :alt="user.username"
              :image="user.image"
              :gravatar="user.gravatar"
            />
          </div>
        </div>
        <div class="mt-1 sm:mt-2 ml-2 sm:ml-6">
          <!-- username -->
          <h1 class="inline-block text-lg sm:text-2xl font-medium" v-text="user.username" />
          <RouterLink
            v-if="isMe"
            class="i-uil:edit-alt ml-1 text-2xl align-text-bottom text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 transition-colors duration-100"
            to="/settings/account"
          />
          <div class="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
            {{ t('user.profile.info.created-at', { date: user.meta.createdAt.toLocaleDateString() }) }}
          </div>
          <!-- bio -->
          <p class="whitespace-pre break-normal line-clamp-4" v-text="user.desc" />
        </div>
      </div>
      <div class="mt-4 ml-8">
        {{ t('user.profile.nothing') }}
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UserAvatar from './components/UserAvatar.vue'
import { useAuth } from '.'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { screenSizes } from '@/css'
import { startProgress, stopProgress } from '@/nprogress'

const { t } = useI18n()
const route = useRoute()
const auth = useAuth()

const uid = computed(() => route.params.uid as string)
const isMe = computed(() => uid.value === auth.uid)
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
    uid,
  },
)

// sync process bar
watchEffect(() => {
  if (loading.value)
    startProgress()
  else
    stopProgress()
})

// basic info
const user = useResult(result, null, data => data?.getUser)
// change title
watchEffect(() => {
  if (user.value)
    setSiteTitle(t('user.profile.title', { username: user.value.username }))
})

const isHoveringAvatar = ref(false)
</script>
