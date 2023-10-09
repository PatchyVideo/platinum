<script lang="ts" setup>
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  note: schema.SystemNotificationObject
}>()

const { t } = useI18n()

const messageOpen = ref(false)
</script>

<template>
  <div
    class="m-1 p-2 shadow rounded-md space-y-2"
    :class="{ 'bg-gray-100 dark:bg-gray-500': !props.note.read }"
  >
    <div>{{ note.title }}</div>
    <div class="relative overflow-hidden">
      <div
        class="transform transition-all duration-200 text-sm"
        :style="{ marginTop: messageOpen ? '0' : '-100%' }"
      >
        {{ note.content }}
      </div>
    </div>
    <div class="flex justify-between text-xs text-gray-600 dark:text-white">
      <DateRelative class="text-xs text-gray-500 dark:text-gray-300 font-light" :date="props.note.time" />
      <div class="cursor-pointer text-purple-300" @click="messageOpen = !messageOpen">
        {{
          messageOpen ? t('user-notification.notification-system.fold') : t('user-notification.notification-system.unfold')
        }}
      </div>
    </div>
  </div>
</template>
