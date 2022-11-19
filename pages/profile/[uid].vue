<script setup lang="ts">
import type { Query } from '@/composables/graphql'

const { t } = useI18n()
const route = useRoute()
const auth = await useAuth()

// default value of uid is admin
const uid = $computed(() => pickFirstQuery(route.params.uid) || '5d39bccc10f25ebf56fd0f62')
const isMe = $computed(() => uid === auth.uid)
const { data } = await useAsyncQuery<Query>(
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
const user = $computed(() => data.value!.getUser)

useHead({
  title: () => t('user.profile.title', { username: user.username }),
})

const hoveringAvatar = $ref(false)
</script>

<template>
  <div>
    <!-- padding for profile background -->
    <div class="w-full aspect-ratio-6/1 bg-gray-200 dark:bg-gray-600" />

    <!-- basic info -->
    <div class="flex flex-row lt-sm:mt-2 ml-4 md:ml-16">
      <div class="aspect-ratio-1/1 flex-shrink-0 flex-grow-0 sm:-mt-16">
        <div
          class="overflow-hidden border-2 border-gray-300 dark:border-gray-800 transform transition-all ease duration-300"
          :style="{
            borderRadius: hoveringAvatar
              ? '0.25rem'
              : '5rem',
          }"
          @mouseenter="() => hoveringAvatar = true"
          @mouseleave="() => hoveringAvatar = false"
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
        <h1 class="inline-block text-lg sm:text-2xl font-medium">
          {{ user.username }}
        </h1>
        <NuxtLink
          v-if="isMe"
          class="i-uil:edit-alt ml-1 text-2xl align-text-bottom text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 transition-colors duration-100"
          to="/settings/account"
        />

        <div class="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
          {{ t("user.profile.info.created-at", { date: user.meta.createdAt }) }}
        </div>

        <!-- bio -->
        <p class="whitespace-pre break-normal line-clamp-4">
          {{ user.desc }}
        </p>
      </div>
    </div>

    <div class="mt-4 ml-8">
      {{ t("user.profile.nothing") }}
    </div>
  </div>
</template>
