<!-- Title link for a single playlist -->
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  private?: boolean
  name?: string
  titleLinksTo: RouteLocationRaw
  author?: schema.User
}>()
</script>

<template>
  <div class="w-full md:flex md:items-center md:justify-between">
    <div class="flex items-center space-x-2">
      <span v-if="private" class="bg-purple-400 text-white text-xs rounded px-1 py-0.5">Private</span>
      <VideoGridTitle :name="name" :title-links-to="titleLinksTo" />
    </div>

    <div class="hidden md:inline-block">
      <UserMeta
        v-if="author"
        :id="author.id"
        :username="author.username"
        small-size
        :image="author.image"
        :gravatar="author.gravatar"
      />
    </div>
  </div>
</template>
