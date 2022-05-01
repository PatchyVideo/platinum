<template>
  <div v-if="video" class="absolute top-0 bottom-0 left-0 right-0">
    <!-- Video Player -->
    <Suspense>
      <Player :item="video.item" :full-height="true" :disable-fullscreen="true" />
    </Suspense>
  </div>
</template>

<script lang="ts" setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import Player from './components/Player.vue'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'

/* submit query */
const route = useRoute()
const vid = computed(() => route.params.vid as string)
const { result } = useQuery<Query>(
  gql`
    query ($vid: String!) {
      getVideo(para: { vid: $vid, lang: "CHS" }) {
        item {
          title
          url
          site
        }
      }
    }
  `,
  {
    vid: vid.value,
  },
)

/* basic info */
const video = useResult(result, null, data => data?.getVideo)
// change title
watchEffect(() => {
  if (video.value)
    setSiteTitle(video.value.item.title)
})
</script>
