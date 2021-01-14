<template>
  <div class="max-w-screen-3xl mx-auto">
    <!-- Search / Navbar -->
    <div class="h-96 bg-gray-200 dark:bg-gray-700 dark:border-b dark:border-gray-500 text-center">
      <h3 class="text-lg font-semibold p-4 px-auto pt-24 dark:text-white">PatchyVideo</h3>
      <div class="shadow rounded-full max-w-2xl mx-auto h-11 text-center overflow-hidden bg-white dark:bg-gray-800">
        <input class="w-full h-full mx-8 outline-none dark:bg-gray-800 dark:text-white" value="search!" />
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
import { defineAsyncComponent, defineComponent, reactive, ref, watch, watchEffect } from 'vue'
import { gql, parseGraph, schema } from '@/graphql'
import Footer from '@/common/components/Footer.vue'

// const childFrag = defineFragment({
//   query: () => gql`
//     fragment testListVideo on ListVideoResult {
//       pageCount
//     }
//   `,
// })
// childFrag.onQueryResult<schema.ListVideoResult>((data) => {
//   console.log(data)
// })

// export const gqlFrag = defineFragment({
//   query({ childFrag }) {
//     return gql`
//       fragment RootFrag on Query {
//         apiVersion
//         listVideo(
//           para: { offset: 0, limit: 1, humanReadableTag: true, query: "https://www.bilibili.com/video/av287017839?p=1" }
//         ) {
//           ...testListVideo
//         }
//       }
//       ${childFrag.query}
//     `
//   },
//   queryChildren: {
//     childFrag,
//   },
// })
// gqlFrag.onQueryResult<schema.Query>((data) => {
//   console.log(data)
// })

const limit = ref(1)

const pdg = parseGraph({
  graphRaw: gql`
    # @import child from 'childFrag'

    fragment default on Query @export @param(offset: number, limit: number) {
      listVideo(
        para: {
          offset: $offset
          limit: $limit
          humanReadableTag: true
          query: "https://www.bilibili.com/video/av287017839?p=1"
        }
      ) {
        count
        ...child @apply(limit: $limit)
        ... on Video {
          bar
        }
      }
    }
  `,
  variables: {
    offset: 0,
    limit: limit,
  },
  children: {
    childFrag: parseGraph({
      graphRaw: gql`
        fragment default on ListVideoResult @export @param(limit: number) {
          maxCount
          foo(limit: $limitP1) {
            count
          }
        }
      `,
      variables(vars) {
        return {
          limitP1: (vars.limit.value as number) + 1,
        }
      },
    }),
  },
})

console.log(pdg)
const vars = pdg.buildVars({})
console.log(vars)
watch(vars, (vars) => console.log('variables changed.', vars))
limit.value++

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
    }
  },
})
</script>

<style lang="postcss" scoped>
</style>
