<script lang="ts" setup>
const { t } = useI18n()

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
      { key: 'Email (DMCA)', href: 'mailto:zyddnys@outlook.com' },
      { key: 'Tencent QQ', href: 'https://jq.qq.com/?k=fOJYEJt1' },
      { key: 'Telegram', href: 'https://t.me/PatchyVideo' },
      { key: 'Twitter', href: 'https://twitter.com/PatchyVideo' },
    ],
  },
])
</script>

<template>
  <div class="flex flex-row flex-wrap justify-center py-8 mt-8">
    <div v-for="linkGroup in links" :key="linkGroup.key">
      <ul class="px-2 md:px-4 lg:px-8">
        <li>
          <h1 class="font-semibold tracking-wide text-gray-900 dark:text-white py-1">
            {{ linkGroup.key }}
          </h1>
        </li>
        <li v-for="link in linkGroup.links" :key="link.key">
          <a
            v-if="link.href"
            class="inline-block mt-1 text-gray-900 dark:text-gray-100 whitespace-nowrap"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
          >{{ link.key }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
