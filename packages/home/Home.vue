<template>
  <LayoutDefault>
    <!-- Introduction -->
    <div class="border-b border-violet-300 dark:border-violet-500 md:text-center">
      <div class="p-4 py-10 space-y-4">
        <div>
          <div class="font-semibold md:text-lg">
            {{ t('home.home.intro') }}
            <br />
            {{ t('home.home.intro2') }}
          </div>
          <i18n-t keypath="home.home.progress" tag="div">
            <a
              class="underline"
              href="https://github.com/PatchyVideo/PatchyVideo-docs/blob/main/%E7%AC%AC%E4%B8%89%E8%BD%AE%E5%AD%90-%E6%B5%8B%E8%AF%95%E7%89%88%E5%86%85%E5%AE%B9.md"
              target="_blank"
              rel="noopener noreferrer"
              >{{ t('home.home.progress2') }}</a
            >
          </i18n-t>
          <i18n-t keypath="home.home.old-page" tag="div">
            <a class="underline" href="https://patchyvideo.com/" target="_blank" rel="noopener noreferrer">{{
              t('home.home.old-page2')
            }}</a>
          </i18n-t>
        </div>
        <div class="underline text-lg">
          <a href="https://space.bilibili.com/515657675" target="_blank" rel="noopener noreferrer">{{
            t('home.home.offical-account')
          }}</a>
        </div>
        <div class="font-semibold md:text-lg">
          {{ t('home.home.join') }}
          <br />
          <a
            class="underline text-lg"
            :href="locale == 'zh-Hans-CN' ? 'https://patchyvideo.wiki/zh/JoinUs' : 'https://patchyvideo.wiki/en/JoinUs'"
            target="_blank"
            rel="noopener noreferrer"
            >{{ t('home.home.join2') }}</a
          >
        </div>
      </div>
    </div>

    <!-- Main Components -->
    <div v-if="screenSizes.md">
      <div v-for="(comp, index) in ucompList" :key="index">
        <div class="w-full mb-12"></div>
        <div class="mx-2">
          <Component :is="homeComponents[comp.name] ?? homeComponents.fallback" :data="comp.data"></Component>
        </div>
        <div class="w-full mt-12"></div>
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { locale } from '@/locales'
import { useI18n } from 'vue-i18n'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { homeComponents } from '.'
import { screenSizes } from '@/css'

const { t } = useI18n()
setSiteTitle(t('home.home.title'))

interface HomeCompData {
  name: string
  data?: string
}

const ucompList: HomeCompData[] = reactive([
  { name: 'playlist', data: '{"playlist_id":"60453ee441928fe337b2ac13"}' },
  { name: 'query_video', data: '{"video_rows":2}' },
  { name: 'playlist', data: '{"playlist_id":"5dbd93c6de383eb9a3aa089e"}' },
  { name: 'playlist', data: '{"playlist_id":"5f5871aef1017bad0f7f5165"}' },
])
</script>
