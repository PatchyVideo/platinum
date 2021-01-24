<template>
  <div class="max-w-screen-3xl mx-auto">
    <div class="w-full leading-8 align-middle p-1 border-b border-gray-200">PatchyVideo</div>
    <!-- Main Object -->
    <div class="mx-2">
      <div class="grid grid-cols-12">
        <div class="col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1" v-text="videoItem.title"></h1>
            <div class="text-sm text-gray-500">
              {{ videoItem.repostType }} {{ videoItem.uploadTime.toLocaleString() }}
            </div>
          </div>
          <!-- Video Player -->
          <suspense>
            <template #default>
              <Player />
            </template>
            <template #fallback>
              <div>Player loading...</div>
            </template>
          </suspense>
          <MarkdownBlock :text="videoItem.desc"></MarkdownBlock>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import Player, { graph as playerGraph } from './components/Player.vue'
import MarkdownBlock from '@/markdown/components/MarkdownBlock.vue'
import Footer from '@/common/components/Footer.vue'
import { reactive, defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { gql, parseGraph, schema } from '@/graphql'

const gvid = ref('')

export const graph = parseGraph({
  graphRaw: gql`
    # @import player from 'player'

    fragment default on Query @export @vari(vid: String) {
      getVideo(para: { vid: $vid, lang: "CHS" }) {
        item {
          title
          desc
          uploadTime
          url
          repostType
          ...player
        }
        tagByCategory(lang: "CHS") {
          key
          value
        }
      }
    }
  `,
  children: {
    player: playerGraph,
  },
  variables: {
    vid: gvid,
  },
  isReady: ref(false),
})

export default defineComponent({
  components: {
    Player,
    MarkdownBlock,
    Footer,
  },
  setup() {
    const route = useRoute()
    const vid = route.params.vid as string

    const videoItem: {
      title: string
      desc: string
      repostType: string
      uploadTime: Date
      url: string
    } = reactive({
      title: '',
      desc: '',
      repostType: '',
      uploadTime: new Date(),
      url: '',
    })

    gvid.value = vid
    graph.ready()

    graph.onFragmentData<schema.Query>('default', (data) => {
      document.title = data.getVideo.item.title
      videoItem.title = data.getVideo.item.title
      videoItem.desc = data.getVideo.item.desc
      videoItem.repostType = data.getVideo.item.repostType
      videoItem.uploadTime = data.getVideo.item.uploadTime
      videoItem.url = data.getVideo.item.url
    })

    return {
      route,
      vid,
      videoItem,
    }
  },
})
</script>

<style lang="postcss" scoped>
</style>
