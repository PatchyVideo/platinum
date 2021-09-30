<template>
  <template v-if="video"
    ><div class="mx-2">
      <div class="pl-2 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">基本信息</div>
      <div class="mx-2 mt-1">
        <div class="">
          <div>
            <span>视频标题</span
            ><span class="uline ml-4" v-text="video.item.title"></span>
          </div>
          <div>
            <span>视频等级</span
            ><template v-if="user.isAdmin"
              ><PvSelect v-model:selected="clearence" class="ml-4" :item-list="clearences" /></template
            ><template v-else><span class="uline ml-4" v-text="clearences[Number(clearence)].name"></span></template>
          </div>
        </div>
      </div></div
  ></template>
</template>

<script lang="ts" setup>
import PvSelect from '@/ui/components/PvSelect.vue'
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useMutation, useQuery, useResult } from '@vue/apollo-composable'
import NProgress from 'nprogress'
import { gql } from '@/graphql'
import type { Query, Mutation } from '@/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { useI18n } from 'vue-i18n'
import { useTimeoutFn } from '@vueuse/core'
import { user } from '@/user'

const { t } = useI18n()
const route = useRoute()

/* submit query */
const vid = computed(() => route.params.vid as string)
const { result, loading, fetchMore } = useQuery<Query>(
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
  }
)

/* sync process bar */
watchEffect(() => {
  if (loading.value) {
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    if (NProgress.isStarted()) NProgress.done()
  }
})

/* basic info */
const video = useResult(result, null, (data) => data?.getVideo)
// change title
watchEffect(() => {
  if (video.value) setSiteTitle('编辑视频 - ' + video.value.item.title)
})

const clearence = ref('3')
const clearences = computed(() => [
  {
    name: t('video.video.ranks.0'),
    value: '0',
  },
  {
    name: t('video.video.ranks.1'),
    value: '1',
  },
  {
    name: t('video.video.ranks.2'),
    value: '2',
  },
  {
    name: t('video.video.ranks.3'),
    value: '3',
  },
])
watchEffect(() => {
  if (video.value) {
    clearence.value = video.value.clearence.toString()
  }
})

const loadingMutateClearence = ref(false)
{
  const { mutate } = useMutation<Mutation>(
    gql`
      mutation ($clearence: Int!, $vid: String!) {
        setVideoClearence(para: { clearence: $clearence, vid: $vid })
      }
    `
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
          fetchMore({ variables: { vid: vid.value } })
        })
        .catch((e) => {
          console.log(e)
          savingFailed.value = true
          loadingMutateClearence.value = false
        })
    }
  })
}

const saving = computed(() => loadingMutateClearence.value)
const savingFailed = ref(false)
watchEffect(() => {
  if (saving.value && video.value) {
    setSiteTitle('保存中 - 编辑视频 - ' + video.value.item.title)
    const stop = watchEffect(() => {
      if (!saving.value && video.value) {
        stop()
        if (!savingFailed.value) {
          setSiteTitle('已保存! - 编辑视频 - ' + video.value.item.title)
          useTimeoutFn(() => {
            if (video.value) setSiteTitle('编辑视频 - ' + video.value.item.title)
          }, 3000)
        } else {
          setSiteTitle('保存失败 - 编辑视频 - ' + video.value.item.title)
        }
        savingFailed.value = false
      }
    })
  }
})
</script>

<style lang="postcss" scoped>
.uline {
  @apply border-b border-gray-400 dark:border-gray-500;
}
</style>
