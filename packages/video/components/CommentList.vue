<template>
  <!-- Video Comments -->
  <div class="mx-1 md:mx-2 lg:mx-4">
    <template v-if="loadingThread && !threadDisabled">
      正在加载评论区<i class="i-uil:spinner-alt text-lg animate-spin" />
    </template>
    <template v-else>
      共 {{ commentThread?.count || 0 }} 条评论
    </template>
  </div>
  <div v-if="auth.isLogin && screenSizes.md" class="flex flex-row flex-nowrap py-2">
    <div class="flex-none mx-2">
      <UserAvatar
        class="inline-block w-8 md:w-12 h-8 md:h-12 rounded-full object-cover"
        :image="auth.image"
        :email="auth.email"
        :alt="auth.username"
        hide-title
      />
    </div>
    <div class="flex-1">
      <div>
        <span class="text-sm font-medium" v-text="auth.username" /><span class="text-xs text-gray-500 dark:text-gray-400"><span class="ml-1.5">发表一条友善的评论</span></span>
      </div>
      <CommentPost :video-id="videoId" :playlist-id="playlistId" @refetch-thread="onRefetchThread" />
    </div>
  </div>
  <div v-for="comment in comments" :key="comment.id.toHexString()" class="py-2">
    <div class="flex flex-row flex-nowrap">
      <div class="flex-none mx-2">
        <RouterLink :to="`/user/${comment.meta.createdBy.id.toHexString()}`">
          <UserAvatarPopper :uid="comment.meta.createdBy.id.toHexString()">
            <UserAvatar
              class="inline-block w-8 md:w-12 h-8 md:h-12 rounded-full object-cover"
              :image="comment.meta.createdBy.image"
              :gravatar="comment.meta.createdBy.gravatar"
              :alt="comment.meta.createdBy.username"
              hide-title
            />
          </UserAvatarPopper>
        </RouterLink>
        <div
          v-if="comment.children?.length ?? 0 > 0"
          class="w-px h-[calc(100%-2rem)] mt-1 mx-auto bg-gray-300 dark:bg-gray-700"
        />
      </div>
      <div>
        <div>
          <RouterLink :to="`/user/${comment.meta.createdBy.id.toHexString()}`">
            <span class="text-sm font-medium" v-text="comment.meta.createdBy.username" />
          </RouterLink>
          <span class="text-xs text-gray-500 dark:text-gray-300">
            <Suspense><RelativeDate class="ml-1.5" :date="comment.meta.createdAt" /></Suspense>
            <span v-if="comment.edited" class="ml-1.5">edited</span>
          </span>
        </div>
        <div
          v-if="commentHiddenOverrides[comment.id.toHexString()] ?? comment.hidden"
          class="min-h-6 text-gray-600 dark:text-gray-400"
        >
          此评论已被折叠
          <span
            class="text-blue-500 dark:text-blue-600 cursor-pointer"
            @click="() => commentHiddenOverrides[comment.id.toHexString()] = false"
          >显示评论</span>
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
          />
          <div
            v-else
            class="w-px bg-gray-300 dark:bg-gray-700"
            :class="isCommentChildrenCollapsed(comment) ? 'h-3' : 'h-5'"
          />
          <div
            class="w-3 md:w-5 h-px bg-gray-300 dark:bg-gray-700"
            :class="isCommentChildrenCollapsed(comment) ? 'mt-3' : 'mt-5'"
          />
        </div>
      </div>
      <div v-if="!isCommentChildrenCollapsed(comment)" class="flex-none mt-1 mr-2">
        <RouterLink :to="`/user/${child.meta.createdBy.id.toHexString()}`">
          <UserAvatarPopper :uid="child.meta.createdBy.id.toHexString()">
            <UserAvatar
              class="inline-block w-8 h-8 rounded-full object-cover"
              :image="child.meta.createdBy.image"
              :gravatar="child.meta.createdBy.gravatar"
              :alt="child.meta.createdBy.username"
              hide-title
            />
          </UserAvatarPopper>
        </RouterLink>
      </div>
      <div class="flex" :class="{ 'flex-col': !isCommentChildrenCollapsed(comment) }">
        <div v-if="isCommentChildrenCollapsed(comment)" class="mr-1">
          <RouterLink :to="`/user/${child.meta.createdBy.id.toHexString()}`">
            <span class="text-sm font-medium" v-text="child.meta.createdBy.username" />
          </RouterLink>:
        </div>
        <div v-else>
          <RouterLink :to="`/user/${child.meta.createdBy.id.toHexString()}`">
            <span class="text-sm font-medium" v-text="child.meta.createdBy.username" />
          </RouterLink><Suspense>
            <RelativeDate class="text-xs text-gray-500 dark:text-gray-300 ml-2" :date="child.meta.createdAt" />
          </Suspense>
        </div>
        <div
          v-if="commentHiddenOverrides[comment.id.toHexString()] ?? comment.hidden"
          class="min-h-8 text-sm text-gray-600 dark:text-gray-400"
        >
          此评论已被折叠
          <span
            class="text-blue-500 dark:text-blue-600 cursor-pointer"
            @click="() => commentHiddenOverrides[comment.id.toHexString()] = false"
          >显示评论</span>
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
          <div class="w-px h-3 bg-gray-300 dark:bg-gray-700" />
          <div class="mt-3 w-3 md:w-5 h-px bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
      <div
        v-if="commentChildrenExpaneded[comment.id.toHexString()]"
        class="flex flex-row text-sm items-center text-blue-600 dark:text-blue-300"
      >
        <div class="i-uil:arrow-to-bottom text-base transform rotate-180" />
        收起楼中楼
      </div>
      <div v-else class="flex flex-row text-sm items-center text-blue-600 dark:text-blue-300">
        <div class="i-uil:arrow-from-top text-base" />
        展开楼中楼
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import CommentPost from './CommentPost.vue'
import MarkdownCommentBlock from '@/markdown/components/MarkdownCommentBlock.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import UserAvatarPopper from '@/user/components/UserAvatarPopper.vue'
import type { Query, schema } from '@/graphql'
import { gql, useQuery, useResult } from '@/graphql'
import { screenSizes } from '@/css'
import { useAuth } from '@/user'

const props = defineProps<{
  commentThreadId: string
  videoId?: string
  playlistId?: string
}>()

const auth = useAuth()

const threadDisabled = computed(() => !props.commentThreadId)
const threadIdOverride = ref<string | null>(null)
const tid = computed(() => threadIdOverride.value ?? props.commentThreadId)

const {
  result,
  loading: loadingThread,
  refetch: refetchThread,
  start,
  stop,
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
    tid,
  },
  {
    enabled: !threadDisabled.value,
  },
)
watch(threadDisabled, (n) => {
  if (n)
    stop()
  else start()
})
const commentThread = useResult(result, null, data => data?.getThread)

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
      ?.filter(v => v.content && v.meta.createdBy && !v.deleted)
      // filter children
      .map(comment => ({
        ...comment,
        children: comment.children
          // comment needs to have content & not be deleted
          ?.filter(v => v.content && v.meta.createdBy && !v.deleted)
          // sort by createdAt, latest first
          .sort((a, b) => +b.meta.createdAt - +a.meta.createdAt),
      }))
      // filter out empty comments
      .filter(v => !!v)
      // sort by createdAt, latest first
      .sort(
        (a, b) => +b.meta.createdAt + (b.pinned ? 1 << 32 : 0) - (+a.meta.createdAt + (a.pinned ? 1 << 32 : 0)),
      ) as Comment[]) ?? [],
)
const commentChildrenExpaneded = reactive<Record<string, boolean>>({})
const sliceCommentChildren = (id: string, children: Comment[]) =>
  commentChildrenExpaneded[id] ? children : children.slice(0, 3)
const isCommentChildrenCollapsed = (comment: Comment) =>
  comment.children && comment.children.length > 3 && !commentChildrenExpaneded[comment.id.toHexString()]
const commentHiddenOverrides = reactive<Record<string, boolean>>({})

const onRefetchThread = (newThreadId: string) => {
  if (newThreadId !== tid.value) {
    // changing the variable will trigger a refetch, so no need to do a refetchThread here
    threadIdOverride.value = newThreadId
  }
  else {
    refetchThread()
  }
}
</script>
