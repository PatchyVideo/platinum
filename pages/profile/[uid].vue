<script setup lang="ts">
import type { Query } from '@/composables/graphql'

const { t } = useI18n()
const route = useRoute()
const auth = await useAuth()

const uid = computed(() => route.params.uid as string)
const isMe = computed(() => uid.value === auth.uid)

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
    uid: uid.value,
  },
)
const user = computed(() => data.value!.getUser)

useHead({
  title: () => t('user.profile.title', { username: user.value.username }),
})
</script>

<template>
  <div class="max-w-screen-xl mx-auto">
    <!-- padding for profile background -->
    <div class="w-full aspect-ratio-6/1 bg-gray-200 dark:bg-gray-600" />

    <!-- basic info -->
    <div class="flex flex-row lt-sm:mt-2 ml-4 md:ml-16">
      <div class="aspect-ratio-1/1 flex-none sm:-mt-16">
        <div class="rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-800">
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

      <div class="mt-1 sm:mt-2 ml-2 sm:ml-6 min-w-0">
        <!-- username -->
        <h1 class="inline-block text-lg sm:text-2xl font-medium">
          {{ user.username }}
        </h1>
        <NuxtLink
          v-if="isMe"
          class="i-fluent:edit-16-regular ml-1 text-lg sm:text-2xl align-text-bottom text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 transition-colors duration-100"
          to="/settings/account"
        />

        <div class="text-xs sm:text-sm text-gray-800 dark:text-gray-300">
          <i18n-t keypath="user.profile.info.created-at">
            <template #date>
              <DateLocaleDate :date="user.meta.createdAt" />
            </template>
          </i18n-t>
        </div>

        <!-- bio -->
        <p class="mt-1 text-sm sm:text-base whitespace-pre-line break-normal line-clamp-3">
          {{ user.desc }}
        </p>
      </div>
    </div>

    <div class="mt-4 ml-8">
      {{ t('user.profile.nothing') }}
    </div>
  </div>
</template>
