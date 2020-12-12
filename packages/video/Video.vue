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
          <Player :url="videoItem.url"></Player>
          <MarkdownBlock :text="videoItem.desc"></MarkdownBlock>
        </div>
      </div>
    </div>
    <Footer :small="true"></Footer>
  </div>
</template>

<script lang="ts">
import Player from './components/Player.vue'
import MarkdownBlock from '/@/markdown/components/MarkdownBlock.vue'
import Footer from '/@/common/components/Footer.vue'
import { reactive, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { gql, useQuery } from '/@/graphql'

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

    useQuery({
      query: gql`
    {
      getVideo(para: { vid: "${vid}", lang: "CHS" }) {
        item {
          title
          desc
          uploadTime
          url
          repostType
        }
        tagByCategory(lang: "CHS") {
          key
          value
        }
      }
    }
  `,
    }).then((result) => {
      document.title = result.data.getVideo.item.title
      videoItem.title = result.data.getVideo.item.title
      videoItem.desc = result.data.getVideo.item.desc
      videoItem.repostType = result.data.getVideo.item.repostType
      videoItem.uploadTime = result.data.getVideo.item.uploadTime
      videoItem.url = result.data.getVideo.item.url
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
