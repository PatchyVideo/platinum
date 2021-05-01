<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop></NavTop>
    <!-- Main Object -->
    <div class="mx-2">
      <div class="grid grid-cols-12 grid-flow-row-dense">
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 lg:text-lg" v-text="video.item.title"></h1>
            <div class="text-gray-600 dark:text-gray-300">
              {{ video.item.repostType }} <Suspense><RelativeDate :date="video.item.uploadTime" /></Suspense>
            </div>
          </div>
          <!-- Video Player -->
          <Suspense>
            <Player :item="video.item" />
          </Suspense>
          <div class="w-full border-t border-gray-300 my-2"></div>
          <div class="mx-1 md:mx-2 lg:mx-8">
            <!-- Video Tag -->
            <Tag v-for="tag in regularTags" :key="tag.id.toHexString()" :tag="tag"></Tag>
            <!-- Video Description -->
            <MarkdownBlock :text="video.item.desc" size="sm"></MarkdownBlock>
          </div>
          <div class="w-full border-t border-gray-300 my-2"></div>
          <div>
            <!-- Video Comments -->
            <div v-for="comment in comments" :key="comment.id.toHexString()" class="flex flex-row flex-nowrap py-2">
              <div class="mx-2">
                <UserAvatar
                  class="inline w-12 h-12 rounded-full object-cover"
                  :image="comment.author.image"
                  :gravatar="comment.author.gravatar"
                  :alt="comment.author.username"
                />
              </div>
              <div>
                <span class="text-sm font-medium" v-text="comment.author.username"></span
                ><Suspense
                  ><RelativeDate
                    class="text-sm font-light text-gray-600 dark:text-gray-300 ml-1.5"
                    :date="comment.createdAt" /></Suspense
                ><br />
                <MarkdownBlock class="min-h-8" :text="comment.content" size="sm" />
                <div
                  v-for="child in comment.children"
                  :key="child.id.toHexString()"
                  class="flex flex-row flex-nowrap my-1"
                >
                  <div class="mt-1 mr-2">
                    <UserAvatar
                      class="inline w-8 h-8 rounded-full object-cover"
                      :image="child.author.image"
                      :gravatar="child.author.gravatar"
                      :alt="child.author.username"
                    />
                  </div>
                  <div>
                    <span class="font-medium" v-text="child.author.username"></span
                    ><Suspense
                      ><RelativeDate
                        class="text-sm text-gray-600 dark:text-gray-300 ml-2"
                        :date="child.createdAt" /></Suspense
                    ><br />
                    <MarkdownBlock class="min-h-8" :text="child.content" size="sm" />
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
                <UserAvatar
                  class="inline w-10 lg:w-16 h-10 lg:h-16 rounded-full bg-gray-500 object-cover"
                  :image="author.avatar"
                  :gravatar="author.gravatar"
                  :alt="author.name"
                />
                <div
                  class="absolute px-0.75 -right-1.5 top-0 rounded lg:transform-gpu lg:rotate-24 bg-fuchsia-600 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
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
import Player from './components/Player.vue'
import Tag from './components/Tag.vue'
import MarkdownBlock from '@/markdown/components/MarkdownBlock.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/common/components/UserAvatar.vue'
import { reactive, defineComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { schema, useQuery, gql } from '@/graphql'
import { ObjectID } from 'bson'

export default defineComponent({
  components: {
    Player,
    MarkdownBlock,
    Footer,
    NavTop,
    RelativeDate,
    Tag,
    UserAvatar,
  },
  async setup() {
    // TODO: using script setup instead

    /* submit query */
    const route = useRoute()
    const vid = computed(() => <string>route.params.vid)
    const res = await useQuery({
      query: gql`
        query($vid: String!) {
          getVideo(para: { vid: $vid, lang: "CHS" }) {
            item {
              title
              desc
              uploadTime
              url
              repostType
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
      variables: {
        vid: vid.value,
      },
    })

    /* basic info */
    const video = reactive(res.data.getVideo)
    // change title
    document.title = video.item.title

    /* tags */
    type Authors = {
      type: 'AuthorTag' | 'User'
      position: string
      id: ObjectID
      name: string
      desc: string
      avatar: string
      gravatar?: string
    }[]
    const authors = ref<Authors>([])

    const regularTags = ref<schema.TagObject[]>([])
    video.tags.forEach((tag) => {
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
        regularTags.value.push(tag)
      }
    })
    if (video.meta.createdBy)
      authors.value.push({
        type: 'User',
        id: video.meta.createdBy.id,
        name: video.meta.createdBy.username,
        desc: video.meta.createdBy.desc,
        avatar: video.meta.createdBy.image,
        gravatar: video.meta.createdBy.gravatar || undefined,
        position: '上传者',
      })

    /* comments */
    interface Comment {
      id: ObjectID
      createdAt: Date
      content: string
      author: {
        id: ObjectID
        username: string
        image: string
        gravatar?: string
        desc: string
      }
      hidden?: boolean
      children?: Comment[]
    }
    const comments: Comment[] = []
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
              image: comment.meta.createdBy.image,
              gravatar: comment.meta.createdBy.gravatar || undefined,
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
                        image: comment.meta.createdBy.image,
                        gravatar: comment.meta.createdBy.gravatar || undefined,
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

    return {
      route,
      vid,
      video,
      authors,
      regularTags,
      comments,
    }
  },
})
</script>
