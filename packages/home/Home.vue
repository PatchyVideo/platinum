<template>
  <div class="max-w-screen-3xl mx-auto">
    <!-- Search / Navbar -->
    <div class="h-96 bg-gray-200 dark:bg-gray-700 dark:border-b dark:border-gray-500 text-center">
      <h3 class="text-lg font-semibold p-4 px-auto pt-24 dark:text-white">PatchyVideo</h3>
      <div class="shadow rounded-full max-w-2xl mx-auto h-11 text-center overflow-hidden bg-white dark:bg-gray-800">
        <input class="w-full h-full mx-8 outline-none dark:bg-gray-800 dark:text-white" value="search!" />
      </div>
      <div class="pt-2">
        <button type="button" class="border border-black bg-white rounded mr-2" @click="light">Light!</button>
        <button type="button" class="border border-black bg-gray-600 text-white rounded" @click="dark">Dark!</button>
      </div>
    </div>

    <!-- Main Components -->
    <div>
      <div v-for="comp in ucompList" :key="comp">
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
import { defineAsyncComponent, defineComponent, reactive, ref } from 'vue'
import { defineFragment, gql, schema } from '/@/graphql'
import Footer from '/@/common/components/Footer.vue'
import { dark, light } from '/@/darkmode'

const childFrag = defineFragment({
  query: () => gql`
    fragment testListVideo on ListVideoResult {
      pageCount
    }
  `,
})
childFrag.onQueryResult<schema.ListVideoResult>((data) => {
  console.log(data)
})

export const gqlFrag = defineFragment({
  query({ childFrag }) {
    return gql`
      fragment RootFrag on Query {
        apiVersion
        listVideo(
          para: {
            page: 1
            pageSize: 1
            humanReadableTag: true
            query: "https://www.bilibili.com/video/av287017839?p=1"
          }
        ) {
          ...testListVideo
        }
      }
      ${childFrag.query}
    `
  },
  queryChildren: {
    childFrag,
  },
})
gqlFrag.onQueryResult<schema.QueryRoot>((data) => {
  console.log(data)
})

export default defineComponent({
  components: {
    Footer,
    comp_list: defineAsyncComponent(() => import('./components/List.vue')),
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

    return {
      ucompList,
      addCompName,
      addComp,
      dark,
      light,
    }
  },
})
</script>

<style lang="postcss" scoped>
</style>
