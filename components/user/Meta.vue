<!-- User's name, avatar, status and desc -->
<script lang="ts" setup>
const props = defineProps<{
  id?: string
  username: string
  smallSize?: boolean
  image?: string | null
  gravatar?: string | null
  status?: string
  desc?: string | null
  // show default img/desc when user have no img/desc
  showImg?: boolean
  showDesc?: boolean
}>()
</script>

<template>
  <div class="flex items-center space-x-1">
    <UserAvatar
      v-if="showImg || image || gravatar"
      class="rounded-full cursor-pointer"
      :class="smallSize ? 'w-6 h-6' : 'w-8 h-8'"
      openable
      hide-title
      :alt="username"
      :image="image"
      :gravatar="gravatar"
    />
    <div class="flex flex-col">
      <div class="flex items-center space-x-1">
        <div v-if="status" class="bg-purple-300 text-xs text-white rounded px-1">
          {{ status }}
        </div>
        <NuxtLink v-if="id" :to="`/profile/${id}`" :class="{ 'text-sm': smallSize }">
          {{ username }}
        </NuxtLink>
        <div v-else>
          {{ username }}
        </div>
      </div>
      <div v-if="showDesc || desc" class="truncate text-xs" :class="{ 'text-sm': smallSize }">
        {{ desc || '这个人太懒啦，并没有写简介' }}
      </div>
    </div>
  </div>
</template>
