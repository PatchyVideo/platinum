<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = withDefaults(
  defineProps<{
    data?: Partial<Data>
  }>(),
  {
    data: () => ({}),
  },
)

interface Data {
  rows: number
  playlist_id: string
  title?: string
  title_pos: 'tl' | 'tr' | 'bl' | 'br'
}

const config = computed(() => ({
  playlist_id: '5e057a1b31929c83a76d18a4',
  title_pos: 'tl',
  rows: 1,
  ...props.data,
}))

const { data, refresh } = await useAsyncQuery<Query>(
  gql`
    query ($pid: String!, $limit: Int!) {
      getPlaylist(para: { pid: $pid }) {
        item {
          title
          count
        }
        videos(offset: 0, limit: $limit) {
          id
          item {
            title
            coverImage
            url
          }
          clearence
          meta {
            createdAt
          }
        }
        meta {
          createdAt
          modifiedAt
        }
      }
    }
  `,
  {
    pid: config.value.playlist_id,
    limit: config.value.rows * 6,
  },
)
const playlist = computed(() => data.value!.getPlaylist)
</script>

<template>
  <div class="w-full">
    <VideoGrid
      :name="config.title ?? playlist.item.title"
      :title-links-to="`/playlist/${config.playlist_id}`"
      :videos="playlist.videos"
      :rows="config.rows"
      @refresh="refresh"
    />
  </div>
</template>
