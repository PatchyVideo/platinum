<template>
  <div class="bg-pink-50 dark:bg-gray-700 dark:text-gray-400">
    <div v-if="!small" class="w-full py-3 px-4">
      <div class="flex flex-row content-center justify-start">
        <div class="px-5">
          <img src="https://thvideo.tv/img/footImg.c955b6a7.png" />
        </div>
        <div v-for="linkGroup in links" :key="linkGroup.key">
          <ul class="px-5">
            <h3 class="font-semibold py-1" v-text="linkGroup.key"></h3>
            <li v-for="link in linkGroup.links" :key="link.key">
              <a
                v-if="link.href"
                class="inline-block"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                v-text="link.key"
              ></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="!small" class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full"></div>
    <div v-if="!small" class="text-center font-thin"><span id="footer-typed"></span></div>
    <div v-if="!small" class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full"></div>
    <div class="flex flex-row items-center content-center justify-around">
      <div class="border border-pink-200 dark:border-gray-800 px-4 py-1 m-1 rounded-full">
        <select v-model="colorMode" class="bg-transparent focus:outline-none">
          <option value="light" v-text="t('darkmode.light')"></option>
          <option value="dark" v-text="t('darkmode.dark')"></option>
        </select>
      </div>
      <div class="text-center">© 2020 PatchyVideo</div>
      <div class="border border-pink-200 dark:border-gray-800 px-4 py-1 m-1 rounded-full">
        <select v-model="locale" class="bg-transparent focus:outline-none">
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup="props" lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import Typed from 'typed.js'
import { getYiyanArray } from '/@/yiyan'
import { currentColorMode, dark, light } from '/@/darkmode'
import { useI18n } from 'vue-i18n'

export const { t } = useI18n()

declare const props: {
  small?: boolean
}

/* small bar */
export const small = ref(!!props.small)

/* links */
export const links: {
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
  if (!small.value)
    typed = new Typed('#footer-typed', {
      strings: getYiyanArray(true, true),
      typeSpeed: 50,
      backSpeed: 15,
      backDelay: 4000,
      loop: true,
    })
})
onUnmounted(() => {
  if (typed?.destroy) typed.destroy()
})

/* color mode */
export const colorMode = ref(currentColorMode())
watch(colorMode, (value: string): void => {
  if (value == 'dark') {
    dark()
  } else {
    light()
  }
})

/* language */
export { locale } from '/@/locales'
</script>

<style lang="postcss" scoped>
</style>
