<template>
  <div class="bg-gray-50 dark:bg-gray-800">
    <div class="flex flex-row flex-wrap justify-center py-8 mt-8">
      <div v-for="linkGroup in links" :key="linkGroup.key">
        <ul class="px-2 md:px-4 lg:px-8">
          <li>
            <h1 class="font-semibold tracking-wide text-gray-900 dark:text-white py-1" v-text="linkGroup.key"></h1>
          </li>
          <li v-for="link in linkGroup.links" :key="link.key">
            <a
              v-if="link.href"
              class="inline-block mt-1 text-gray-900 dark:text-gray-100 whitespace-nowrap"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              v-text="link.key"
            ></a>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="!small" class="text-center text-sm font-light font-sans whitespace-nowrap overflow-hidden">
      <span id="footer-typed"></span>
    </div>
    <div class="text-center my-2 text-sm text-gray-600 dark:text-gray-200">
      Platinum v{{ version }}(<a
        :href="'https://github.com/PatchyVideo/platinum/commit/' + commitHash"
        :title="commitHash"
        target="_blank"
        rel="noopener noreferrer"
        v-text="commitHash.slice(0, 7)"
      ></a
      >)<template v-if="hasExtension"
        >&nbsp;<span
          :title="
            'List: ' +
            Object.values(extensions)
              .map(({ name, extVersion }) => name + '(' + extVersion + ')')
              .join(', ')
          "
          >({{ Object.values(extensions).length }} ext installed)</span
        ></template
      ><br />
      © 2020-2021 VoileLabs. Released under the
      <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>.
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, computed } from 'vue'
import Typed from 'typed.js'
import { getYiyanArray } from '@/yiyan'
import { useI18n } from 'vue-i18n'
import { extensions } from '@/main/extension'

const props = defineProps({
  small: {
    type: Boolean,
    default: false,
  },
})

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
    key: t('common.footer.contact'),
    links: [
      { key: 'Tencent QQ', href: 'https://jq.qq.com/?k=fOJYEJt1' },
      { key: 'Telegram', href: 'https://t.me/PatchyVideo' },
      { key: 'Discord', href: 'https://discord.gg/FtPPQqz' },
      { key: 'Twitter', href: 'https://twitter.com/PatchyVideo' },
      { key: 'Email', href: 'mailto:zyddnys@outlook.com' },
    ],
  },
])

/* typed.js */
let typed: Typed
onMounted(() => {
  if (!props.small)
    typed = new Typed('#footer-typed', {
      strings: getYiyanArray(true, true),
      typeSpeed: 30,
      backSpeed: 10,
      backDelay: 1600,
      loop: true,
      smartBackspace: false,
    })
})
onUnmounted(() => {
  if (typed?.destroy) typed.destroy()
})

const version = import.meta.env.VITE_APP_VERSION
const commitHash = import.meta.env.VITE_COMMIT_HASH

const hasExtension = computed(() => Object.keys(extensions.value).length > 0)
</script>
