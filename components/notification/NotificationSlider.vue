<script lang="ts" setup>
const props = defineProps<{
  noteType: 'comment_reply' | 'system_message' | 'at'
  listNoteCountUnread: number
  listNoteCountTypesCommentReply: number
  listNoteCountTypesSystemMessage: number
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const noteDrawerOpen = ref(false)

function changeNoteType(noteType: string): void {
  const query = JSON.parse(JSON.stringify(route.query))
  if (query.noteType === noteType)
    return
  noteDrawerOpen.value = false
  query.page = 0
  query.noteType = noteType
  router.push({ path: route.path, query })
}
</script>

<template>
  <div>
    <!-- slider -->
    <div
      class="fixed inset-x-0 border-t rounded-t border-purple-400 p-1 z-50 bottom-0 overflow-auto bg-white transform transition-transform duration-300 md:static md:h-full md:w-60 md:bottom-auto md:border-none md:shadow"
      :class="{ 'translate-y-full md:translate-0': !noteDrawerOpen }"
    >
      <div class="w-full border-b p-1 pb-1.5 flex justify-between">
        <div class="flex items-center flex-nowrap">
          <div class="i-uil:telegram-alt text-2xl transition-colors" />
          <div class="text-lg ml-2">
            {{ t('user-notification.notification.title') }}
          </div>
        </div>
        <div class="i-uil:times text-2xl transition-colors md:hidden" @click="noteDrawerOpen = false" />
      </div>
      <div class="mt-4 space-y-2">
        <div
          class="flex align-middle p-2 rounded-md cursor-pointer"
          :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': props.noteType === 'comment_reply' }"
          @click="changeNoteType('comment_reply')"
        >
          <div class="i-uil:comment-alt-dots inline align-middle text-xl text-center" />
          <div>
            {{ t('user-notification.notification.reply') }}
            <label v-if="props.listNoteCountTypesCommentReply" class="bg-red-500 text-white text-sm rounded-full px-2">{{
              (props.listNoteCountTypesCommentReply ? props.listNoteCountTypesCommentReply : 0)
                > 99 ? '99+' : props.listNoteCountTypesCommentReply
            }}</label>
          </div>
        </div>
        <div
          class="flex align-middle p-2 rounded-md text-gray-500 cursor-pointer"
          :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': props.noteType === 'at' }"
        >
          <div class="i-uil:at inline align-middle text-xl text-center" />
          <div>{{ t('user-notification.notification.at') }}</div>
        </div>
        <div
          class="flex align-middle p-2 rounded-md cursor-pointer"
          :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': props.noteType === 'system_message' }"
          @click="changeNoteType('system_message')"
        >
          <div class="i-uil:volume inline align-middle text-xl text-center" />
          <div>
            {{ t('user-notification.notification.system') }}
            <label v-if="props.listNoteCountTypesSystemMessage" class="bg-red-500 text-white text-sm rounded-full px-2">{{
              (props.listNoteCountTypesSystemMessage ? props.listNoteCountTypesSystemMessage : 0)
                > 99 ? '99+' : props.listNoteCountTypesSystemMessage
            }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- switch in mobile view -->
    <div
      class="md:hidden shadow fixed bottom-20 right-5 bg-gray-50 select-none p-2 rounded-full dark:bg-gray-800"
      :title="t('user-notification.notification.slide-open')" @click="noteDrawerOpen = true"
    >
      <div class="i-uil:chat text-2xl" />
      <label
        v-if="props.listNoteCountUnread"
        class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1"
      >{{ props.listNoteCountUnread > 99
        ? '99+' : props.listNoteCountUnread
      }}</label>
    </div>

    <PMask v-model:show="noteDrawerOpen" />
  </div>
</template>
