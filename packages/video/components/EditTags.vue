<template>
  <div class="flex flex-col gap-2">
    <!-- Current -->
    <div>
      <div class="flex justify-between">
        <div class="ml-1 font-light">
          现有标签
        </div>
        <div class="flex flex-row gap-1 items-center">
          <div v-if="submitting" class="text-gray-800 dark:text-gray-200">
            正在提交<div class="inline-block i-uil:spinner-alt animate-spin" />
          </div>
          <button v-else-if="isEdited" class="text-blue-500" @click="submit">
            提交修改
          </button>
          <!-- Undo / Redo -->
          <button
            class="inline i-uil:redo text-lg -scale-x-full"
            :class="{ 'text-gray-400 dark:text-gray-600': !editStack.length }"
            @click="undo"
          />
          <button
            class="inline i-uil:redo text-lg"
            :class="{ 'text-gray-400 dark:text-gray-600': !redoStack.length }"
            @click="redo"
          />
        </div>
      </div>
      <div class="flex gap-1 flex-row flex-wrap">
        <RoundTag
          v-for="tag in editTags"
          :key="tag.id.toHexString()"
          :tag="tag"
          removeable
          @remove="() => onTagRemove(tag.tagid)"
        />
        <RoundTag
          v-for="tagid in pendingTags"
          :key="tagid"
          :tag="{
            category: TagCategoryEnum.General,
            languages: [
              {
                __typename: 'MultilingualMapping',
                lang: 'ENG',
                value: `id<${tagid.toString()}>`,
              },
            ],
          }"
        />
      </div>
    </div>
    <!-- Adding -->
    <div>
      <div class="ml-1 font-light">
        加入标签
      </div>
      <AutoComplete
        v-model:keyword="editTagSearchKeyword"
        :teleport-result="editTagSearchResult"
        @suggestion-click="onSuggestionClick"
      />
      <div ref="editTagSearchResult" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, shallowRef, watchEffect } from 'vue'
import type { AutoCompleteResult } from '@/search/components/AutoComplete.vue'
import AutoComplete from '@/search/components/AutoComplete.vue'
import RoundTag from '@/tag/components/RoundTag.vue'
import type { Query, schema } from '@/graphql'
import { TagCategoryEnum, gql, useApolloClient, useMutation } from '@/graphql'

const props = defineProps<{
  vid: string
  tags: schema.Video['tags']
}>()
const emit = defineEmits<{
  (event: 'refetch'): void
}>()

const { resolveClient } = useApolloClient()

const editTags = ref<schema.Video['tags']>([])
const pendingTags = ref<number[]>([])
watchEffect(() => {
  editTags.value = [...props.tags]
})
const isEdited = computed(() => {
  if (editTags.value.length !== props.tags.length)
    return true
  const originalIds = props.tags.map(tag => tag.tagid).sort((a, b) => a - b)
  const editedIds = editTags.value.map(tag => tag.tagid).sort((a, b) => a - b)
  return originalIds.some((id, i) => id !== editedIds[i])
})
const addTag = async (tagid: number): Promise<boolean> => {
  if (editTags.value.find(tag => tag.tagid === tagid) || pendingTags.value.includes(tagid))
    return false
  pendingTags.value.push(tagid)
  const client = resolveClient()
  const res = await client
    .query<Query>({
      query: gql`
        query ($tid: Int!) {
          getTagObjects(para: { tagid: [$tid] }) {
            __typename
            id
            tagid
            category
            languages {
              lang
              value
            }
          }
        }
      `,
      variables: {
        tid: tagid,
      },
    })
    .catch(() => null)
  pendingTags.value.splice(pendingTags.value.indexOf(tagid), 1)
  const tag = res?.data?.getTagObjects[0]
  if (!tag)
    return false
  editTags.value.push(tag)
  return true
}
const removeTag = (tagid: number): boolean => {
  const index = editTags.value.findIndex(tag => tag.tagid === tagid)
  if (index === -1)
    return false
  editTags.value.splice(index, 1)
  return true
}

interface EditItemAdd {
  type: 'add'
  tagid: number
}
interface EditItemRemove {
  type: 'remove'
  tagid: number
}
type EditItem = EditItemAdd | EditItemRemove

const editStack = reactive<EditItem[]>([])
const redoStack = reactive<EditItem[]>([])
const undo = () => {
  if (editStack.length > 0) {
    const item = editStack.pop()!
    redoStack.push(item)
    if (item.type === 'add')
      removeTag(item.tagid)
    else
      addTag(item.tagid)
  }
}
const redo = () => {
  if (redoStack.length > 0) {
    const item = redoStack.pop()!
    editStack.push(item)
    if (item.type === 'add')
      addTag(item.tagid)
    else
      removeTag(item.tagid)
  }
}
const pushEdit = (item: EditItem) => {
  editStack.push(item)
  redoStack.length = 0
}

const editTagSearchKeyword = ref('')
const editTagSearchResult = shallowRef<HTMLDivElement>()

const onTagRemove = (tagid: number) => {
  if (removeTag(tagid))
    pushEdit({ type: 'remove', tagid })
}
const onSuggestionClick = async (item: AutoCompleteResult) => {
  if (typeof item.id !== 'number')
    return
  if (await addTag(item.id))
    pushEdit({ type: 'add', tagid: item.id })
}

const { mutate } = useMutation(gql`
  mutation ($vid: String!, $tags: [Int!]!) {
    editVideoTagIds(para: { editBehaviour: "replace", tags: $tags, videoId: $vid }) {
      tagid
    }
  }
`)
const submitting = ref(false)
const submissionError = ref('')
const submit = async () => {
  if (!isEdited.value)
    return
  submitting.value = true
  await mutate({
    vid: props.vid,
    tags: editTags.value.map(tag => tag.tagid),
  }).catch((e) => {
    submissionError.value = e.message
  })
  emit('refetch')
  submitting.value = false
}
</script>
