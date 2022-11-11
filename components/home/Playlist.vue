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
  video_show_title: boolean
  video_show_date: boolean
}

const config = $computed(() => ({
  playlist_id: '5e057a1b31929c83a76d18a4',
  title_pos: 'tl',
  video_show_title: true,
  video_show_date: true,
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
    pid: config.playlist_id,
    limit: config.rows * 6,
  },
)
const playlist = $computed(() => data.value?.getPlaylist)
</script>

<template>
  <div class="w-full">
    <div v-if="playlist">
      <VideoGrid
        :name="config.title ?? playlist.item.title"
        :title-links-to="`/playlist/${config.playlist_id}`"
        :videos="playlist.videos"
        :rows="config.rows"
        :video-show-title="config.video_show_title"
        :video-show-date="config.video_show_date"
        @refresh="refresh"
      />
    </div>
    <div v-else>
      <VideoGridPlaceholder :rows="config.rows" />
    </div>
  </div>
</template>
