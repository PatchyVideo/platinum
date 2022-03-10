<template>
  <!-- Video Comments -->
  <div class="mx-1 md:mx-2 lg:mx-4">
    <template v-if="loadingThread">正在加载评论区<i class="i-uil-spinner-alt text-lg animate-spin"></i></template>
    <template v-else>共 {{ commentThread?.count }} 条评论</template>
  </div>
  <div v-if="isLogin === IsLogin.yes && screenSizes.md" class="py-2">
    <div class="flex flex-row flex-nowrap">
      <div class="flex-none mx-2">
        <UserAvatar
          class="inline-block w-8 md:w-12 h-8 md:h-12 rounded-full object-cover"
          :image="user.avatar"
          :email="user.email"
          :alt="user.name"
          hide-title
        />
      </div>
      <div class="flex-1">
        <div>
          <span class="text-sm font-medium" v-text="user.name"></span
          ><span class="text-xs text-gray-500 dark:text-gray-400"><span class="ml-1.5">发表一条友善的评论</span></span>
        </div>
        <div class="w-full max-w-75ch rounded border border-gray-300 dark:border-gray-600 overflow-hidden">
          <div
            class="flex flex-row flex-nowrap justify-between items-center px-1 py-0.5 w-full text-sm border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
          >
            <div class="flex flex-row flex-nowrap items-center text-gray-800 dark:text-gray-300">
              富文本编辑正在制作中
            </div>
            <div class="flex flex-row flex-nowrap items-center">
              <button @click="togglePreview" v-text="enablePreview ? '编辑' : '预览'"></button>
            </div>
          </div>
          <div v-show="!enablePreview" class="w-full p-0.5 -my-24">
            <div
              ref="inputEl"
              class="prose dark:prose-invert break-all min-h-24 my-24 focus-visible:outline-none"
              contenteditable="true"
              @input="onInput"
            ></div>
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
              >评论规则</a
            >！评论区支持部分 Markdown 语法，点击右上角的预览按钮预览渲染效果。
          </div>
        </div>
        <form class="flex flex-row items-center gap-2 mt-1" @submit.prevent="onSubmit" @reset.prevent="onReset">
          <button
            type="submit"
            class="px-4 py-1 rounded-md text-purple-800 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-800"
          >
            发表
          </button>
          <button type="reset" class="px-4 py-1 rounded-md border-2 border-gray-300 dark:border-gray-600">清空</button>
          <div v-if="postingComment"><i class="i-uil-spinner-alt animate-spin"></i>正在发表评论……</div>
          <div v-if="postingCommentError">评论发表失败：{{ postingCommentError }}</div>
        </form>
      </div>
    </div>
  </div>
  <div v-for="comment in comments" :key="comment.id.toHexString()" class="py-2">
    <div class="flex flex-row flex-nowrap">
      <div class="flex-none mx-2">
        <RouterLink :to="'/user/' + comment.meta.createdBy.id.toHexString()">
          <UserAvatarPopper :uid="comment.meta.createdBy.id.toHexString()"
            ><UserAvatar
              class="inline-block w-8 md:w-12 h-8 md:h-12 rounded-full object-cover"
              :image="comment.meta.createdBy.image"
              :gravatar="comment.meta.createdBy.gravatar"
              :alt="comment.meta.createdBy.username"
              hide-title
          /></UserAvatarPopper>
        </RouterLink>
        <div
          v-if="comment.children?.length ?? 0 > 0"
          class="w-px h-[calc(100%-2rem)] mt-1 mx-auto bg-gray-300 dark:bg-gray-700"
        ></div>
      </div>
      <div>
        <div>
          <RouterLink :to="'/user/' + comment.meta.createdBy.id.toHexString()"
            ><span class="text-sm font-medium" v-text="comment.meta.createdBy.username"></span></RouterLink
          ><span class="text-xs text-gray-500 dark:text-gray-300"
            ><Suspense><RelativeDate class="ml-1.5" :date="comment.meta.createdAt" /></Suspense
            ><span v-if="comment.edited" class="ml-1.5">edited</span></span
          >
        </div>
        <div
          v-if="commentHiddenOverrides[comment.id.toHexString()] ?? comment.hidden"
          class="min-h-6 text-gray-600 dark:text-gray-400"
        >
          此评论已被折叠
          <span
            class="text-blue-500 dark:text-blue-600 cursor-pointer"
            @click="() => (commentHiddenOverrides[comment.id.toHexString()] = false)"
            >显示评论</span
          >
        </div>
        <MarkdownCommentBlock v-else class="min-h-6" :text="comment.content" size="md" />
      </div>
    </div>
    <div
      v-for="(child, cindex) in comment.children
        ? sliceCommentChildren(comment.id.toHexString(), comment.children)
        : undefined"
      :key="child.id.toHexString()"
      class="flex flex-row flex-nowrap"
    >
      <div class="flex-none w-10 md:w-14">
        <div class="flex flex-row w-full h-full ml-6 md:ml-8">
          <div
            v-if="comment.children!.length > 3 || cindex !== comment.children!.length! - 1"
            class="w-px h-full bg-gray-300 dark:bg-gray-700"
          ></div>
          <div
            v-else
            class="w-px bg-gray-300 dark:bg-gray-700"
            :class="isCommentChildrenCollapsed(comment) ? 'h-3' : 'h-5'"
          ></div>
          <div
            class="w-3 md:w-5 h-px bg-gray-300 dark:bg-gray-700"
            :class="isCommentChildrenCollapsed(comment) ? 'mt-3' : 'mt-5'"
          ></div>
        </div>
      </div>
      <div v-if="!isCommentChildrenCollapsed(comment)" class="flex-none mt-1 mr-2">
        <RouterLink :to="'/user/' + child.meta.createdBy.id.toHexString()">
          <UserAvatarPopper :uid="child.meta.createdBy.id.toHexString()"
            ><UserAvatar
              class="inline-block w-8 h-8 rounded-full object-cover"
              :image="child.meta.createdBy.image"
              :gravatar="child.meta.createdBy.gravatar"
              :alt="child.meta.createdBy.username"
              hide-title
          /></UserAvatarPopper>
        </RouterLink>
      </div>
      <div class="flex" :class="{ 'flex-col': !isCommentChildrenCollapsed(comment) }">
        <div v-if="isCommentChildrenCollapsed(comment)" class="mr-1">
          <RouterLink :to="'/user/' + child.meta.createdBy.id.toHexString()"
            ><span class="text-sm font-medium" v-text="child.meta.createdBy.username"></span></RouterLink
          >:
        </div>
        <div v-else>
          <RouterLink :to="'/user/' + child.meta.createdBy.id.toHexString()"
            ><span class="text-sm font-medium" v-text="child.meta.createdBy.username"></span></RouterLink
          ><Suspense
            ><RelativeDate class="text-xs text-gray-500 dark:text-gray-300 ml-2" :date="child.meta.createdAt"
          /></Suspense>
        </div>
        <div
          v-if="commentHiddenOverrides[comment.id.toHexString()] ?? comment.hidden"
          class="min-h-8 text-sm text-gray-600 dark:text-gray-400"
        >
          此评论已被折叠
          <span
            class="text-blue-500 dark:text-blue-600 cursor-pointer"
            @click="() => (commentHiddenOverrides[comment.id.toHexString()] = false)"
            >显示评论</span
          >
        </div>
        <MarkdownCommentBlock v-else class="min-h-6" :text="child.content" size="sm" />
      </div>
    </div>
    <div
      v-if="comment.children && comment.children.length > 3"
      class="flex flex-row flex-nowrap cursor-pointer"
      @click="
        () => {
          commentChildrenExpaneded[comment.id.toHexString()] = !commentChildrenExpaneded[comment.id.toHexString()]
        }
      "
    >
      <div class="flex-none w-10 md:w-14">
        <div class="flex flex-row w-full h-full ml-6 md:ml-8">
          <div class="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
          <div class="mt-3 w-3 md:w-5 h-px bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
      <div
        v-if="commentChildrenExpaneded[comment.id.toHexString()]"
        class="flex flex-row text-sm items-center text-blue-600 dark:text-blue-300"
      >
        <div class="i-uil-arrow-to-bottom text-base transform rotate-180"></div>
        收起楼中楼
      </div>
      <div v-else class="flex flex-row text-sm items-center text-blue-600 dark:text-blue-300">
        <div class="i-uil-arrow-from-top text-base"></div>
        展开楼中楼
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import MarkdownCommentBlock from '@/markdown/components/MarkdownCommentBlock.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import UserAvatarPopper from '@/user/components/UserAvatarPopper.vue'
import { computed, reactive, ref } from 'vue'
import type { Query, schema } from '@/graphql'
import { useMutation } from '@/graphql'
import { gql, useQuery, useResult } from '@/graphql'
import { IsLogin, isLogin, user } from '@/user'
import { CommentType } from '@/graphql/__generated__/graphql'
import { screenSizes } from '@/css'

const props = defineProps<{
  commentThreadId: string
  videoId?: string
  playlistId?: string
}>()

const {
  result,
  loading: loadingThread,
  refetch: refetchThread,
} = useQuery<Query>(
  gql`
    query ($tid: String!) {
      getThread(para: { threadId: $tid }) {
        count
        comments {
          id
          content
          hidden
          deleted
          edited
          meta {
            createdAt
            createdBy {
              id
              username
              image
              gravatar
              desc
            }
          }
          children {
            id
            content
            hidden
            deleted
            edited
            meta {
              createdAt
              createdBy {
                id
                username
                image
                gravatar
                desc
              }
            }
          }
        }
      }
    }
  `,
  {
    tid: props.commentThreadId,
  }
)
const commentThread = useResult(result, null, (data) => data?.getThread)

// comments
type Comment = Omit<schema.Comment, 'content' | 'meta' | 'deleted' | 'children'> & {
  content: NonNullable<schema.Comment['content']>
  meta: schema.Meta & { createdBy: NonNullable<schema.Meta['createdBy']> }
  deleted: false
  children?: Comment[]
}
const comments = computed(
  () =>
    (commentThread.value?.comments
      // comment needs to have content & not be deleted
      ?.filter((v) => v.content && v.meta.createdBy && !v.deleted)
      // filter children
      .map((comment) => ({
        ...comment,
        children: comment.children
          // comment needs to have content & not be deleted
          ?.filter((v) => v.content && v.meta.createdBy && !v.deleted)
          // sort by createdAt, latest first
          .sort((a, b) => +b.meta.createdAt - +a.meta.createdAt),
      }))
      // filter out empty comments
      .filter((v) => !!v)
      // sort by createdAt, latest first
      .sort(
        (a, b) => +b.meta.createdAt + (b.pinned ? 1 << 32 : 0) - (+a.meta.createdAt + (a.pinned ? 1 << 32 : 0))
      ) as Comment[]) ?? []
)
const commentChildrenExpaneded = reactive<Record<string, boolean>>({})
const sliceCommentChildren = (id: string, children: Comment[]) =>
  commentChildrenExpaneded[id] ? children : children.filter((v) => !v.hidden).slice(0, 3)
const isCommentChildrenCollapsed = (comment: Comment) =>
  comment.children && comment.children.length > 3 && !commentChildrenExpaneded[comment.id.toHexString()]
const commentHiddenOverrides = reactive<Record<string, boolean>>({})

// submit mutation
const commentParentType = computed(() =>
  props.videoId ? CommentType.Video : props.playlistId ? CommentType.Playlist : null
)
const commentParentId = computed(() => props.videoId ?? props.playlistId ?? null)
const { mutate: mutatePostComment } = useMutation(gql`
  mutation ($type: CommentType!, $id: String!, $content: String!) {
    postComment(para: { commentType: $type, targetId: $id, content: $content, filter: false }) {
      commentId
    }
  }
`)

// comment input
const inputEl = ref<HTMLDivElement | null>(null)
const inputContent = ref('')
const onInput = () => {
  if (!inputEl.value) return
  // TODO read html
  // inputContent.value = inputEl.value.innerHTML
  inputContent.value = inputEl.value.innerText
}
const onReset = () => {
  if (!inputEl.value) return
  inputEl.value.innerHTML = ''
  inputContent.value = ''
}
const postingComment = ref(false)
const postingCommentError = ref('')
const onSubmit = async () => {
  // reject if not login
  if (!isLogin.value) return
  // reject if no content provided
  if (!inputContent.value) return
  // reject if the comment thread parent id isn't provided
  if (!commentParentId.value) return

  postingComment.value = true
  await mutatePostComment({
    type: commentParentType.value!,
    id: commentParentId.value,
    content: inputContent.value,
  }).catch((e) => {
    postingComment.value = false
    postingCommentError.value = String(e)
  })
  postingComment.value = false

  onReset()
  refetchThread()
}

// preview
const enablePreview = ref(false)
const togglePreview = () => {
  if (!inputEl.value) return
  enablePreview.value = !enablePreview.value
  console.log(inputContent.value)
}
</script>
