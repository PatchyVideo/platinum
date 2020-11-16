<template>
  <div class="bg-pink-50 dark:bg-gray-700 dark:text-gray-400">
    <div class="w-full py-3 px-4">
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
    <div class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full">
      <div class="text-center font-thin"><span id="footer-typed"></span></div>
    </div>
    <div class="border-t border-gray-400 dark:border-gray-800 border-dotted w-full">
      <div class="flex flex-row items-center content-center justify-around">
        <div class="border border-pink-200 dark:border-gray-800 px-4 py-1 m-1 rounded-full">
          <select v-model="colorMode" class="bg-transparent focus:outline-none">
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
        <div class="text-center">© 2020 PatchyVideo</div>
        <div class="border border-pink-200 dark:border-gray-800 px-4 py-1 m-1 rounded-full">
          <select class="bg-transparent focus:outline-none">
            <option>简体中文</option>
            <option>English</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import Typed from 'typed.js'
import { getYiyanArray } from '/@/yiyan'
import { currentColorMode, dark, light } from '/@/darkmode'

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
      { key: '网站维基', href: 'https://patchyvideo.wiki/' },
      { key: '网站状态', href: 'https://status.patchyvideo.com/' },
      { key: 'B站官方帐户', href: 'https://space.bilibili.com/515657675' },
      { key: '招募祈愿', href: 'https://patchyvideo.wiki/zh/JoinUs' },
    ],
  },
  {
    key: '代码相关',
    links: [
      { key: '项目仓库', href: 'https://patchyvideo.wiki/zh/Repositories' },
      { key: '反馈BUG', href: 'https://github.com/PatchyVideo/PatchyVideo/issues' },
    ],
  },
  {
    key: '联系我们',
    links: [
      { key: 'QQ', href: 'https://jq.qq.com/?k=fOJYEJt1' },
      { key: 'Telegram', href: 'https://t.me/PatchyVideo' },
      { key: 'Discord', href: 'https://discord.gg/FtPPQqz' },
      { key: 'Email', href: 'mailto:zyddnys@outlook.com' },
    ],
  },
])

let typed: Typed

onMounted(() => {
  typed = new Typed('#footer-typed', {
    strings: getYiyanArray(true, true),
    typeSpeed: 50,
    backSpeed: 15,
    backDelay: 4000,
    loop: true,
  })
})
onUnmounted(() => {
  typed.destroy()
})

export const colorMode = ref(currentColorMode())
watch(colorMode, (value: string): void => {
  if (value == 'dark') {
    dark()
  } else {
    light()
  }
})
</script>

<style lang="postcss" scoped>
</style>
