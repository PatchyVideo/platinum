<!-- Playlist-list root page -->
<script lang="ts" setup>
const props = defineProps<{
  showAutoPost: boolean
  page: number
  limit: number
}>()

const route = useRoute()

const updatePage = (page: number) => {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page } })
}
</script>

<template>
  <div>
    <PPagination
      class="mt-4"
      :page="page"
      :total="50"
      @update:page="updatePage"
    />
  </div>
</template>
