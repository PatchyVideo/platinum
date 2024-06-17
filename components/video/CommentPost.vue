<script setup lang="ts">
import { CommentType } from '~/composables/graphql/dist/types'

// Define Props
const props = defineProps<{
  videoId?: string
  playlistId?: string
}>()

const emit = defineEmits<{
  (event: 'refetchThread', tid: string): void
}>()
// Reference to the comment input element
const inputEl = ref<HTMLDivElement | null>(null)

// Check submission status
const auth = useAuth() // Whether logged in
const inputContent = ref('') // Content
const commentParentId = computed(() => props.videoId ?? props.playlistId ?? null) // id

// Comment posting status and error message status
const postingComment = ref(false)
const postingCommentError = ref('')

const commentParentType = computed(() =>
  props.videoId ? CommentType.Video : props.playlistId ? CommentType.Playlist : null,
)
// Define the submit comment API
const { mutate: mutatePostComment } = useMutation(gql`
  mutation ($type: CommentType!, $id: String!, $content: String!) {
    postComment(para: { commentType: $type, targetId: $id, content: $content, filter: false }) {
      commentId
      thread {
        id
      }
    }
  }
`)

async function onSubmit() {
  // Prevent submission if not logged in
  if (!(await auth).isLogin)
    return
  // Prevent submission if no content is provided
  if (!inputContent.value)
    return
  // Prevent submission if no parent ID for the comment thread is provided
  if (!commentParentId.value)
    return
  postingComment.value = true
  const res = await mutatePostComment({
    type: commentParentType.value!,
    id: commentParentId.value,
    content: inputContent.value,
  }).catch((e) => {
    postingComment.value = false
    postingCommentError.value = String(e)
  })
  postingComment.value = false

  // Do nothing if the comment submission failed
  if (!res?.data?.postComment.commentId)
    return

  // If the comment submission is successful, reset the input and refetch the thread
  onReset()
  emit('refetchThread', res.data.postComment.thread.id.toHexString())
}

// Handler for input content changes
function onInput() {
  if (!inputEl.value)
    return
  // TODO read html
  inputContent.value = inputEl.value.innerText
}
// Reset the comment input
function onReset() {
  if (!inputEl.value)
    return
  inputEl.value.innerHTML = ''
  inputContent.value = ''
}
</script>

<template>
  <div class="w-full max-w-75ch rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
    <!-- Title section with edit state and preview toggle button -->
    <div
      class="flex flex-row flex-nowrap justify-between items-center px-1 py-0.5 w-full text-sm border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
    >
      <div class="flex flex-row flex-nowrap items-center text-gray-800 dark:text-gray-300">
        富文本编辑正在制作中
      </div>
    </div>
    <!-- Edit area, hidden when preview is enabled -->
    <div v-show="!enablePreview" class="w-full p-0.5 -my-24">
      <div
        ref="inputEl" class="prose dark:prose-invert break-all min-h-24 my-24 focus-visible:outline-none"
        contenteditable="true" @input="onInput"
      />
    </div>

    <div
      class="px-1 py-0.5 w-full text-xs text-gray-700 dark:text-gray-300 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
    >
      请遵守<a
        class="text-blue-600 dark:text-blue-500" target="_blank" rel="noopener noreferrer"
        href="https://patchyvideo.wiki/zh/Comments"
      >评论规则</a>！评论区支持部分 Markdown 语法，发布评论前记得先登陆哦!
    </div>
  </div>

  <!-- Comment submission form -->
  <form class="flex flex-row items-center gap-2 mt-1" @submit.prevent="onSubmit" @reset.prevent="onReset">
    <!-- Submit button -->
    <button
      type="submit"
      class="px-4 py-1 rounded-md text-purple-800 dark:text-white border-2 border-purple-300 dark:border-indigo-700"
    >
      发表
    </button>
    <!-- Reset button -->
    <button type="reset" class="px-4 py-1 rounded-md border-2 border-gray-300 dark:border-gray-600">
      清空
    </button>
    <!-- Comment posting indicator -->
    <div v-if="postingComment">
      <i class="i-uil:spinner-alt animate-spin" />正在发表评论……
    </div>
    <!-- Error message if comment posting fails -->
    <div v-if="postingCommentError">
      评论发表失败：{{ postingCommentError }}
    </div>
  </form>
</template>

<style scoped>
</style>
