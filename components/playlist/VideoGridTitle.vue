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

    <div v-if="author" class="hidden md:flex items-center space-x-1">
      <UserAvatar
        class="w-6 h-6 rounded-full cursor-pointer"
        openable
        hide-title
        :alt="author.username"
        :image="author.image"
        :gravatar="author.gravatar"
      />

      <NuxtLink v-if="author.id" :to="`/profile/${author.id}`" class="text-sm">
        {{ author.username }}
      </NuxtLink>
      <div v-else class="text-sm">
        {{ author.username }}
      </div>
    </div>
  </div>
</template>
