<template>
  <LayoutDefault>
    <!-- Main Object -->
    <div v-if="video" class="xl:mx-2">
      <div class="grid grid-cols-12 space-x-2 grid-flow-row-dense">
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 lg:text-lg" v-text="video.item.title"></h1>
            <div class="text-gray-600 dark:text-gray-300">
              {{ t(`video.video.repost-type.${video.item.repostType}`, video.item.repostType)
              }}<span v-if="clearence !== 3" class="ml-2" v-text="t('video.video.ranks.' + clearence)"></span
              ><Suspense><RelativeDate class="ml-2" :date="video.item.uploadTime" /></Suspense
              ><template v-if="user.isAdmin"
                ><span :title="t('video.video.edit.hide-video.title')"
                  ><div
                    v-if="isLogin === IsLogin.yes"
                    class="i-uil-eye-slash inline-block ml-2 text-lg cursor-pointer select-none"
                    @click="hideVideo"
                  ></div></span
                ><span v-if="hideVideoResult" v-text="hideVideoResult"></span></template
              ><span :title="t('video.video.edit.edit-video')"
                ><div
                  v-if="isLogin === IsLogin.yes"
                  class="i-uil-pen inline-block ml-2 text-lg cursor-pointer select-none"
                  @click="popEditVideoWindow"
                ></div
              ></span>
            </div>
          </div>
          <!-- Video Player -->
          <Suspense>
            <Player :item="video.item" />
          </Suspense>
          <!-- <div class="ltxl:hidden w-full border-t border-gray-300 my-2"></div> -->
          <div class="my-1"></div>
          <div ref="mobilePlaylistTarget"></div>
          <div ref="mobileAuthorTarget"></div>
          <div class="mx-1 md:mx-2 lg:mx-4">
            <!-- Video Tag -->
            <span v-if="isLogin === IsLogin.yes" :title="t('video.video.edit.edit-tags')"
              ><div
                class="i-uil-tag-alt inline-block text-2xl mr-1 align-middle text-gray-600 dark:text-gray-300 cursor-pointer"
                @click="popEditTagWindow"
              ></div
            ></span>
            <div
              v-else
              class="i-uil-tag-alt inline-block text-2xl mr-1 align-middle text-gray-600 dark:text-gray-300"
            ></div>
            <template v-if="!renderTagAsPlainText"
              ><Tag v-for="tag in regularTags" :key="tag.id.toHexString()" :tag="tag"></Tag
            ></template>
            <template v-else>
              <div class="text-sm">
                <span v-for="tag in regularTags" :key="tag.id.toHexString()" class="mr-2 text-blue-600"
                  >#{{ behMostMatch(tag.languages) }}</span
                >
              </div></template
            >
            <!-- Video Description -->
            <MarkdownBlock :text="video.item.desc" size="sm"></MarkdownBlock>
          </div>
          <div class="w-full border-t border-gray-300 my-2"></div>
          <div>
            <!-- Video Comments -->
            <div v-for="comment in comments" :key="comment.id.toHexString()" class="py-2">
              <div class="flex flex-row flex-nowrap">
                <div class="flex-none mx-2">
                  <RouterLink :to="'/user/' + comment.meta.createdBy.id.toHexString()">
                    <UserAvatarPopper :uid="comment.meta.createdBy.id.toHexString()"
                      ><UserAvatar
                        class="inline-block w-8 md:w-12 h-8 md:h-12 rounded-full object-cover"
                        :image="comment.meta.createdBy.image"
                        :gravatar="comment.meta.createdBy.gravatar"
                        :alt="comment.meta.createdBy.username"
                        hide-title
                    /></UserAvatarPopper>
                  </RouterLink>
                  <div
                    v-if="comment.children?.length ?? 0 > 0"
                    class="w-px h-[calc(100%-2rem)] mt-1 mx-auto bg-gray-400"
                  ></div>
                </div>
                <div>
                  <div>
                    <RouterLink :to="'/user/' + comment.meta.createdBy.id.toHexString()"
                      ><span class="text-sm font-medium" v-text="comment.meta.createdBy.username"></span></RouterLink
                    ><span class="text-xs text-gray-500 dark:text-gray-400"
                      ><Suspense><RelativeDate class="ml-1.5" :date="comment.meta.createdAt" /></Suspense
                      ><span v-if="comment.edited" class="ml-1.5">edited</span></span
                    >
                  </div>
                  <MarkdownBlock class="min-h-6" :text="comment.content" size="md" />
                </div>
              </div>
              <div
                v-for="(child, cindex) in comment.children"
                :key="child.id.toHexString()"
                class="flex flex-row flex-nowrap"
              >
                <div class="flex-none w-10 md:w-14">
                  <div class="flex flex-row w-full h-full ml-6 md:ml-8">
                    <div v-if="cindex !== comment.children!.length! - 1" class="w-px h-full bg-gray-400"></div>
                    <div v-else class="w-px h-5 bg-gray-400"></div>
                    <div class="mt-5 w-3 md:w-5 h-px bg-gray-400"></div>
                  </div>
                </div>
                <div class="flex-none mt-1 mr-2">
                  <RouterLink :to="'/user/' + child.meta.createdBy.id.toHexString()">
                    <UserAvatarPopper :uid="child.meta.createdBy.id.toHexString()"
                      ><UserAvatar
                        class="inline-block w-8 h-8 rounded-full object-cover"
                        :image="child.meta.createdBy.image"
                        :gravatar="child.meta.createdBy.gravatar"
                        :alt="child.meta.createdBy.username"
                        hide-title
                    /></UserAvatarPopper>
                  </RouterLink>
                </div>
                <div class="flex flex-col">
                  <div>
                    <RouterLink :to="'/user/' + child.meta.createdBy.id.toHexString()"
                      ><span class="text-sm font-medium" v-text="child.meta.createdBy.username"></span></RouterLink
                    ><Suspense
                      ><RelativeDate class="text-xs text-gray-500 dark:text-gray-400 ml-2" :date="child.meta.createdAt"
                    /></Suspense>
                  </div>
                  <MarkdownBlock class="min-h-8" :text="child.content" size="sm" />
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
                <div class="flex-shrink-0">
                  <RouterLink v-if="author.type === 'User'" :to="'/user/' + author.id.toHexString()"
                    ><UserAvatarPopper :uid="author.id.toHexString()"
                      ><UserAvatar
                        class="inline-block w-10 lg:w-14 h-10 lg:h-14 rounded-full bg-gray-500 object-cover"
                        :image="author.avatar"
                        :gravatar="author.gravatar"
                        :alt="author.name"
                        hide-title /></UserAvatarPopper
                  ></RouterLink>
                  <RouterLink v-else-if="author.tagid" :to="'/tag/author/' + author.tagid"
                    ><UserAvatar
                      class="inline-block w-10 lg:w-14 h-10 lg:h-14 rounded-full bg-gray-500 object-cover"
                      :image="author.avatar"
                      :gravatar="author.gravatar"
                      :alt="author.name"
                  /></RouterLink>
                  <UserAvatar
                    v-else
                    class="inline-block w-10 lg:w-14 h-10 lg:h-14 rounded-full bg-gray-500 object-cover"
                    :image="author.avatar"
                    :gravatar="author.gravatar"
                    :alt="author.name"
                  />
                </div>
                <div class="hidden sm:block ml-1.5 overflow-hidden">
                  <RouterLink v-if="author.type === 'User'" :to="'/user/' + author.id.toHexString()"
                    ><span
                      class="inline-block align-text-bottom px-0.75 mr-0.5 rounded bg-pink-400 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                      v-text="author.position"
                    ></span
                    >{{ author.name }}</RouterLink
                  ><RouterLink v-else-if="author.tagid" :to="'/tag/author/' + author.tagid"
                    ><span
                      class="inline-block align-text-bottom px-0.75 mr-0.5 rounded bg-pink-400 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                      v-text="author.position"
                    ></span
                    >{{ author.name }}</RouterLink
                  ><template v-else
                    ><span
                      class="inline-block align-text-bottom px-0.75 mr-0.5 rounded bg-pink-400 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                      v-text="author.position"
                    ></span
                    >{{ author.name }}</template
                  >
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
              class="xl:mx-2 border-gray-300 dark:border-gray-600 border-b xl:border xl:rounded-md xl:mt-2 flex flex-col max-h-125"
            >
              <div class="mx-2 my-1 flex justify-between">
                <div>
                  <RouterLink class="" :to="'/playlist/' + pid"
                    ><div
                      class="i-uil-list-ui-alt inline-block text-lg align-middle text-gray-800 dark:text-gray-100"
                    ></div>
                    {{ playlist.item.title }}</RouterLink
                  >
                  <div class="text-sm text-gray-900 dark:text-gray-200">
                    {{ playlist.meta.createdBy ? playlist.meta.createdBy.username + ' - ' : ''
                    }}{{ playlistIndex + ' / ' + playlist.item.count }}
                  </div>
                </div>
                <div class="flex flex-col justify-around">
                  <div
                    class="i-uil-angle-up text-2xl transform transition-transform duration-200 select-none cursor-pointer"
                    :class="{ 'rotate-180': playlistCollaped }"
                    @click="playlistCollaped = !playlistCollaped"
                  ></div>
                </div>
              </div>
              <div v-show="!playlistCollaped" class="h-full overflow-y-auto">
                <RouterLink
                  v-for="(plVideo, plIndex) in playlistVideos"
                  :key="plVideo.video.id.toHexString()"
                  class="flex justify-start space-x-1 py-1 hover:bg-pink-50 dark:hover:bg-gray-800"
                  :class="{ 'bg-pink-50 dark:bg-gray-800': plVideo.video.id.toHexString() === vid }"
                  :to="'/video/' + plVideo.video.id + '?list=' + pid"
                >
                  <div
                    class="flex flex-col flex-shrink-0 flex-grow-0 justify-around text-xs w-6 self-center text-center overflow-hidden"
                  >
                    <template v-if="plIndex + 1 === playlistIndex"><div class="i-uil-play mx-auto"></div></template
                    ><template v-else>{{ plVideo.rank + 1 }}</template>
                  </div>
                  <div class="flex-shrink-0 flex-grow-0 w-24">
                    <div class="aspect-ratio-8/5">
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
                      class="text-xs text-gray-900 dark:text-gray-200"
                      v-text="plVideo.video.meta.createdBy.username"
                    ></div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </Teleport>
          <!-- Related Video -->
          <div class="mt-2">
            <span class="ml-1 font-light">{{ t('video.video.related-video') }}</span>
            <div class="flex flex-col">
              <RouterLink
                v-for="rlVideo in video.relatedVideos"
                :key="rlVideo.id.toHexString()"
                :to="'/video/' + rlVideo.id.toHexString()"
                class="grid grid-cols-5 space-x-1.5 py-0.5 rounded-md hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors duration-100"
              >
                <div class="col-span-2">
                  <Cover :title="rlVideo.item.title" :cover-image="rlVideo.item.coverImage" class="rounded-md"></Cover>
                </div>
                <div class="col-span-3 flex mt-0.5 flex-wrap content-start text-sm">
                  <a class="line-clamp-2 overflow-ellipsis overflow-hidden w-full" v-text="rlVideo.item.title"></a>
                  <div
                    class="text-sm inline-block w-full mt-1 truncate font-light"
                    v-text="rlVideo.meta.createdBy?.username"
                  ></div>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Placeholder -->
    <div v-else class="mx-2">
      <div class="grid grid-cols-12 grid-flow-row-dense">
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 lg:text-lg w-4/5 rounded-md bg-gray-300 dark:bg-gray-600">&nbsp;</h1>
            <div class="mt-1 text-gray-600 dark:text-gray-300 w-2/5 rounded-md bg-gray-300 dark:bg-gray-600">
              &nbsp;
            </div>
          </div>
          <!-- Video Player -->
          <div class="w-full mt-1">
            <div class="aspect-ratio-16/9">
              <div class="w-full h-full bg-gray-400 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
        <div class="col-span-full xl:col-span-3 space-x-2">
          <!-- Author / Uploader -->
          <div class="flex xl:flex-col justify-start px-1 xl:pt-4">
            <div class="flex items-center flex-nowrap px-1 py-1 xl:w-full">
              <!-- Avatar -->
              <div class="relative flex-shrink-0">
                <div class="inline-block w-10 lg:w-14 h-10 lg:h-14 rounded-full bg-gray-400 dark:bg-gray-600">
                  &nbsp;
                </div>
              </div>
              <div class="hidden sm:block w-full ml-3 overflow-hidden">
                <div class="inline-block w-4/5 rounded-md bg-gray-300 dark:bg-gray-600">&nbsp;</div>
                <br />
                <div
                  class="inline-block overflow-hidden whitespace-nowrap overflow-ellipsis text-sm w-2/5 mt-1 rounded-md bg-gray-400 dark:bg-gray-600"
                >
                  &nbsp;
                </div>
              </div>
            </div>
          </div>
          <!-- Related Video -->
          <div class="flex flex-col space-y-1 mt-2">
            <div v-for="i in 20" :key="i" class="grid grid-cols-5 space-x-1 hover:bg-pink-50 dark:hover:bg-gray-800">
              <div class="col-span-2">
                <CoverPlaceholder class="rounded-sm"></CoverPlaceholder>
              </div>
              <div class="col-span-3 flex flex-wrap content-start text-sm">
                <a class="line-clamp-2 overflow-ellipsis overflow-hidden w-4/5 rounded-md bg-gray-400 dark:bg-gray-600"
                  >&nbsp;</a
                >
                <div class="text-sm mt-1 inline-block w-2/5 truncate rounded-md bg-gray-300 dark:bg-gray-600">
                  &nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import Player from './components/Player.vue'
import Tag from '@/tag/components/Tag.vue'
import MarkdownBlock from '@/markdown/components/MarkdownBlock.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import UserAvatarPopper from '@/user/components/UserAvatarPopper.vue'
import Cover from './components/Cover.vue'
import CoverPlaceholder from './components/CoverPlaceholder.vue'
import { computed, ref, shallowRef, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type ObjectID from 'bson-objectid'
import NProgress from 'nprogress'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { screenSizes } from '@/css'
import { getCoverImage } from '@/common/lib/imageUrl'
import { behMostMatch } from '@/locales'
import { useLocalStorage } from '@vueuse/core'
import { isLogin, IsLogin, user } from '@/user/index'
import { openWindow } from '@/nested'

const { t } = useI18n()
const route = useRoute()

/* submit query */
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
          site
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
          tagid
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
            hidden
            deleted
            edited
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
              hidden
              deleted
              edited
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
        relatedVideos(topK: 20) {
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
        clearence
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
const video = useResult(result, null, (data) => data?.getVideo)
// change title
watchEffect(() => {
  if (video.value) setSiteTitle(video.value.item.title)
})

/* tags */
type Author = {
  type: 'AuthorTag' | 'User'
  position: string
  id: ObjectID
  tagid?: number
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
              tagid: tag.tagid,
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
type Comment = schema.Comment & {
  content: NonNullable<schema.Comment['content']>
  meta: schema.Meta & { createdBy: NonNullable<schema.Meta['createdBy']> }
  deleted: false
  children?: Comment[]
}
const comments = computed(
  () =>
    (video.value?.commentThread?.comments
      ?.filter((v) => v.content && v.meta.createdBy && !v.deleted)
      .map((comment) => ({
        ...comment,
        children: comment.children?.filter((v) => v.content && v.meta.createdBy && !v.deleted),
      }))
      .filter((v) => !!v) as Comment[]) ?? []
)

/* mobile teleport targets */
const mobileAuthorTarget = shallowRef<HTMLDivElement | null>(null)
const mobilePlaylistTarget = shallowRef<HTMLDivElement | null>(null)

/* video playlist, ?list=[PID] */
// raw playlist
const playlist = useResult(result, null, (data) => data?.getPlaylist)
// videos in playlist
const playlistVideos = useResult(result, null, (data) => data?.listAdjacentVideos)
// the index that current video at
const playlistIndex = computed(() =>
  video.value && playlistVideos.value
    ? (playlistVideos.value.find((v) => v.video.id.toHexString() === vid.value)?.rank ?? -2) + 1
    : -1
)
// whither playlist is collaped
const playlistCollaped = ref(!screenSizes.xl)

// use plain text to render tags, just made it for fun.
const renderTagAsPlainText = useLocalStorage('video_tag_render_as_plain_text', false)

/* edit video */
const editVideoWindow = shallowRef<Window | null>(null)
const popEditVideoWindow = () => {
  // check if there is already a window opened
  if (editVideoWindow.value && !editVideoWindow.value.closed) {
    editVideoWindow.value.focus()
  }
  // create a new window
  const { window: win } = openWindow({
    url: '/edit-video/' + vid.value,
  })
  editVideoWindow.value = win
}

// video clearence
const clearence = computed(() => video.value?.clearence ?? 3)

/* hide video */
const hideVideoResult = ref('')
const hideVideo = () => {
  hideVideoResult.value = t('video.video.edit.hide-video.saving')
  fetch('https://patchyvideo.com/be/videos/condemn_video.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      vid: vid.value,
    }),
    credentials: 'include',
  })
    .then((data) => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === 'SUCCEED') {
        hideVideoResult.value = t('video.video.edit.hide-video.succeed')
      } else {
        throw 'failed'
      }
    })
    .catch((e) => {
      console.error(e)
      hideVideoResult.value = t('video.video.edit.hide-video.failed', { error: e.message ?? e })
    })
}

/* edit tags */
const editTagWindow = shallowRef<Window | null>(null)
const popEditTagWindow = () => {
  // check if there is already a window opened
  if (editTagWindow.value && !editTagWindow.value.closed) {
    editTagWindow.value.focus()
  }
  // create a new window
  const { window: win } = openWindow({
    url: '/tag-editor/' + vid.value,
  })
  editTagWindow.value = win
}
</script>
