<script lang="ts" setup>
import type { Query } from '@/composables/graphql'
import type { CommentItemType } from '@/composables/comment/comment'

const props = defineProps<{
  tid: string
}>()

// const { t } = useI18n()

const { data } = await useAsyncQuery<Query>(
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
    tid: props.tid,
  },
)
const getThread = computed(() => data.value!.getThread)

// comments
const comments = computed(
  () =>
    (getThread.value?.comments
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
      ) as CommentItemType[]) ?? [],
)
const commentChildrenExpaneded = reactive<Record<string, boolean>>({})
function sliceCommentChildren(id: string, children: CommentItemType[]) {
  return commentChildrenExpaneded[id] ? children : children.slice(0, 3)
}
const commentHiddenOverrides = reactive<Record<string, boolean>>({})
</script>

<template>
  <div class="space-y-2">
    <VideoDetailModuleTitle :text="`共 ${getThread.count} 条评论`" />
    <div class="divide-y divide-purple-100">
      <div v-for="item in comments" :key="item.id" class="py-3 md:py-6 space-y-2">
        <!-- Main comment -->
        <CommentItem v-model:hidden="commentHiddenOverrides[item.id]" :comment="item" />

        <!-- Child comment -->
        <div v-if="item.children?.length" class="ml-10 md:ml-12 divide-y divide-purple-100">
          <CommentItem
            v-for="child in item.children
              ? sliceCommentChildren(item.id, item.children)
              : undefined"
            :key="child.id"
            v-model:hidden="commentHiddenOverrides[child.id]"
            class="py-1 md:py-2"
            :comment="child"
            child
          />
        </div>

        <!-- Child comment expanded button -->
        <div
          v-if="item.children && item.children.length > 3"
          class="flex flex-row flex-nowrap pl-10 md:pl-12 cursor-pointer"
          @click="
            () => {
              commentChildrenExpaneded[item.id] = !commentChildrenExpaneded[item.id]
            }
          "
        >
          <div
            v-if="commentChildrenExpaneded[item.id]"
            class="flex flex-row text-sm items-center text-purple-300 text-xs underline cursor-pointer"
          >
            收起楼中楼
          </div>
          <div v-else class="flex flex-row text-sm items-center text-purple-300 text-xs underline cursor-pointer">
            {{ `展开共${item.children.length}条评论` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
