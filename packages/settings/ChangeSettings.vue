<template>
  <LayoutDefault>
    <div class="flex flex-row space-x-8 max-w-screen-xl mx-auto mt-4">
      <!-- Left Sidebar -->
      <div class="flex-shrink-0 w-48">
        <h1 class="text-2xl mb-3" v-text="t('settings.settings')"></h1>
        <div class="flex flex-col space-y-1">
          <div
            v-for="catogory in catogories"
            :key="catogory.name"
            class="pl-2 py-1 rounded-full"
            :class="{
              'cursor-default text-pink-800 dark:text-white bg-pink-100 dark:bg-gray-700': active === catogory.name,
              'cursor-pointer select-none': active !== catogory.name,
            }"
            @click="() => active !== catogory.name && router.push('/settings/' + catogory.name)"
          >
            <div class="inline-block mr-2 text-4xl text-center align-middle" :class="catogory.icon"></div>
            <div class="inline-block text-lg align-middle" v-text="catogory.text"></div>
          </div>
        </div>
      </div>
      <!-- Settings -->
      <div class="flex-1 flex-shrink-0">
        <Component :is="activeCatogory?.component"></Component>
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, watchEffect } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isLogin, IsLogin } from '@/user'
import { useI18n } from 'vue-i18n'
import { setSiteTitle } from '@/common/lib/setSiteTitle'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const active = computed(() => route.params.catogory as string)

type SettingsCategory = {
  name: string
  text: string
  icon: string
  component: Component
}
const catogories = computed(() => {
  const catogories: SettingsCategory[] = [
    {
      name: 'general',
      text: '常规',
      icon: 'i-mdi-light-cog',
      component: defineAsyncComponent(() => import('./components/SettingsGeneral.vue')),
    },
    {
      name: 'appearance',
      text: '主题',
      icon: 'i-ph-magic-wand-light',
      component: defineAsyncComponent(() => import('./components/SettingsAppearance.vue')),
    },
  ]

  if (isLogin.value === IsLogin.yes)
    catogories.push({
      name: 'account',
      text: '账户',
      icon: 'i-ph-user-circle-light',
      component: defineAsyncComponent(() => import('./components/SettingsAccount.vue')),
    })

  return catogories
})
const activeCatogory = computed(() => catogories.value.find((catogory) => catogory.name === active.value))
watchEffect(() => {
  if (!activeCatogory.value && active.value) {
    router.push('/settings/general')
  }
})
watchEffect(() => {
  if (activeCatogory.value) {
    setSiteTitle(`${activeCatogory.value.text} - ${t('settings.settings')} - PatchyVideo`)
  }
})
</script>
