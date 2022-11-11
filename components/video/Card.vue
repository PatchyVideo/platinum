<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  video: schema.Video
}>()
const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const { t } = useI18n()
const { getToken } = useApollo()
const auth = await useAuth()

let hideVideoLoading = $ref(false)
const hideVideo = async () => {
  hideVideoLoading = true

  const res = await $fetch<{
    status: 'SUCCEED' | 'FAILED' | 'ERROR'
  }>('https://patchyvideo.com/be/videos/condemn_video.do', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
    body: {
      vid: props.video.id,
    },
    onRequestError: () => {
      // TODO: Handle error
    },
  })

  if (res.status === 'SUCCEED') {
    // TODO
  }
  else {
    // TODO
  }

  emit('refresh')

  hideVideoLoading = false
}
</script>

<template>
  <div class="relative">
    <NuxtLink :to="`/video/${video.id}`" class="rounded-md">
      <div class="relative">
        <VideoCover
          :title="video.item.title"
          :cover-image="video.item.coverImage"
          class="rounded-md border border-gray-200 dark:border-gray-800"
        />

        <div
          v-if="video.clearence === 0"
          class="absolute flex flex-col justify-center items-center inset-0 bg-gray-200 bg-opacity-60 hover:opacity-10 hover:bg-opacity-10 transition-all"
        >
          <div class="i-fluent:eye-off-20-regular text-6xl" />
          <div class="text-2xl">
            {{ t('search.search-result.video.video.hidden') }}
          </div>
        </div>
      </div>

      <div class="flex justify-between items-end">
        <div>
          <div class="h-12 overflow-hidden line-clamp-2 overflow-ellipsis">
            {{ video.item.title }}
          </div>
          <div class="text-sm truncate text-gray-600 dark:text-gray-300 font-light">
            <DateRelative :date="video.meta.createdAt" />&nbsp;
          </div>
        </div>

        <div class="flex-none w-7 h-9" />
      </div>
    </NuxtLink>

    <div class="absolute bottom-0 right-0">
      <PPopoverDown class="ml-1 my-1 -mr-1">
        <template #button>
          <div class="p-1 text-sm rounded-full text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 transition-color duration-75">
            <div class="i-uil:ellipsis-v w-5 h-5" />
          </div>
        </template>

        <div class="flex flex-col">
          <a
            class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
            target="_blank"
            rel="noreferrer noopener"
            :href="video.item.url"
          >
            <div class="i-uil:external-link-alt text-lg" />
            打开源站
          </a>

          <template v-if="auth.isAdmin">
            <div class="w-full border-b-1 border-purple-300 dark:border-gray-600" />

            <button
              class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
              @click="hideVideo"
            >
              <div class="i-uil:eye-slash text-lg" />
              {{ t('video.video.edit.hide-video.title') }}
              <div
                v-show="hideVideoLoading"
                class="i-uil:spinner-alt text-lg animate-spin"
              />
            </button>
          </template>
        </div>
      </PPopoverDown>
    </div>
  </div>
</template>
