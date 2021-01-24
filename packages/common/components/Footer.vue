<template>
  <div class="bg-pink-50 dark:bg-gray-700 dark:text-gray-400">
    <div v-if="!small" class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full"></div>
    <div v-if="!small" class="text-center font-thin">
      <span id="footer-typed"></span>
    </div>
    <div class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full"></div>
    <div class="w-full">
      <div class="flex flex-col justify-around lg:flex-row-reverse">
        <div class="my-auto hidden lg:block">
          <img src="https://thvideo.tv/img/footImg.c955b6a7.png" />
        </div>
        <div class="my-auto flex flex-row justify-evenly text-sm">
          <div v-for="linkGroup in links" :key="linkGroup.key">
            <ul class="px-8">
              <h3 class="font-semibold tracking-wide text-gray-900 py-1" v-text="linkGroup.key"></h3>
              <li v-for="link in linkGroup.links" :key="link.key">
                <a
                  v-if="link.href"
                  class="inline-block mt-1 text-gray-900"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  v-text="link.key"
                ></a>
              </li>
            </ul>
          </div>
        </div>
        <div class="my-auto">
          <div class="flex flex-row items-center content-center justify-around">
            <div class="border border-pink-200 dark:border-gray-800 px-4 py-1 m-1 rounded-full">
              <select v-model="isDark" class="bg-transparent focus:outline-none">
                <option :value="false" v-text="t('darkmode.light')"></option>
                <option :value="true" v-text="t('darkmode.dark')"></option>
              </select>
            </div>
            <div class="border border-pink-200 dark:border-gray-800 px-4 py-1 m-1 rounded-full">
              <select v-model="locale" class="bg-transparent focus:outline-none">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
          <div class="text-center text-sm">Platinum V{{ version }}, © 2020-2021 PatchyVideo</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, onUnmounted, reactive, ref, defineComponent } from 'vue'
import Typed from 'typed.js'
import { getYiyanArray } from '@/yiyan'
import { isDark } from '@/darkmode'
import { useI18n } from 'vue-i18n'
import { locale } from '@/locales'
import { version as pkgversion } from '@@/package.json'

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
          { key: t('common.footer.opensource-licenses'), href: '/NOTICE.txt' },
        ],
      },
      {
        key: t('common.footer.contact'),
        links: [
          { key: 'QQ', href: 'https://jq.qq.com/?k=fOJYEJt1' },
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

    const version = ref(pkgversion)

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

<style lang="postcss" scoped>
</style>
