<!-- Playlist-list root page -->
<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = defineProps<{
  page: number
  limit: number
  queryWord: string
  order: string
  total: number
}>()
const emit = defineEmits<{
  (event: 'update:total', value: boolean): void
}>()
const total = useVModel(props, 'total', emit)

const { t } = useI18n()

const { data: listPlaylist } = await useAsyncQuery<Query>(
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
    offset: (props.page - 1) * props.limit,
    limit: props.limit,
    query: props.queryWord,
    order: props.order,
  },
)
const resultPlaylist = computed(() => listPlaylist.value!.listPlaylist)

watchEffect(() => {
  if (resultPlaylist.value)
    total.value = Math.ceil(resultPlaylist.value.count / props.limit)
})
</script>

<template>
  <div>
    <div class="border-b border-gray-200 py-1.5 mb-1">
      <span>{{ t('playlist.playlist-list.main-body.successful.load-result-count', { count: resultPlaylist.count }) }}</span>
    </div>

    <div class="space-y-2">
      <PlaylistGrid
        v-for="playlist in resultPlaylist.playlists" :key="playlist.id"
        :name="playlist.item.title"
        :title-links-to="`/playlist/${playlist.id}`"
        :private="playlist.item.private"
        :author="playlist.meta.createdBy ?? undefined"
        :videos="playlist.videos"
        :count="playlist.item.count"
        :cover="playlist.item.cover"
      />
    </div>
  </div>
</template>
