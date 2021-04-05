<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop></NavTop>
    <!-- Main Object -->
    <div class="mx-2">
      <div class="grid grid-cols-12 grid-flow-row-dense">
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 lg:text-lg" v-text="videoItem.title"></h1>
            <div class="text-gray-600 dark:text-gray-300">
              {{ videoItem.repostType }} <Suspense><RelativeDate :date="videoItem.uploadTime" /></Suspense>
            </div>
          </div>
          <!-- Video Player -->
          <Suspense>
            <Player />
          </Suspense>
          <div class="w-full border-t border-gray-300 my-2"></div>
          <div class="mx-1 md:mx-2 lg:mx-8">
            <!-- Video Tag -->
            <div
              v-for="tag in regularTags"
              :key="tag.id.toHexString()"
              class="inline-block tag text-sm text-white whitespace-nowrap pr-1 mr-1"
              :class="'tag-' + tag.category.toLowerCase()"
              v-text="tag.name"
            ></div>
            <!-- Video Description -->
            <MarkdownBlock :text="videoItem.desc" :sm="true"></MarkdownBlock>
          </div>
          <div class="w-full border-t border-gray-300 my-2"></div>
          <div>
            <!-- Video Comments -->
            <div v-for="comment in comments" :key="comment.id.toHexString()" class="flex flex-row flex-nowrap py-2">
              <div class="mx-2">
                <img
                  :src="comment.author.image"
                  :alt="comment.author.username + '\'s avatar'"
                  class="inline w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div>
                <span class="font-medium" v-text="comment.author.username"></span
                ><Suspense
                  ><RelativeDate
                    class="text-sm text-gray-600 dark:text-gray-300 ml-2"
                    :date="comment.createdAt" /></Suspense
                ><br />
                <MarkdownBlock class="min-h-8" :text="comment.content" :sm="true" />
                <div
                  v-for="child in comment.children"
                  :key="child.id.toHexString()"
                  class="flex flex-row flex-nowrap my-1"
                >
                  <div class="mt-1 mr-2">
                    <img
                      :src="child.author.image"
                      :alt="child.author.username + '\'s avatar'"
                      class="inline w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <span class="font-medium" v-text="child.author.username"></span
                    ><Suspense
                      ><RelativeDate
                        class="text-sm text-gray-600 dark:text-gray-300 ml-2"
                        :date="child.createdAt" /></Suspense
                    ><br />
                    <MarkdownBlock class="min-h-8" :text="child.content" :sm="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                <img
                  class="inline w-10 lg:w-16 h-10 lg:h-16 rounded-full bg-gray-500 object-cover"
                  :alt="author.name + '\'s avatar'"
                  :src="author.avatar"
                />
                <div
                  class="absolute px-0.75 -right-1.5 top-0 rounded lg:transform lg:rotate-24 bg-fuchsia-600 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                  v-text="author.position"
                ></div>
              </div>
              <div class="hidden sm:block ml-3 overflow-hidden">
                {{ author.name }}
                <br />
                <div
                  class="overflow-hidden whitespace-nowrap overflow-ellipsis text-sm text-gray-600 dark:text-gray-300"
                >
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
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import TagBorder from './TagBorder'
import { reactive, defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { gql, parseGraph, schema } from '@/graphql'
import { ObjectID } from 'bson'
import { behMostMatch } from '@/locales'
import { getUserAvatar } from '@/common/lib/imageUrl'

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
            gravatar
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
        commentThread {
          id
          count
          comments {
            id
            content
            meta {
              createdAt
              createdBy {
                id
                username
                image
                gravatar
                desc
              }
            }
            children {
              id
              content
              meta {
                createdAt
                createdBy {
                  id
                  username
                  image
                  gravatar
                  desc
                }
              }
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
    NavTop,
    RelativeDate,
  },
  setup() {
    /* submit query */
    const route = useRoute()
    const vid = route.params.vid as string
    gvid.value = vid
    graph.ready()

    /* basic info */
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
    graph.onFragmentData<schema.Query>('default', (data) => {
      const video = data.getVideo

      videoItem.title = video.item.title
      videoItem.desc = video.item.desc
      videoItem.repostType = video.item.repostType
      videoItem.uploadTime = video.item.uploadTime
      videoItem.url = video.item.url

      // change title
      document.title = video.item.title
    })

    /* tags */
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

    graph.onFragmentData<schema.Query>('default', (data) => {
      const video = data.getVideo
      video.tags.forEach((tag) => {
        if (tag.__typename === 'AuthorTagObject') {
          if (tag.author)
            authors.value.push({
              type: 'AuthorTag',
              id: tag.author.id,
              name: tag.author.tagname,
              desc: tag.author.desc,
              avatar: getUserAvatar({
                image: tag.author.avatar,
              }),
              position: tag.authorRole,
            })
        } else if (tag.__typename === 'RegularTagObject') {
          regularTags.value.push({
            id: tag.id,
            category: tag.category,
            name: behMostMatch(tag.languages),
          })
        }
      })
      if (video.meta.createdBy)
        authors.value.push({
          type: 'User',
          id: video.meta.createdBy.id,
          name: video.meta.createdBy.username,
          desc: video.meta.createdBy.desc,
          avatar: getUserAvatar(video.meta.createdBy),
          position: '上传者',
        })
    })

    const tagColors = {
      copyright: '#a0a',
      language: '#585455',
      character: '#0a0',
      author: '#a00',
      general: '#0073ff',
      meta: '#f80',
      soundtrack: '#ff7792',
    }
    const tagBorder = reactive(
      Object.fromEntries(
        Object.entries(tagColors).map(([key, value]) => {
          return [key, ref('url("data:image/svg+xml;base64, ' + btoa(TagBorder.replaceAll('#333', value)) + '")')]
        })
      )
    )

    /* comments */
    interface Comment {
      id: ObjectID
      createdAt: Date
      content: string
      author: {
        id: ObjectID
        username: string
        image: string
        desc: string
      }
      hidden?: boolean
      children?: Comment[]
    }
    const comments: Comment[] = []

    graph.onFragmentData<schema.Query>('default', (data) => {
      const video = data.getVideo
      if (video.commentThread?.comments) {
        video.commentThread.comments.forEach((comment) => {
          if (comment.content && comment.meta.createdBy && !comment.deleted)
            comments.push({
              id: comment.id,
              createdAt: comment.meta.createdAt,
              content: comment.content,
              author: {
                id: comment.meta.createdBy.id,
                username: comment.meta.createdBy.username,
                image: getUserAvatar(comment.meta.createdBy),
                desc: comment.meta.createdBy.desc,
              },
              hidden: comment.hidden,
              children: (() => {
                const children: Comment[] = []

                if (comment.children)
                  comment.children.forEach((comment) => {
                    if (comment.content && comment.meta.createdBy)
                      children.push({
                        id: comment.id,
                        createdAt: comment.meta.createdAt,
                        content: comment.content,
                        author: {
                          id: comment.meta.createdBy.id,
                          username: comment.meta.createdBy.username,
                          image: getUserAvatar(comment.meta.createdBy),
                          desc: comment.meta.createdBy.desc,
                        },
                        hidden: comment.hidden,
                      })
                  })

                return children
              })(),
            })
        })
      }
    })

    return {
      route,
      vid,
      videoItem,
      authors,
      regularTags,
      tagBorder,
      comments,
    }
  },
})
</script>

<style lang="postcss" scoped>
.tag {
  border-width: 2px 2px 2px 15px;
  border-image-source: v-bind('tagBorder.general');
  border-image-slice: 8 8 8 40 fill;
}
.tag-copyright {
  border-image-source: v-bind('tagBorder.copyright');
}
.tag-language {
  border-image-source: v-bind('tagBorder.language');
}
.tag-character {
  border-image-source: v-bind('tagBorder.character');
}
/* .tag-author {
  border-image-source: v-bind('tagBorder.author');
} */
/* .tag-general {
  border-image-source: v-bind('tagBorder.general');
} */
.tag-meta {
  border-image-source: v-bind('tagBorder.meta');
}
.tag-soundtrack {
  border-image-source: v-bind('tagBorder.soundtrack');
}
</style>
