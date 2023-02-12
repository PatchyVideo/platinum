<template>
  <LayoutDefault>
    <!-- Introduction -->
    <i18n-t
      class="mx-4 my-3 p-2 rounded-lg text-center bg-purple-50 ring-2 ring-purple-300 dark:bg-gray-800 dark:ring-gray-600"
      keypath="home.home.intro.template"
      tag="div"
    >
      <template #medium>
        <span class="font-medium">{{ t('home.home.intro.medium') }}</span>
      </template>
      <template #old>
        <a
          class="text-purple-800 dark:text-purple-300"
          href="https://patchyvideo.com/"
          target="_blank"
          rel="noopener noreferrer"
        >{{ t('home.home.intro.old') }}</a>
      </template>
      <template #follow>
        <a
          class="text-purple-800 dark:text-purple-300"
          href="https://space.bilibili.com/515657675"
          target="_blank"
          rel="noopener noreferrer"
        >{{ t('home.home.intro.follow') }}</a>
      </template>
      <template #joinus>
        <a
          class="text-purple-800 dark:text-purple-300"
          :href="locale === 'zh-Hans-CN' ? 'https://patchyvideo.wiki/zh/JoinUs' : 'https://patchyvideo.wiki/en/JoinUs'"
          target="_blank"
          rel="noopener noreferrer"
        >{{ t('home.home.intro.joinus') }}</a>
      </template>
    </i18n-t>

    <!-- Main Components -->
    <div v-if="screenSizes.md">
      <div v-for="(comp, index) in ucompList" :key="index">
        <div class="w-full mb-8" />
        <div class="mx-2">
          <Component :is="homeComponents[comp.name] ?? homeComponents.fallback" :data="comp.data" />
        </div>
        <div class="w-full mt-8" />
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { homeComponents } from '.'
import { locale } from '@/locales'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { screenSizes } from '@/css'

const { t } = useI18n()
setSiteTitle(t('home.home.title'))

interface HomeCompData {
  name: string
  data?: string
}

const ucompList: HomeCompData[] = reactive([
  { name: 'playlist', data: '{"playlist_id":"63cf704629516959d2f876a9"}' },
  { name: 'query_video', data: '{"video_rows":2}' },
  { name: 'playlist', data: '{"playlist_id":"5dbd93c6de383eb9a3aa089e"}' },
  { name: 'playlist', data: '{"playlist_id":"5f5871aef1017bad0f7f5165"}' },
])
</script>
