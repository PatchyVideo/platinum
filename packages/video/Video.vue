<template>
  <div class="max-w-screen-3xl mx-auto">
    <div class="w-full leading-8 align-middle p-1 border-b border-gray-200">PatchyVideo</div>
    <!-- Main Object -->
    <div class="mx-2">
      <div class="grid grid-cols-12">
        <div class="col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 text-lg" v-text="videoItem.title"></h1>
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
        <div class="col-span-3">
          <!-- Author / Uploader -->
          <div v-for="author of authors" :key="author.id.toHexString()" class="flex justify-start px-2 py-1">
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <img
                class="inline w-16 h-16 rounded-full bg-gray-500"
                :src="'https://patchyvideo.com/be/images/userphotos/' + author.avatar"
              />
              <div
                class="absolute px-0.5 -right-1.5 top-0 rounded transform rotate-24 bg-pink-400 text-sm text-white"
                v-text="author.position"
              ></div>
            </div>
            <div class="ml-3 overflow-hidden">
              {{ author.name }}<br />
              <div class="overflow-hidden whitespace-nowrap overflow-ellipsis text-sm text-gray-600">
                {{ author.desc }}
              </div>
            </div>
          </div>
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
import { ObjectID } from 'bson'

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
        meta {
          createdBy {
            id
            username
            desc
            image
          }
        }
        tags {
          ... on AuthorTagObject {
            author {
              id
              tagname
              avatar
              desc
            }
          }
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
    type Authors = {
      type: 'AuthorTag' | 'User'
      position: string
      id: ObjectID
      name: string
      desc: string
      avatar: string
    }[]
    const authors = ref<Authors>([])

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
      const video = data.getVideo
      document.title = video.item.title
      videoItem.title = video.item.title
      videoItem.desc = video.item.desc
      videoItem.repostType = video.item.repostType
      videoItem.uploadTime = video.item.uploadTime
      videoItem.url = video.item.url
      for (const tag of video.tags) {
        if (tag.__typename === 'AuthorTagObject') {
          if (tag.author)
            authors.value.push({
              type: 'AuthorTag',
              id: tag.author.id,
              name: tag.author.tagname,
              desc: tag.author.desc,
              avatar: tag.author.avatar,
              position: '作者',
            })
        }
      }
      if (video.meta.createdBy)
        authors.value.push({
          type: 'User',
          id: video.meta.createdBy.id,
          name: video.meta.createdBy.username,
          desc: video.meta.createdBy.desc,
          avatar: video.meta.createdBy.image,
          position: '上传者',
        })
      console.log(authors)
    })

    return {
      route,
      vid,
      videoItem,
      authors,
    }
  },
})
</script>

<style lang="postcss" scoped>
</style>
