<template>
  <div class="absolute top-0 bottom-0 left-0 right-0">
    <!-- Video Player -->
    <Suspense>
      <Player :item="video.item" :full-width="true" />
    </Suspense>
  </div>
</template>

<script lang="ts">
import Player from './components/Player.vue'
import { reactive, defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, gql } from '@/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'

export default defineComponent({
  components: {
    Player,
  },
  async setup() {
    /* submit query */
    const route = useRoute()
    const vid = computed(() => <string>route.params.vid)
    const res = await useQuery({
      query: gql`
        query ($vid: String!) {
          getVideo(para: { vid: $vid, lang: "CHS" }) {
            item {
              title
              url
            }
          }
        }
      `,
      variables: {
        vid: vid.value,
      },
    })

    /* basic info */
    const video = reactive(res.data.getVideo)
    // change title
    setSiteTitle(video.item.title)

    return {
      route,
      vid,
      video,
    }
  },
})
</script>
