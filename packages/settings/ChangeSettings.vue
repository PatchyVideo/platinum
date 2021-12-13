<template>
  <LayoutDefault>
    <div class="flex flex-col sm:flex-row gap-x-8 gap-y-4 max-w-screen-xl mx-4 sm:mx-auto mt-4">
      <!-- Left Sidebar -->
      <div class="flex-shrink-0 w-full sm:w-48">
        <div class="flex flex-row flex-nowrap justify-between items-center">
          <h1 class="text-2xl" v-text="t('settings.settings')"></h1>
          <!-- Mobile Collapse -->
          <div
            class="sm:hidden text-3xl"
            :class="{ 'i-uil-arrow-from-top': collapsed, 'i-uil-arrow-to-bottom transform rotate-180': !collapsed }"
            @click="onCollapse"
          ></div>
        </div>
        <div class="overflow-hidden" :class="{ 'lt-sm:h-0': collapsed }">
          <div class="flex mt-3 flex-col gap-y-1">
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
      </div>
      <!-- Settings -->
      <div class="flex-1 flex-shrink-0">
        <Suspense timeout="150">
          <template #default>
            <Component :is="activeCatogory?.component"></Component>
          </template>
          <template #fallback>
            <div class="mt-30vh mb-40vh mx-auto text-xl text-gray-600 dark:text-gray-300">
              <div class="inline-block align-middle" v-text="t('settings.loading')"></div>
              <div class="i-uil-spinner-alt text-2xl animate-spin"></div>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, watchEffect } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isLogin, IsLogin } from '@/user'
import { useI18n } from 'vue-i18n'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { useThrottleFn } from '@vueuse/core'

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
      text: t('settings.general.name'),
      icon: 'i-mdi-light-cog',
      component: defineAsyncComponent(() => import('./components/SettingsGeneral.vue')),
    },
    {
      name: 'appearance',
      text: t('settings.appearance.name'),
      icon: 'i-ph-magic-wand-light',
      component: defineAsyncComponent(() => import('./components/SettingsAppearance.vue')),
    },
  ]

  if (isLogin.value === IsLogin.yes)
    catogories.push({
      name: 'account',
      text: t('settings.account.name'),
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

const collapsed = ref(true)
const onCollapse = useThrottleFn(
  () => {
    collapsed.value = !collapsed.value
  },
  100,
  false
)
</script>