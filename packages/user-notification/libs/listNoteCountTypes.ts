import { computed, ref } from 'vue'

interface ListNoteCountTypes {
  systemMessage: number
  commentReply: number
}
export const listNoteCountTypes = ref<ListNoteCountTypes>({
  commentReply: 0,
  systemMessage: 0,
})
export const listNoteCountTypesSystemMessage = computed(() => listNoteCountTypes.value.systemMessage)
export const listNoteCountTypesCommentReply = computed(() => listNoteCountTypes.value.commentReply)
