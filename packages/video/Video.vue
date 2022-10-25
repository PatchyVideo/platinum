<template>
  <LayoutDefault>
    <!-- Main Object -->
    <div v-if="video" class="xl:mx-2">
      <div class="grid grid-cols-12 space-x-2 grid-flow-row-dense">
        <!-- Left Column -->
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1
              class="mt-1 sm:text-lg lg:text-xl font-semibold sm:font-medium lg:font-normal"
              v-text="video.item.title"
            />
            <div class="flex flex-row items-center gap-2 text-gray-600 dark:text-gray-300">
              <div v-text="t(`video.video.repost-type.${video.item.repostType}`, video.item.repostType)" />
              <div v-if="clearence !== 3" v-text="t(`video.video.ranks.${clearence}`)" />
              <Suspense><RelativeDate :date="video.item.uploadTime" /></Suspense>
              <template v-if="auth.isAdmin">
                <div
                  :title="t('video.video.edit.hide-video.title')"
                  class="i-uil:eye-slash text-lg cursor-pointer select-none"
                  @click="hideVideo"
                />
                <div v-if="hideVideoResult" v-text="hideVideoResult" />
              </template>
              <div
                v-if="auth.isLogin"
                :title="t('video.video.edit.edit-video')"
                class="i-uil:pen text-lg cursor-pointer select-none"
                @click="popEditVideoWindow"
              />
            </div>
          </div>
          <!-- Video Player -->
          <Suspense>
            <Player :item="video.item" />
          </Suspense>
          <!-- <div class="ltxl:hidden w-full border-t border-purple-300 my-2"></div> -->
          <div class="my-1" />
          <div ref="mobilePlaylistTarget" />
          <div ref="mobileAuthorTarget" />
          <div class="mx-1 md:mx-2 lg:mx-4">
            <!-- Video Tag -->
            <div class="flex mb-1 gap-1 items-center flex-wrap">
              <span :title="auth.isLogin ? t('video.video.edit.edit-tags') : undefined">
                <div
                  class="i-uil:tag-alt inline-block text-2xl align-middle text-gray-600 dark:text-gray-300"
                  :class="{ 'cursor-pointer': auth.isLogin }"
                  @click="() => auth.isLogin && (editTagOpened = true)"
                />
              </span>

              <template v-if="!renderTagAsPlainText">
                <RoundTag v-for="tag in regularTags" :key="tag.id.toHexString()" :tag="tag" />
              </template>
              <div v-else>
                <span v-for="tag in regularTags" :key="tag.id.toHexString()" class="mr-2 text-blue-600">#{{ behMostMatch(tag.languages) }}</span>
              </div>
            </div>
            <!-- Video Description -->
            <MarkdownCommentBlock :text="video.item.desc" size="sm" />
          </div>
          <div class="w-full border-t border-purple-300 dark:border-indigo-800 my-2" />
          <!-- Comments -->
          <div><CommentList :comment-thread-id="video.commentThread?.id.toHexString()" :video-id="vid" /></div>
        </div>

        <!-- Right Column -->
        <div class="col-span-full xl:col-span-3">
          <!-- Edit Tag View -->
          <div v-if="editTagOpened" class="flex flex-col mt-2 gap-1">
            <!-- Banner -->
            <button class="flex items-center text-blue-500" @click="() => editTagOpened = false">
              <div class="i-uil:arrow-left text-xl" />
              返回详情
            </button>
            <EditTags :key="vid" :vid="vid" :tags="video.tags" @refetch="refetch" />
          </div>
          <!-- Recomendation View -->
          <template v-else>
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
                    <RouterLink v-if="author.type === 'User'" :to="`/user/${author.id.toHexString()}`">
                      <UserAvatarPopper :uid="author.id.toHexString()">
                        <UserAvatar
                          class="inline-block w-10 lg:w-14 h-10 lg:h-14 rounded-full bg-gray-500 object-cover"
                          :image="author.avatar"
                          :gravatar="author.gravatar"
                          :alt="author.name"
                          hide-title
                        />
                      </UserAvatarPopper>
                    </RouterLink>
                    <RouterLink v-else-if="author.tagid" :to="`/tag/author/${author.tagid}`">
                      <UserAvatar
                        class="inline-block w-10 lg:w-14 h-10 lg:h-14 rounded-full bg-gray-500 object-cover"
                        :image="author.avatar"
                        :gravatar="author.gravatar"
                        :alt="author.name"
                      />
                    </RouterLink>
                    <UserAvatar
                      v-else
                      class="inline-block w-10 lg:w-14 h-10 lg:h-14 rounded-full bg-gray-500 object-cover"
                      :image="author.avatar"
                      :gravatar="author.gravatar"
                      :alt="author.name"
                    />
                  </div>
                  <div class="hidden sm:block ml-1.5 overflow-hidden">
                    <RouterLink v-if="author.type === 'User'" :to="`/user/${author.id.toHexString()}`">
                      <span
                        class="inline-block align-text-bottom px-0.75 mr-0.5 rounded bg-purple-400 dark:bg-violet-800 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                        v-text="author.position"
                      />{{ author.name }}
                    </RouterLink>
                    <RouterLink v-else-if="author.tagid" :to="`/tag/author/${author.tagid}`">
                      <span
                        class="inline-block align-text-bottom px-0.75 mr-0.5 rounded bg-purple-400 dark:bg-violet-800 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                        v-text="author.position"
                      />{{ author.name }}
                    </RouterLink>
                    <template v-else>
                      <span
                        class="inline-block align-text-bottom px-0.75 mr-0.5 rounded bg-purple-400 dark:bg-violet-800 text-xs lg:text-sm text-white whitespace-nowrap overflow-hidden"
                        v-text="author.position"
                      />{{ author.name }}
                    </template>
                    <br>
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
                class="xl:mx-2 border-purple-300 dark:border-purple-800 border-b xl:border xl:rounded-md xl:mt-2 flex flex-col max-h-125"
              >
                <div class="mx-2 my-1 flex justify-between">
                  <div>
                    <RouterLink class="" :to="`/playlist/${pid}`">
                      <div
                        class="i-uil:list-ui-alt inline-block text-lg align-middle text-gray-800 dark:text-gray-100"
                      />
                      {{ playlist.item.title }}
                    </RouterLink>
                    <div class="text-sm text-gray-900 dark:text-gray-200">
                      {{ playlist.meta.createdBy ? `${playlist.meta.createdBy.username} - ` : ''
                      }}{{ `${playlistIndex} / ${playlist.item.count}` }}
                    </div>
                  </div>
                  <div class="flex flex-col justify-around">
                    <div
                      class="i-uil:angle-up text-2xl transform transition-transform duration-200 select-none cursor-pointer"
                      :class="{ 'rotate-180': playlistCollaped }"
                      @click="playlistCollaped = !playlistCollaped"
                    />
                  </div>
                </div>
                <div v-show="!playlistCollaped" class="h-full overflow-y-auto">
                  <RouterLink
                    v-for="(plVideo, plIndex) in playlistVideos"
                    :key="plVideo.video.id.toHexString()"
                    class="flex justify-start space-x-1 py-1 hover:bg-purple-50 dark:hover:bg-gray-800"
                    :class="{ 'bg-purple-50 dark:bg-gray-800': plVideo.video.id.toHexString() === vid }"
                    :to="`/video/${plVideo.video.id}?list=${pid}`"
                  >
                    <div
                      class="flex flex-col flex-shrink-0 flex-grow-0 justify-around text-xs w-6 self-center text-center overflow-hidden"
                    >
                      <template v-if="plIndex + 1 === playlistIndex">
                        <div class="i-uil:play mx-auto" />
                      </template><template v-else>
                        {{ plVideo.rank + 1 }}
                      </template>
                    </div>
                    <div class="flex-shrink-0 flex-grow-0 w-24">
                      <div class="aspect-ratio-8/5">
                        <img
                          class="inline-block"
                          width="96"
                          height="54"
                          :src="getCoverImage({ image: plVideo.video.item.coverImage })"
                        >
                      </div>
                    </div>
                    <div class="flex flex-col justify-between">
                      <h2 class="text-sm line-clamp-2" v-text="plVideo.video.item.title" />
                      <div
                        v-if="plVideo.video.meta.createdBy"
                        class="text-xs text-gray-900 dark:text-gray-200"
                        v-text="plVideo.video.meta.createdBy.username"
                      />
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
                  :to="`/video/${rlVideo.id.toHexString()}`"
                  class="grid grid-cols-5 space-x-1.5 py-0.5 rounded-md hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors duration-100"
                >
                  <div class="col-span-2">
                    <Cover
                      :title="rlVideo.item.title"
                      :cover-image="rlVideo.item.coverImage"
                      class="rounded-md"
                    />
                  </div>
                  <div class="col-span-3 flex mt-0.5 flex-wrap content-start text-sm">
                    <a class="line-clamp-2 overflow-ellipsis overflow-hidden w-full" v-text="rlVideo.item.title" />
                    <div
                      class="text-sm inline-block w-full mt-1 truncate font-light"
                      v-text="rlVideo.meta.createdBy?.username"
                    />
                  </div>
                </RouterLink>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- Placeholder -->
    <div v-else class="mx-2">
      <div class="grid grid-cols-12 grid-flow-row-dense">
        <div class="col-span-full xl:col-span-9">
          <!-- Video Title -->
          <div>
            <h1 class="mt-1 sm:text-lg lg:text-xl w-4/5 rounded-md bg-gray-300 dark:bg-gray-600">
              &nbsp;
            </h1>
            <div class="mt-1 text-gray-600 dark:text-gray-300 w-2/5 rounded-md bg-gray-300 dark:bg-gray-600">
              &nbsp;
            </div>
          </div>
          <!-- Video Player -->
          <div class="w-full mt-1">
            <div class="aspect-ratio-16/9">
              <div class="w-full h-full bg-gray-400 dark:bg-gray-600" />
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
                <div class="inline-block w-4/5 rounded-md bg-gray-300 dark:bg-gray-600">
                  &nbsp;
                </div>
                <br>
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
            <div v-for="i in 20" :key="i" class="grid grid-cols-5 space-x-1 hover:bg-purple-50 dark:hover:bg-gray-800">
              <div class="col-span-2">
                <CoverPlaceholder class="rounded-sm" />
              </div>
              <div class="col-span-3 flex flex-wrap content-start text-sm">
                <a class="line-clamp-2 overflow-ellipsis overflow-hidden w-4/5 rounded-md bg-gray-400 dark:bg-gray-600">&nbsp;</a>
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
import { computed, ref, shallowRef, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocalStorage } from '@vueuse/core'
import Player from './components/Player.vue'
import Cover from './components/Cover.vue'
import CoverPlaceholder from './components/CoverPlaceholder.vue'
import CommentList from './components/CommentList.vue'
import EditTags from './components/EditTags.vue'
import RoundTag from '@/tag/components/RoundTag.vue'
import MarkdownCommentBlock from '@/markdown/components/MarkdownCommentBlock.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import UserAvatarPopper from '@/user/components/UserAvatarPopper.vue'
import { gql, useQuery, useResult } from '@/graphql'
import type { ObjectID, Query, schema } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { screenSizes } from '@/css'
import { getCoverImage } from '@/common/libs/imageUrl'
import { behMostMatch } from '@/locales'
import { openWindow } from '@/nested'
import { useAuth } from '@/user'
import { startProgress, stopProgress } from '@/nprogress'

const { t } = useI18n()
const route = useRoute()
const auth = useAuth()

/* submit query */
const vid = computed(() => route.params.vid as string)
const pid = computed(() => Array.isArray(route.query.list) ? route.query.list[0] : route.query.list)
const { result, loading, refetch } = useQuery<Query>(
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
          id
          tagid
          category
          languages {
            lang
            value
          }
          ... on AuthorTagObject {
            authorRole
            author {
              id
              tagname
              avatar
              desc
            }
          }
        }
        commentThread {
          id
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
  },
)

// sync process bar
watchEffect(() => {
  if (loading.value)
    startProgress()
  else
    stopProgress()
})

/* basic info */
const video = useResult(result, null, data => data?.getVideo)
// change title
watchEffect(() => {
  if (video.value)
    setSiteTitle(`${video.value.item.title} - PatchyVideo`)
})

/* tags */
interface Author {
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
    ? ((video.value.tags.filter(v => v.__typename === 'AuthorTagObject') as schema.AuthorTagObject[])
        .map(
          tag =>
            tag.author
            && ({
              type: 'AuthorTag',
              id: tag.author.id,
              tagid: tag.tagid,
              name: tag.author.tagname,
              desc: tag.author.desc,
              avatar: tag.author.avatar,
              position: tag.authorRole,
            } as Author),
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
        .filter(v => !!v) as Author[])
    : [],
)
const regularTags = computed(() =>
  video.value ? (video.value.tags.filter(v => v.__typename === 'RegularTagObject') as schema.RegularTagObject[]) : [],
)

/* mobile teleport targets */
const mobileAuthorTarget = shallowRef<HTMLDivElement | null>(null)
const mobilePlaylistTarget = shallowRef<HTMLDivElement | null>(null)

/* video playlist, ?list=[PID] */
// raw playlist
const playlist = useResult(result, null, data => data?.getPlaylist)
// videos in playlist
const playlistVideos = useResult(result, null, data => data?.listAdjacentVideos)
// the index that current video at
const playlistIndex = computed(() =>
  video.value && playlistVideos.value
    ? (playlistVideos.value.find(v => v.video.id.toHexString() === vid.value)?.rank ?? -2) + 1
    : -1,
)
// whither playlist is collaped
const playlistCollaped = ref(!screenSizes.xl)

// use plain text to render tags, just made it for fun.
const renderTagAsPlainText = useLocalStorage('video_tag_render_as_plain_text', false)

/* edit video */
const editVideoWindow = shallowRef<Window | null>(null)
const popEditVideoWindow = () => {
  // check if there is already a window opened
  if (editVideoWindow.value && !editVideoWindow.value.closed)
    editVideoWindow.value.focus()

  // create a new window
  const { window: win } = openWindow({
    url: `/edit-video/${vid.value}`,
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
    .then(data => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === 'SUCCEED')
        hideVideoResult.value = t('video.video.edit.hide-video.succeed')
      else
        throw new Error(res)
    })
    .catch((e) => {
      console.error(e)
      hideVideoResult.value = t('video.video.edit.hide-video.failed', { error: e.message ?? e })
    })
}

/* edit tags */
const editTagOpened = ref(false)
</script>
