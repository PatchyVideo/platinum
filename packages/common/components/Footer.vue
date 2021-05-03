<template>
  <div class="bg-gray-50 dark:bg-gray-700">
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
    <div v-if="!small" class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full"></div>
    <div
      v-if="!small"
      class="text-center text-sm md:text-base text-gray-600 dark:text-gray-200 whitespace-nowrap overflow-hidden"
    >
      <span id="footer-typed"></span>
    </div>
    <div class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full"></div>
    <div class="text-center my-2 text-gray-600 dark:text-gray-200">
      Platinum V{{ version }}, © 2020-2021 PatchyVideo
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, reactive, defineComponent } from 'vue'
import Typed from 'typed.js'
import { getYiyanArray } from '@/yiyan'
import { isDark } from '@/darkmode'
import { useI18n } from 'vue-i18n'
import { locale } from '@/locales'

export default defineComponent({
  props: {
    small: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n()

    /* links */
    const links: {
      key: string
      links: {
        key: string
        to?: string
        href?: string
      }[]
    }[] = reactive([
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
          typeSpeed: 50,
          backSpeed: 15,
          backDelay: 2000,
          loop: true,
          smartBackspace: false,
        })
    })
    onUnmounted(() => {
      if (typed?.destroy) typed.destroy()
    })

    const version = import.meta.env.VITE_APP_VERSION

    return {
      t,
      links,
      isDark,
      locale,
      version,
    }
  },
})
</script>

<style lang="postcss" scoped></style>
