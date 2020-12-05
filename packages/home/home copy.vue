<template>
  <div class="text-center max-w-screen-2xl mx-auto">
    <h3 class="text-lg font-semibold m-4 dark:text-white">PatchyVideo</h3>
    <div class="w-96 h-32 border border-black">
      <div
        v-for="(id, index) in ids"
        :key="id"
        class="w-full h-8 bg-gray-400"
        draggable="true"
        @dragover="$event.preventDefault()"
        @dragenter="dragenter(index, $event)"
        @dragstart="dragstart(index.toString(), $event)"
        @dragend="dragend"
        @drop="drop(index, $event)"
      >
        {{ id }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { gql, schema, useApollo } from '/@/graphql'

useApollo()
  .mutate<schema.MutationRoot>({
    mutation: gql`
      mutation {
        serverDate
      }
    `,
  })
  .then((data) => {
    console.log(data.data)
  })

const ids = ref(['1', '2'])

const transferingID = ref(0)

const dragstart = (id: number, e: DragEvent): void => {
  transferingID.value = id
  if (e.target) {
    ;(e.target as HTMLElement).style.opacity = '0.5'
  }
}

const dragenter = (index: number, e: DragEvent): void => {
  e.preventDefault()
  console.log(transferingID)
}

const dragend = (e: DragEvent): void => {
  if (e.target) {
    ;(e.target as HTMLElement).style.opacity = ''
  }
}

const drop = (id: number): void => {
  const index = transferingID.value
  ;[ids.value[index], ids.value[id]] = [ids.value[id], ids.value[index]]
}
</script>

<style lang="postcss" scoped>
.gragging {
}
</style>
