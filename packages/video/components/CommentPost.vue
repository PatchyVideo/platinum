<template>
  <div class="w-full max-w-75ch rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
    <div
      class="flex flex-row flex-nowrap justify-between items-center px-1 py-0.5 w-full text-sm border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
    >
      <div class="flex flex-row flex-nowrap items-center text-gray-800 dark:text-gray-300">
        富文本编辑正在制作中
      </div>
      <div class="flex flex-row flex-nowrap items-center">
        <button @click="togglePreview" v-text="enablePreview ? '编辑' : '预览'" />
      </div>
    </div>
    <div v-show="!enablePreview" class="w-full p-0.5 -my-24">
      <div
        ref="inputEl"
        class="prose dark:prose-invert break-all min-h-24 my-24 focus-visible:outline-none"
        contenteditable="true"
        @input="onInput"
      />
    </div>
    <MarkdownCommentBlock v-if="enablePreview && inputEl" class="p-0.5" :text="inputContent" />
    <div
      class="px-1 py-0.5 w-full text-xs text-gray-700 dark:text-gray-300 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
    >
      请遵守<a
        class="text-blue-600 dark:text-blue-500"
        target="_blank"
        rel="noopener noreferrer"
        href="https://patchyvideo.wiki/zh/Comments"
      >评论规则</a>！评论区支持部分 Markdown 语法，点击右上角的预览按钮预览渲染效果。
    </div>
  </div>
  <form class="flex flex-row items-center gap-2 mt-1" @submit.prevent="onSubmit" @reset.prevent="onReset">
    <button
      type="submit"
      class="px-4 py-1 rounded-md text-purple-800 dark:text-white border-2 border-purple-300 dark:border-indigo-700"
    >
      发表
    </button>
    <button type="reset" class="px-4 py-1 rounded-md border-2 border-gray-300 dark:border-gray-600">
      清空
    </button>
    <div v-if="postingComment">
      <i class="i-uil:spinner-alt animate-spin" />正在发表评论……
    </div>
    <div v-if="postingCommentError">
      评论发表失败：{{ postingCommentError }}
    </div>
  </form>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import MarkdownCommentBlock from '@/markdown/components/MarkdownCommentBlock.vue'
import type { Mutation } from '@/graphql'
import { gql, useMutation } from '@/graphql'
import { CommentType } from '@/graphql/__generated__/graphql'
import { useAuth } from '@/user'

const props = defineProps<{
  videoId?: string
  playlistId?: string
}>()
const emit = defineEmits<{
  (event: 'refetchThread', tid: string): void
}>()

const auth = useAuth()

// submit mutation
const commentParentType = computed(() =>
  props.videoId ? CommentType.Video : props.playlistId ? CommentType.Playlist : null,
)
const commentParentId = computed(() => props.videoId ?? props.playlistId ?? null)
const { mutate: mutatePostComment } = useMutation<Mutation>(gql`
  mutation ($type: CommentType!, $id: String!, $content: String!) {
    postComment(para: { commentType: $type, targetId: $id, content: $content, filter: false }) {
      commentId
      thread {
        id
      }
    }
  }
`)

// comment input
const inputEl = ref<HTMLDivElement | null>(null)
const inputContent = ref('')
const onInput = () => {
  if (!inputEl.value)
    return
  // TODO read html
  // inputContent.value = inputEl.value.innerHTML
  inputContent.value = inputEl.value.innerText
}
const onReset = () => {
  if (!inputEl.value)
    return
  inputEl.value.innerHTML = ''
  inputContent.value = ''
}
const postingComment = ref(false)
const postingCommentError = ref('')
const onSubmit = async () => {
  // reject if not login
  if (!auth.isLogin)
    return
  // reject if no content provided
  if (!inputContent.value)
    return
  // reject if the comment thread parent id isn't provided
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

  // failed
  if (!res?.data?.postComment.commentId)
    return

  // success
  onReset()
  emit('refetchThread', res.data.postComment.thread.id.toHexString())
}

// preview
const enablePreview = ref(false)
const togglePreview = () => {
  if (!inputEl.value)
    return
  enablePreview.value = !enablePreview.value
}
</script>
