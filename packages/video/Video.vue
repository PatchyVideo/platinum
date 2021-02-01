<template>
  <div class="max-w-screen-3xl mx-auto">
    <div class="w-full leading-8 align-middle p-1 border-b border-gray-200">PatchyVideo</div>
    <!-- Main Object -->
    <div class="mx-2">
      <div class="grid grid-cols-12 grid-flow-row-dense">
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 lg:text-lg" v-text="videoItem.title"></h1>
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
          <div class="w-full border-t border-gray-300 my-2"></div>
          <!-- Video Description -->
          <MarkdownBlock class="mx-1 md:mx-2 lg:mx-8" :text="videoItem.desc"></MarkdownBlock>
          <div class="w-full border-t border-gray-300 my-2"></div>
          <!-- Video Tag -->
          <div>标签</div>
        </div>
        <div class="col-span-full xl:col-span-3">
          <!-- Author / Uploader -->
          <div class="flex xl:flex-col justify-start px-1 pt-2">
            <div
              v-for="author of authors"
              :key="author.id.toHexString()"
              class="flex items-center flex-nowrap px-1 py-1 xl:w-full"
            >
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <img class="inline w-10 lg:w-16 h-10 lg:h-16 rounded-full bg-gray-500" :src="author.avatar" />
                <div
                  class="absolute px-0.5 -right-1.5 top-0 rounded lg:transform lg:rotate-24 bg-pink-400 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                  v-text="author.position"
                ></div>
              </div>
              <div class="hidden sm:block ml-3 overflow-hidden">
                {{ author.name }}<br />
                <div class="overflow-hidden whitespace-nowrap overflow-ellipsis text-sm text-gray-600">
                  {{ author.desc || '这个人太懒啦，并没有写简介' }}
                </div>
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
import { behMostMatch } from '@/locales'

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
          __typename
          ... on AuthorTagObject {
            authorRole
            author {
              id
              tagname
              avatar
              desc
            }
          }
          ... on RegularTagObject {
            id
            category
            languages {
              lang
              value
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
    type RegularTags = {
      id: ObjectID
      category: schema.Scalars['FETagCategories']
      name: string
    }[]
    const regularTags = ref<RegularTags>([])

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
              position: tag.authorRole,
            })
        } else if (tag.__typename === 'RegularTagObject') {
          regularTags.value.push({
            id: tag.id,
            category: tag.category,
            name: behMostMatch(tag.languages),
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
      console.log(authors, regularTags)
    })

    return {
      route,
      vid,
      videoItem,
      authors,
      regularTags,
    }
  },
})
</script>

<style lang="postcss" scoped>
</style>
