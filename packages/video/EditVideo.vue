<template>
  <template v-if="video">
    <div class="mx-2">
      <div class="pl-2 text-gray-700 dark:text-gray-200 border-b border-purple-200 dark:border-gray-700">
        {{ t('video.edit-video.profile.profile') }}
      </div>
      <div class="mx-2 mt-1">
        <div class="flex flex-col gap-2">
          <div class="flex">
            <span>{{ t('video.edit-video.profile.title') }}</span><span class="ml-4 border-b border-purple-300 dark:border-gray-600" v-text="video.item.title" />
          </div>
          <div class="flex">
            <span>{{ t('video.edit-video.profile.ranks.rank') }}</span>
            <template v-if="auth.isAdmin">
              <PvSelect v-model="clearence" class="ml-4 w-52" :item-list="clearences" />
            </template>
            <template v-else>
              <span
                class="ml-4 border-b border-purple-400 dark:border-purple-800"
                v-text="clearences[Number(clearence)].name"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTimeoutFn } from '@vueuse/core'
import PvSelect from '@/ui/components/PvSelect.vue'
import { gql, useMutation, useQuery, useResult } from '@/graphql'
import type { Mutation, Query } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { useAuth } from '@/user'
import { startProgress, stopProgress } from '@/nprogress'

const { t } = useI18n()
const route = useRoute()
const auth = useAuth()

/* submit query */
const vid = computed(() => route.params.vid as string)
const { result, loading, refetch } = useQuery<Query>(
  gql`
    query ($vid: String!) {
      getVideo(para: { vid: $vid, lang: "CHS" }) {
        item {
          title
          desc
          uploadTime
          url
          repostType
        }
        meta {
          createdBy {
            id
            username
            desc
            image
            gravatar
          }
        }
        clearence
      }
    }
  `,
  {
    vid: vid.value,
  },
)

// sync process bar
watchEffect(() => {
  if (loading.value)
    startProgress()
  else
    stopProgress()
})

/* basic info */
const video = useResult(result, null, data => data?.getVideo)
// change title
watchEffect(() => {
  if (video.value)
    setSiteTitle(t('video.edit-video.title', { videoname: video.value.item.title }))
})

const clearence = ref('3')
const clearences = computed(() => [
  {
    name: t('video.edit-video.profile.ranks.0'),
    value: '0',
  },
  {
    name: t('video.edit-video.profile.ranks.1'),
    value: '1',
  },
  {
    name: t('video.edit-video.profile.ranks.2'),
    value: '2',
  },
  {
    name: t('video.edit-video.profile.ranks.3'),
    value: '3',
  },
])
watchEffect(() => {
  if (video.value)
    clearence.value = video.value.clearence.toString()
})

const loadingMutateClearence = ref(false)
const saving = computed(() => loadingMutateClearence.value)
const savingFailed = ref(false)
{
  const { mutate } = useMutation<Mutation>(
    gql`
      mutation ($clearence: Int!, $vid: String!) {
        setVideoClearence(para: { clearence: $clearence, vid: $vid })
      }
    `,
  )
  watch(clearence, (v, o) => {
    if (v !== o && v !== video.value?.clearence.toString()) {
      loadingMutateClearence.value = true
      mutate({
        vid: vid.value,
        clearence: Number(clearence.value),
      })
        .then(() => {
          loadingMutateClearence.value = false
          refetch()
        })
        .catch((e) => {
          // console.log(e)
          savingFailed.value = true
          loadingMutateClearence.value = false
        })
    }
  })
}
watchEffect(() => {
  if (saving.value && video.value) {
    setSiteTitle(t('video.edit-video.profile.edit.saving', { videoname: video.value.item.title }))
    const stop = watchEffect(() => {
      if (!saving.value && video.value) {
        stop()
        if (!savingFailed.value) {
          setSiteTitle(t('video.edit-video.profile.edit.saved', { videoname: video.value.item.title }))
          useTimeoutFn(() => {
            if (video.value)
              setSiteTitle(t('video.edit-video.title', { videoname: video.value.item.title }))
          }, 3000)
        }
        else {
          setSiteTitle(t('video.edit-video.profile.edit.failed', { videoname: video.value.item.title }))
        }
        savingFailed.value = false
      }
    })
  }
})
</script>
