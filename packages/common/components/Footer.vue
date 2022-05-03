<template>
  <div class="bg-gray-50 border-t border-purple-300 dark:border-gray-800 dark:bg-gray-900">
    <div class="flex flex-row flex-wrap justify-center py-8 mt-8">
      <div v-for="linkGroup in links" :key="linkGroup.key">
        <ul class="px-2 md:px-4 lg:px-8">
          <li>
            <h1 class="font-semibold tracking-wide text-gray-900 dark:text-white py-1" v-text="linkGroup.key" />
          </li>
          <li v-for="link in linkGroup.links" :key="link.key">
            <a
              v-if="link.href"
              class="inline-block mt-1 text-gray-900 dark:text-gray-100 whitespace-nowrap"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              v-text="link.key"
            />
          </li>
        </ul>
      </div>
    </div>
    <div v-if="!small" class="text-center text-sm font-light font-sans whitespace-nowrap overflow-hidden">
      <span ref="typedEl" />
    </div>
    <div class="text-center my-2 text-sm text-gray-600 dark:text-gray-300">
      <span>{{ t('common.footer.user-number', { users }) }}</span><br>
      <span><span>Platinum v{{ version }}</span>(<a
        :href="`https://github.com/PatchyVideo/platinum/commit/${commitHash}`"
        :title="commitHash"
        target="_blank"
        rel="noopener noreferrer"
        v-text="commitHash.slice(0, 7)"
      />, {{ isDev ? 'dev' : 'prod' }})<template v-if="hasExtension">&nbsp;<span
        :title="
          `List: ${
            Object.values(extensions)
              .map(({ name, extVersion }) => `${name}(${extVersion})`)
              .join(', ')}`
        "
      >({{ Object.values(extensions).length }} ext installed)</span></template>. </span><span>
        © 2019-2022 VoileLabs. Released under the
        <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>.</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import Typed from 'typed.js'
import { useI18n } from 'vue-i18n'
import { getYiyanArray } from '@/yiyan'
import { extensions } from '@/main/libs/extension'
import type { Query } from '@/graphql'
import { gql, useQuery, useResult } from '@/graphql'

const props = withDefaults(
  defineProps<{
    small?: boolean
  }>(),
  {
    small: false,
  },
)

const isDev = import.meta.env.DEV

const { t } = useI18n()

/* links */
const links = computed<
  {
    key: string
    links: {
      key: string
      to?: string
      href?: string
    }[]
  }[]
>(() => [
  {
    key: 'PatchyVideo',
    links: [
      { key: t('common.footer.wiki'), href: 'https://patchyvideo.wiki/' },
      { key: t('common.footer.status'), href: 'https://status.patchyvideo.com/' },
      { key: t('common.footer.bl-account'), href: 'https://space.bilibili.com/515657675' },
      { key: t('common.footer.joinus'), href: 'https://patchyvideo.wiki/zh/JoinUs' },
    ],
  },
  {
    key: t('common.footer.code'),
    links: [
      { key: t('common.footer.repositories'), href: 'https://patchyvideo.wiki/zh/Repositories' },
      { key: t('common.footer.feedback-issue'), href: 'https://github.com/PatchyVideo/PatchyVideo/issues' },
      { key: t('common.footer.license'), href: '/LICENSE' },
    ],
  },
  {
    key: t('common.footer.sponsor'),
    links: [
      { key: 'Ko-fi', href: 'https://ko-fi.com/voilelabs' },
      { key: 'Patreon', href: 'https://www.patreon.com/voilelabs' },
      { key: '爱发电', href: 'https://afdian.net/@voilelabs' },
    ],
  },
  {
    key: t('common.footer.contact'),
    links: [
      { key: 'Email (DMCA)', href: 'mailto:zyddnys@outlook.com' },
      { key: 'Tencent QQ', href: 'https://jq.qq.com/?k=fOJYEJt1' },
      { key: 'Telegram', href: 'https://t.me/PatchyVideo' },
      { key: 'Discord', href: 'https://discord.gg/FtPPQqz' },
      { key: 'Twitter', href: 'https://twitter.com/PatchyVideo' },
    ],
  },
])

/* typed.js */
const typedEl = shallowRef<HTMLSpanElement | null>(null)
let typed: Typed | undefined
onMounted(() => {
  if (!props.small && typedEl.value) {
    typed = new Typed(typedEl.value, {
      strings: getYiyanArray(true, true),
      typeSpeed: 30,
      backSpeed: 10,
      backDelay: 1600,
      loop: true,
      smartBackspace: false,
    })
  }
})
onUnmounted(() => {
  if (typed?.destroy)
    typed.destroy()
})

const version = import.meta.env.VITE_APP_VERSION
const commitHash = import.meta.env.VITE_COMMIT_HASH

const hasExtension = computed(() => Object.keys(extensions.value).length > 0)

const { result } = useQuery<Query>(gql`
  query {
    getStats {
      users
    }
  }
`)
const users = useResult(result, 0, data => data.getStats.users)
</script>
