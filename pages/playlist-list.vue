<!-- Playlist-list root page -->
<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

definePageMeta({
  key: route => JSON.stringify([
    route.query.page,
    route.query.limit,
    route.query.order,
  ]),
})

const route = useRoute()
const { t } = useI18n()

useHead({
  title: `${t('playlist.playlist-list.title')}`,
})

const page = computed(() => Number(pickFirstQuery(route.query.page)) || 1)
const limit = computed(() => Number(pickFirstQuery(route.query.limit)) || 20)
const order = computed(() => pickFirstQuery(route.query.order) || 'last_modified')

const { data } = await useAsyncQuery<Query>(
  gql`
    query ($offset: Int!, $limit: Int!, $query: String!, $order: String!) {
      listPlaylist(
        para: {
          offset: $offset
          limit: $limit
          query: $query
          order: $order
        }
      ) {
        count
        playlists {
          id
          item {
            title
            cover
            private
            count
          }
          meta {
            createdBy {
              id
              username
              image
              gravatar
            }
          }
          videos(offset: 0, limit: 6) {
            id
            meta {
              createdAt
            }
            item {
              coverImage
              title
              site
              url
            }
          }
        }
      }
    }
  `,
  {
    offset: (page.value - 1) * limit.value,
    limit: limit.value,
    query: '',
    qtype: '',
    order: order.value,
  },
)
const listPlaylist = computed(() => data.value!.listPlaylist)

const updatePage = (page: number) => {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page } })
}
</script>

<template>
  <div>
    <div class="border-b border-gray-200 pb-1 mb-2">
      <span>{{ t('playlist.playlist-list.main-body.successful.load-result-count', { count: listPlaylist.count }) }}</span>
    </div>

    <div class="space-y-2">
      <PlaylistGrid
        v-for="playlist in listPlaylist.playlists" :key="playlist.id"
        :name="playlist.item.title"
        :title-links-to="`/playlist/${playlist.id}`"
        :private="playlist.item.private"
        :author="playlist.meta.createdBy ?? undefined"
        :videos="playlist.videos"
        :count="playlist.item.count"
        :cover="playlist.item.cover"
      />
    </div>

    <PPagination
      class="mt-4"
      :page="page"
      :total="Math.ceil(listPlaylist.count / limit)"
      @update:page="updatePage"
    />
  </div>
</template>
