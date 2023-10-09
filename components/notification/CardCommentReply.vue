<script lang="ts" setup>
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  note: schema.ReplyNotificationObject
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="flex items-center m-1 p-2 shadow rounded-md"
    :class="{ 'bg-gray-100 dark:bg-gray-500': !props.note.read }"
  >
    <NuxtLink class="w-1/6 md:w-1/15 max-w-15 mr-2 cursor-pointer" target="_blank" :to="`/profile/${props.note.repliedBy.id.toString()}`">
      <UserAvatar
        class="w-full rounded-full ring-2 ring-white"
        hide-title
        :alt="props.note.repliedBy.username"
        :image="props.note.repliedBy.image"
        :gravatar="props.note.repliedBy.gravatar"
      />
    </NuxtLink>
    <NuxtLink
      class="w-5/6 md:w-14/15"
      target="_blank"
      :to="
        `${(props.note.repliedType === 'forum' ? '' : props.note.repliedType === 'video' ? '/video/' : '/playlist/')
          + props.note.repliedObj
        }#${
          props.note.cid}`
      "
    >
      <div>
        {{ t('user-notification.notification-reply.reply', { username: props.note.repliedBy.username }) }}
      </div>
      <div class="text-xs rounded bg-gray-100 text-gray-400 p-0.5 leading-5 line-clamp-1">
        {{ props.note.content }}
      </div>
      <div class="text-xs text-gray-600 dark:text-white">
        <DateRelative class="text-xs text-gray-500 dark:text-gray-300 font-light" :date="props.note.time" />
      </div>
    </NuxtLink>
  </div>
</template>
