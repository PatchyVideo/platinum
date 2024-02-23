<!-- Drop-down menu for video card -->
<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = withDefaults(defineProps<{
  video: schema.Video
  opType?: 'normal' | 'video' | 'playlist' | 'playlistEditor'
  isAdmin: Boolean
}>(),
{
  opType: 'normal',
})
const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const { t } = useI18n()
const { getToken } = useApollo()

const hideVideoLoading = ref(false)
async function hideVideo() {
  hideVideoLoading.value = true

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

  hideVideoLoading.value = false
}
</script>

<template>
  <PPopoverDown>
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

      <template v-if="props.isAdmin && opType !== 'playlist'">
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
</template>
