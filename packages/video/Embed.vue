<template>
  <div v-if="video" class="absolute top-0 bottom-0 left-0 right-0">
    <!-- Video Player -->
    <Suspense>
      <Player :item="video.item" :full-height="true" :disable-fullscreen="true" />
    </Suspense>
  </div>
</template>

<script lang="ts">
import Player from './components/Player.vue'
import { defineComponent, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, gql, useResult, Query } from '@/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'

export default defineComponent({
  components: {
    Player,
  },
  setup() {
    /* submit query */
    const route = useRoute()
    const vid = computed(() => <string>route.params.vid)
    const { result } = useQuery<Query>(
      gql`
        query ($vid: String!) {
          getVideo(para: { vid: $vid, lang: "CHS" }) {
            item {
              title
              url
            }
          }
        }
      `,
      {
        vid: vid.value,
      }
    )

    /* basic info */
    const video = useResult(result, null, (data) => data.getVideo)
    // change title
    watchEffect(() => {
      if (video.value) setSiteTitle(video.value.item.title)
    })

    return {
      route,
      vid,
      video,
    }
  },
})
</script>
