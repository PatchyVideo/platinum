<script lang="ts" setup>
import type { Link } from './SliderLink.vue'

const { t } = useI18n()
// const auth = await useAuth()

const links = computed<Link[]>(() => {
  const links: Link[] = [
    {
      key: 'home',
      type: 'router',
      icon: 'i-uil:home-alt',
      text: t('common.nav-top.main-menu.home'),
      path: '/',
    },
    {
      key: 'video-list',
      type: 'router',
      icon: 'i-uil:play-circle',
      text: t('common.nav-top.main-menu.video'),
      path: '/video-list',
    },
    {
      key: 'playlist-list',
      type: 'router',
      icon: 'i-uil:folder',
      text: t('common.nav-top.main-menu.list'),
      path: '/playlist-list',
    },
    {
      key: 'discuss-board',
      type: 'router',
      icon: 'i-uil:chat',
      text: t('common.nav-top.main-menu.discuss-board'),
      path: '/playground',
    },
    {
      key: 'leaderboard',
      type: 'router',
      icon: 'i-uil:list-ol-alt',
      text: t('common.nav-top.main-menu.leaderboard'),
      path: '/leaderboard',
    },
    {
      key: 'wiki',
      type: 'a',
      icon: 'i-carbon:wikis',
      text: t('common.nav-top.main-menu.wiki'),
      href: 'https://patchyvideo.wiki/',
    },
  ]
  // const placeholder = (text = ''): Link => {
  //   return {
  //     key: 'placeholder',
  //     type: 'blank',
  //     text,
  //   }
  // }
  // if (auth.isLogin) {
  //   links.push(
  //     placeholder(),
  //     {
  //       key: 'postvideo',
  //       type: 'router',
  //       icon: 'i-uil:upload',
  //       text: t('common.nav-top.user-operation.postvideo'),
  //       path: '/post-video',
  //     },
  //     {
  //       key: 'edittag',
  //       type: 'router',
  //       icon: 'i-uil:tag-alt',
  //       text: t('common.nav-top.user-operation.tag'),
  //       path: '/edit-tag',
  //     },
  //   )
  // }
  // if (auth.isAdmin) {
  //   links.push(
  //     placeholder('管理员'),
  //     {
  //       key: 'super-admin',
  //       type: 'router',
  //       text: t('common.nav-top.admin.super-admin'),
  //       path: '/superadmin',
  //     },
  //   )
  // }
  return links
})
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <ToolbarSliderLink v-for="link in links" :key="link.key" :link="link" />
  </div>
</template>
