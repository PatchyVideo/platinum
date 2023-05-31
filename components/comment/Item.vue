<script lang="ts" setup>
import type { CommentItemType } from '@/composables/comment/comment'

const props = defineProps<{
  comment: CommentItemType
  child?: boolean
  hidden: boolean
}>()
const emit = defineEmits<{
  (event: 'update:hidden', value: boolean): void
}>()
const hidden = useVModel(props, 'hidden', emit)
</script>

<template>
  <div class="flex items-start space-x-2">
    <UserAvatar
      class="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover mt-1"
      :class="{ 'w-6 h-6 md:h-8 md:w-8': child }"
      :image="props.comment.meta.createdBy.image"
      :gravatar="props.comment.meta.createdBy.gravatar"
      :alt="props.comment.meta.createdBy.username"
      hide-title
    />
    <div class="flex flex-col">
      <!-- User Meta -->
      <div class="text-xs md:flex md:items-center md:space-x-2">
        <RouterLink class="md:text-base text-gray-600" :to="`/profile/${props.comment.meta.createdBy.id}`">
          {{ props.comment.meta.createdBy.username }}
        </RouterLink>
        <div class="md:text-sm text-gray-400">
          <DateRelative :date="props.comment.meta.createdAt" />
          <span v-if="props.comment.edited" class="ml-1.5">(edited)</span>
        </div>
      </div>
      <!-- Content -->
      <div
        v-if="hidden ?? props.comment.hidden"
        class="text-gray-400"
      >
        此评论已被折叠
        <span
          class="text-purple-300 text-xs underline cursor-pointer"
          @click="() => hidden = false"
        >显示评论</span>
      </div>
      <!-- TODO: parser for markdown and emoji -->
      <div v-else>
        {{ props.comment.content.trim() ? props.comment.content : 'null' }}
      </div>
    </div>
  </div>
</template>
