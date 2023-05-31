<!-- Playlist-list root page -->
<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const { t } = useI18n()
const route = useRoute()

useHead({
  title: 'PatchyVideo',
})

const pid = computed(() => route.params.pid as string)

definePageMeta({
  key: route => JSON.stringify([
    route.query.page,
    route.query.limit,
    route.query.order,
  ]),
})

const page = computed(() => Number(pickFirstQuery(route.query.page)) || 1)
const limit = computed(() => Number(pickFirstQuery(route.query.limit)) || 20)

const { data, refresh } = await useAsyncQuery<Query>(
  gql`
    query ($pid: String!, $offset: Int!, $limit: Int!) {
      getPlaylist(para: { pid: $pid }) {
        item {
          title
          cover
          count
          desc
          private
          privateEdit
        }
        rating {
          userRating
          totalUser
        }
        commentThread {
          id
        }
        videos(offset: $offset, limit: $limit) {
          id
          item {
            title
            partName
            desc
            coverImage
            url
          }
          meta {
            createdAt
          }
        }
        meta {
          createdBy {
            id
            username
            image
            gravatar
            desc
          }
          createdAt
          modifiedAt
        }
        editable
        tags{
          __typename
          id
          tagid
          category
          languages {
            lang
            value
          }
        }
      }
    }
  `,
  {
    pid: pid.value,
    offset: (page.value - 1) * limit.value,
    limit: limit.value,
  },
)
const getPlaylist = computed(() => data.value!.getPlaylist)

useHead({
  title: `${data.value!.getPlaylist.item.title}`,
})

function updatePage(page: number) {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page } })
}
</script>

<template>
  <div class="space-y-5">
    <PlaylistMeta
      :pid="pid"
      :title="getPlaylist.item.title"
      :author="getPlaylist.meta.createdBy ?? undefined"
      :tags="getPlaylist.tags"
      :rating="getPlaylist.rating ?? undefined"
      :cover="getPlaylist.item.cover"
      :desc="getPlaylist.item.desc"
      :private="getPlaylist.item.private"
    />

    <!-- Divide -->
    <div class="w-full md:h-0.2 bg-purple-100" />

    <PlaylistVideoList
      :videos="getPlaylist.videos"
      :page="page"
      :limit="limit"
      :editable="getPlaylist.editable || false"
      @refresh="refresh"
    />

    <PPagination
      :page="page"
      :total="Math.ceil(getPlaylist.item.count / limit)"
      @update:page="updatePage"
    />

    <CommentList v-if="getPlaylist.commentThread" :tid="getPlaylist.commentThread?.id" />
  </div>
</template>
