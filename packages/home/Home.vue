<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop></NavTop>

    <!-- Introduction -->
    <div class="h-screen bg-gray-200 dark:bg-gray-700 dark:border-b dark:border-gray-500 md:text-center">
      <div class="p-4 pt-10 space-y-10 md:pt-24">
        <div>
          <div class="font-semibold md:text-lg">
            {{ t('home.home.intro') }}
            <br />
            {{ t('home.home.intro2') }}
          </div>
          <i18n-t keypath="home.home.progress" tag="div">
            <a
              class="underline"
              href="https://github.com/PatchyVideo/PatchyVideo-docs/blob/main/%E7%AC%AC%E4%B8%89%E8%BD%AE%E5%AD%90-%E6%B5%8B%E8%AF%95%E7%89%88%E5%86%85%E5%AE%B9.md"
              target="_blank"
              >{{ t('home.home.progress2') }}</a
            >
          </i18n-t>
          <i18n-t keypath="home.home.old-page" tag="div">
            <a class="underline" href="https://patchyvideo.com/" target="_blank">{{ t('home.home.old-page2') }}</a>
          </i18n-t>
        </div>
        <div class="underline text-lg">
          <a href="https://space.bilibili.com/515657675" target="_blank">{{ t('home.home.offical-account') }}</a>
        </div>
        <div class="font-semibold md:text-lg">
          {{ t('home.home.join') }}
          <br />
          <a
            class="underline text-lg"
            :href="locale == 'zh-Hans-CN' ? 'https://patchyvideo.wiki/zh/JoinUs' : 'https://patchyvideo.wiki/en/JoinUs'"
            target="_blank"
            >{{ t('home.home.join2') }}</a
          >
        </div>
      </div>
    </div>

    <!-- Main Components -->
    <div v-if="false">
      <div v-for="(comp, index) in ucompList" :key="index">
        <div class="border-b border-gray-200 h-px w-full mb-2"></div>
        <Component :is="'comp_' + comp.name" :data="comp.data" class="mx-2"></Component>
        <div class="w-full mt-2"></div>
      </div>
      <input v-model="addCompName" class="border rounded border-black mr-2" />
      <button type="button" class="border rounded border-black px-2" @click="addComp">add</button>
    </div>
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { locale } from '@/locales'
import { useI18n } from 'vue-i18n'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import Footer from '@/common/components/Footer.vue'
import NavTop from '@/common/components/NavTop.vue'

const { t } = useI18n()
setSiteTitle(t('home.home.title'))

interface HomeCompData {
  name: string
  data?: string
}

const ucompList: HomeCompData[] = reactive([])

const addCompName = ref('')

const addComp = (): void => {
  ucompList.push({
    name: addCompName.value,
    data: '{"listID":"5e057a1b31929c83a76d18a4"}',
  })
}
</script>

<style lang="postcss" scoped></style>
