<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop></NavTop>
    <!-- Main Object -->
    <div v-if="video" class="xl:mx-2">
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
          <div class="<xl:hidden w-full border-t border-gray-300 my-2"></div>
          <div ref="mobilePlaylistTarget"></div>
          <div ref="mobileAuthorTarget"></div>
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
                  class="inline w-8 md:w-12 h-8 md:h-12 rounded-full object-cover"
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
          <Teleport :to="mobileAuthorTarget" :disabled="!mobileAuthorTarget || screenSizes.xl">
            <div class="flex xl:flex-col justify-start px-1 xl:pt-4">
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
                    class="
                      absolute
                      px-0.75
                      -right-1.5
                      top-0
                      rounded
                      lg:transform-gpu lg:rotate-24
                      bg-fuchsia-600
                      text-xs
                      lg:text-sm
                      text-white
                      whitespace-nowrap
                      overflow-hidden
                    "
                    v-text="author.position"
                  ></div>
                </div>
                <div class="hidden sm:block ml-3 overflow-hidden">
                  {{ author.name }}
                  <br />
                  <div
                    class="overflow-hidden whitespace-nowrap overflow-ellipsis text-sm text-gray-600 dark:text-gray-300"
                  >
                    {{ author.desc || t('video.video.no-desc') }}
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
          <Teleport :to="mobilePlaylistTarget" :disabled="!mobilePlaylistTarget || screenSizes.xl">
            <div
              v-if="playlist"
              class="
                xl:mx-2
                border-gray-300
                dark:border-gray-600
                border-b
                xl:border-1 xl:rounded-md xl:mt-2
                flex flex-col
                max-h-125
              "
            >
              <div class="mx-2 my-1 flex justify-between">
                <div>
                  <RouterLink class="" :to="'/playlist/' + pid"
                    ><icon-uil-list-ui-alt
                      class="inline-block mr-1 align-middle text-sm text-gray-700 dark:text-gray-100"
                    />{{ playlist.item.title }}</RouterLink
                  >
                  <div class="text-sm text-gray-800 dark:text-gray-200">
                    {{ playlist.meta.createdBy ? playlist.meta.createdBy.username + ' - ' : ''
                    }}{{ playlistIndex + ' / ' + playlist.item.count }}
                  </div>
                </div>
                <div class="flex flex-col justify-around">
                  <icon-uil-angle-up
                    class="text-xl transform transition-transform duration-300 select-none cursor-pointer"
                    :class="{ 'rotate-180': playlistCollaped }"
                    @click="playlistCollaped = !playlistCollaped"
                  />
                </div>
              </div>
              <div
                v-show="!playlistCollaped"
                class="
                  h-full
                  overflow-y-auto
                  scrollbar-thin scrollbar-thumb-gray-500
                  hover:scrollbar-thumb-gray-300
                  scrollbar-thumb-rounded-full
                "
              >
                <RouterLink
                  v-for="(plVideo, plIndex) in playlistVideos"
                  :key="plVideo.video.id.toHexString()"
                  class="flex justify-start space-x-1 py-1 hover:bg-pink-50 dark:hover:bg-gray-800"
                  :class="{ 'bg-pink-50 dark:bg-gray-800': plVideo.video.id.toHexString() === vid }"
                  :to="'/video/' + plVideo.video.id + '?list=' + pid"
                >
                  <div
                    class="
                      flex flex-col flex-shrink-0 flex-grow-0
                      justify-around
                      text-xs
                      w-4
                      self-center
                      text-center
                      overflow-hidden
                    "
                  >
                    <template v-if="plIndex + 1 === playlistIndex"><icon-uil-play /></template
                    ><template v-else>{{ plVideo.rank + 1 }}</template>
                  </div>
                  <div class="flex-shrink-0 flex-grow-0 w-24">
                    <div class="aspect-5/8">
                      <img
                        class="inline-block"
                        width="96"
                        height="54"
                        :src="getCoverImage({ image: plVideo.video.item.coverImage })"
                      />
                    </div>
                  </div>
                  <div class="flex flex-col justify-between">
                    <h2 class="text-sm line-clamp-2" v-text="plVideo.video.item.title"></h2>
                    <div
                      v-if="plVideo.video.meta.createdBy"
                      class="text-xs text-gray-800 dark:text-gray-200"
                      v-text="plVideo.video.meta.createdBy.username"
                    ></div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </div>
    <div v-else class="mx-2">
      <div class="grid grid-cols-12 grid-flow-row-dense">
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 lg:text-lg w-4/5 rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse">&nbsp;</h1>
            <div
              class="mt-1 text-gray-600 dark:text-gray-300 w-2/5 rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse"
            >
              &nbsp;
            </div>
          </div>
          <!-- Video Player -->
          <div class="w-full mt-1">
            <div class="aspect-9/16">
              <div class="w-full h-full bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div class="col-span-full xl:col-span-3">
          <!-- Author / Uploader -->
          <div class="flex xl:flex-col justify-start px-1 xl:pt-4">
            <div class="flex items-center flex-nowrap px-1 py-1 xl:w-full">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div
                  class="inline-block w-10 lg:w-16 h-10 lg:h-16 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse"
                >
                  &nbsp;
                </div>
              </div>
              <div class="hidden sm:block w-full ml-3 overflow-hidden">
                <div class="inline-block w-4/5 rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse">&nbsp;</div>
                <br />
                <div
                  class="
                    inline-block
                    overflow-hidden
                    whitespace-nowrap
                    overflow-ellipsis
                    text-sm
                    w-2/5
                    mt-1
                    rounded-md
                    bg-gray-400
                    dark:bg-gray-600
                    animate-pulse
                  "
                >
                  &nbsp;
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

<script lang="ts" setup>
import Player from './components/Player.vue'
import Tag from './components/Tag.vue'
import MarkdownBlock from '@/markdown/components/MarkdownBlock.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type ObjectID from 'bson-objectid'
import NProgress from 'nprogress'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { screenSizes } from '@/tailwindcss'
import { getCoverImage } from '@/common/lib/imageUrl'

const { t } = useI18n()

/* submit query */
const route = useRoute()
const vid = computed(() => route.params.vid as string)
const pid = computed(() => (Array.isArray(route.query.list) ? route.query.list[0] : route.query.list))
const { result, loading } = useQuery<Query>(
  gql`
    query ($vid: String!, $fetchPlaylist: Boolean!, $pid: String = "") {
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
      listAdjacentVideos(para: { pid: $pid, vid: $vid, k: 200 }) @include(if: $fetchPlaylist) {
        video {
          id
          item {
            title
            coverImage
          }
          meta {
            createdBy {
              username
            }
          }
        }
        rank
      }
      getPlaylist(para: { pid: $pid }) @include(if: $fetchPlaylist) {
        item {
          title
          count
        }
        meta {
          createdBy {
            username
          }
        }
      }
    }
  `,
  {
    vid: vid.value,
    fetchPlaylist: !!pid.value,
    pid: pid.value,
  }
)

/* sync process bar */
watchEffect(() => {
  if (loading.value) {
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    if (NProgress.isStarted()) NProgress.done()
  }
})

/* basic info */
const video = useResult(result, null, (data) => data.getVideo)
// change title
watchEffect(() => {
  if (video.value) setSiteTitle(video.value.item.title)
})

/* tags */
type Author = {
  type: 'AuthorTag' | 'User'
  position: string
  id: ObjectID
  name: string
  desc: string
  avatar: string
  gravatar?: string
}
const authors = computed(() =>
  video.value
    ? ((video.value.tags.filter((v) => v.__typename === 'AuthorTagObject') as schema.AuthorTagObject[])
        .map(
          (tag) =>
            tag.author &&
            ({
              type: 'AuthorTag',
              id: tag.author.id,
              name: tag.author.tagname,
              desc: tag.author.desc,
              avatar: tag.author.avatar,
              position: tag.authorRole,
            } as Author)
        )
        .concat([
          video.value.meta.createdBy && {
            type: 'User',
            id: video.value.meta.createdBy.id,
            name: video.value.meta.createdBy.username,
            desc: video.value.meta.createdBy.desc,
            avatar: video.value.meta.createdBy.image,
            gravatar: video.value.meta.createdBy.gravatar || undefined,
            position: t('video.video.uploader'),
          },
        ])
        .filter((v) => !!v) as Author[])
    : []
)

const regularTags = computed(() =>
  video.value ? (video.value.tags.filter((v) => v.__typename === 'RegularTagObject') as schema.RegularTagObject[]) : []
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
    gravatar?: string
    desc: string
  }
  hidden?: boolean
  children?: Comment[]
}
const comments = computed(() =>
  video.value?.commentThread?.comments
    ? (video.value.commentThread.comments
        .map(
          (comment) =>
            comment.content &&
            comment.meta.createdBy &&
            !comment.deleted && {
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
            }
        )
        .filter((v) => !!v) as Comment[])
    : []
)

const mobileAuthorTarget = ref<HTMLDivElement | null>(null)
const mobilePlaylistTarget = ref<HTMLDivElement | null>(null)

const playlist = useResult(result, null, (data) => data.getPlaylist)
const playlistVideos = useResult(result, null, (data) => data.listAdjacentVideos)
const playlistIndex = computed(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  () =>
    video.value && playlistVideos.value
      ? (playlistVideos.value.find((v) => v.video.id.toHexString() === vid.value)?.rank ?? -2) + 1
      : -1
)
const playlistCollaped = ref(!screenSizes.xl)
</script>
