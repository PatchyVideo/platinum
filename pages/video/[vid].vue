<script setup lang="ts">
import type { Query, schema } from '@/composables/graphql'

const { t } = useI18n()
const route = useRoute()

useHead({
  title: 'PatchyVideo',
})

const vid = computed(() => route.params.vid as string)
const pid = computed(() => Array.isArray(route.query.list) ? route.query.list[0] : route.query.list)

definePageMeta({
  key: route => JSON.stringify([
    route.params.vid,
  ]),
})

// TODO: i18n support
const { data } = await useAsyncQuery<Query>(
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
            partName
            url
          }
          meta {
            createdBy {
              username
            }
            createdAt
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
const getVideo = computed(() => data.value!.getVideo)
const listAdjacentVideos = computed(() => data.value!.listAdjacentVideos)
const getPlaylist = computed(() => data.value!.getPlaylist)

useHead({
  title: `${getVideo.value.item.title}`,
})

/* tags */
interface Author {
  type: 'AuthorTag' | 'User'
  position: string
  id: string
  tagid?: number
  name: string
  desc: string
  avatar: string
  gravatar?: string
}
const authors = computed(() =>
  getVideo.value
    ? ((getVideo.value.tags.filter(v => v.__typename === 'AuthorTagObject') as schema.AuthorTagObject[])
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
          getVideo.value.meta.createdBy && {
            type: 'User',
            id: getVideo.value.meta.createdBy.id,
            name: getVideo.value.meta.createdBy.username,
            desc: getVideo.value.meta.createdBy.desc,
            avatar: getVideo.value.meta.createdBy.image,
            gravatar: getVideo.value.meta.createdBy.gravatar || undefined,
            position: t('video.video.uploader'),
          },
        ])
        .filter(v => !!v) as Author[])
    : [],
)
</script>

<template>
  <div class="flex flex-wrap space-y-2">
    <div class="w-full lg:w-7/10 space-y-2">
      <div class="text-base md:text-xl font-semibold">
        {{ getVideo.item.title }}
      </div>
      <div class="flex items-center space-x-2">
        <VideoSiteImage :url="getVideo.item.url" class="w-4 h-4 flex-shrink-0" />
        <div v-text="t(`video.video.repost-type.${getVideo.item.repostType}`, getVideo.item.repostType)" />
        <DateRelative :date="getVideo.item.uploadTime" />
      </div>
      <Suspense>
        <VideoPlayer :item="getVideo.item" class="shadow" />
      </Suspense>
      <div class="space-y-2 flex flex-wrap md:space-x-2">
        <UserMeta
          v-for="author in authors"
          :id="author.id"
          :key="author.id"
          :status="author.type === 'AuthorTag' ? '原作者' : '上传者'"
          :username="author.name"
          :desc="author.desc"
          show-desc
          :image="author.avatar"
          :gravatar="author.gravatar"
          show-img
          :small-size="false"
        />
      </div>
      <div>
        <ToolbarTag v-for="item in getVideo.tags" :key="item.id" :tag="item" class="mr-1 mt-1" />
      </div>
      <MarkdownCommentBlock :text="getVideo.item.desc ? getVideo.item.desc : '简介：暂无简介'" />
      <VideoCommentPost :video-id="vid" />
      <CommentList v-if="getVideo.commentThread" :tid="getVideo.commentThread?.id" />
      <VideoDetailModuleTitle v-else text="暂无评论" />
    </div>
    <div class="w-full lg:w-3/10 lg:pl-2 space-y-2">
      <VideoDetailModuleTitle :text="t('video.video.related-video')" />
      <VideoCard v-for="item in getVideo.relatedVideos" :key="item.id" :video="item" horizontal :responsive="false" />
    </div>
  </div>
</template>
