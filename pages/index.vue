<script lang="ts" setup>
const { t, locale } = useI18n()

useHead({
  title: t('home.home.title'),
})

interface HomeCompData {
  name: string
  data?: any
}

const ucompList = reactive<HomeCompData[]>([
  { name: 'playlist', data: { playlist_id: '60453ee441928fe337b2ac13' } },
  { name: 'query_video', data: { rows: 2 } },
  { name: 'playlist', data: { playlist_id: '5dbd93c6de383eb9a3aa089e' } },
  { name: 'playlist', data: { playlist_id: '5f5871aef1017bad0f7f5165' } },
])
</script>

<template>
  <div>
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
    <div>
      <div v-for="(comp, index) in ucompList" :key="index">
        <div class="w-full mb-8" />
        <div class="mx-2">
          <HomePlaylist v-if="comp.name === 'playlist'" :data="comp.data" />
          <HomeQueryVideo v-else-if="comp.name === 'query_video'" :data="comp.data" />
        </div>
        <div class="w-full mt-8" />
      </div>
    </div>
  </div>
</template>
