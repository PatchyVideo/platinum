<template>
  <div class="max-w-screen-3xl mx-auto">
    <div class="w-full leading-8 align-middle p-1 border-b border-gray-200">PatchyVideo</div>
    <!-- Main Object -->
    <div class="mx-2">
      <!-- Video Title -->
      <div>
        <h1 class="mt-1" v-text="title"></h1>
        <div class="text-sm text-gray-500">{{ repostType }} {{ uploadTime.toLocaleString() }}</div>
      </div>
      <div class="grid grid-cols-12">
        <!-- Video Player -->
        <div class="col-span-9">
          <player :url="url"></player>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import player from './player/player.vue'
export default defineComponent({
  components: {
    player,
  },
})
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { gql, useQuery } from '/@/graphql'

const route = useRoute()
const vid = route.params.vid as string

export const title = ref('少女祈祷中……')
export const uploadTime = ref(new Date())
export const url = ref('')
export const repostType = ref('')

useQuery({
  query: gql`
    {
      getVideo(para: { vid: "${vid}", lang: "CHS" }) {
        item {
          title
          desc
          uploadTime
          url
          repostType
        }
        tagByCategory(lang: "CHS") {
          key
          value
        }
      }
    }
  `,
}).then((result) => {
  document.title = result.data.getVideo.item.title
  title.value = result.data.getVideo.item.title
  uploadTime.value = result.data.getVideo.item.uploadTime
  url.value = result.data.getVideo.item.url
  repostType.value = result.data.getVideo.item.repostType
})
</script>

<style lang="postcss" scoped>
</style>
