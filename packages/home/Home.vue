<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop></NavTop>

    <!-- Introduction -->
    <div class="h-screen bg-gray-200 dark:bg-gray-700 dark:border-b dark:border-gray-500 md:text-center">
      <div class="p-4 pt-10 space-y-10 md:pt-24">
        <div>
          <div class="font-semibold md:text-lg">
            {{ t('home.intro') }}
            <br />
            {{ t('home.intro2') }}
          </div>
          <div>
            {{ t('home.progress') }}
            <a
              class="underline"
              href="https://github.com/PatchyVideo/PatchyVideo-docs/blob/main/%E7%AC%AC%E4%B8%89%E8%BD%AE%E5%AD%90-%E6%B5%8B%E8%AF%95%E7%89%88%E5%86%85%E5%AE%B9.md"
              target="_blank"
              >{{ t('home.progress2') }}</a
            >
          </div>
        </div>
        <div class="font-semibold md:text-lg">
          {{ t('home.join') }}
          <br />
          <a
            class="underline text-lg"
            :href="locale == 'zh-CN' ? 'https://patchyvideo.wiki/zh/JoinUs' : 'https://patchyvideo.wiki/en/JoinUs'"
            target="_blank"
            >{{ t('home.join2') }}</a
          >
        </div>
      </div>
    </div>

    <!-- Main Components -->
    <div v-if="false">
      <div v-for="(comp, index) in ucompList" :key="index">
        <div class="border-b border-gray-200 h-px w-full mb-2"></div>
        <component :is="'comp_' + comp.name" :data="comp.data" class="mx-2"></component>
        <div class="w-full mt-2"></div>
      </div>
      <input v-model="addCompName" class="border rounded border-black mr-2" />
      <button type="button" class="border rounded border-black px-2" @click="addComp">add</button>
    </div>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { locale } from '@/locales'
import { useI18n } from 'vue-i18n'
import Footer from '@/common/components/Footer.vue'
import NavTop from '@/common/components/NavTop.vue'

export default defineComponent({
  components: {
    Footer,
    // comp_list: defineAsyncComponent(() => import('./components/List.vue'), NavTop),
    NavTop,
  },
  setup() {
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

    const { t } = useI18n()

    return {
      t,
      locale,
      ucompList,
      addCompName,
      addComp,
    }
  },
})
</script>

<style lang="postcss" scoped></style>
