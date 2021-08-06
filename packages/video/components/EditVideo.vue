<template>
  <div @click="hi">hhihihihihi!</div>
  视频可见度
  <PvSelect v-model:selected="clearence" :item-list="clearences" />
</template>
<script lang="ts" setup>
import PvSelect from '@/ui/components/PvSelect.vue'
import type { schema } from '@/graphql'
import { useI18n } from 'vue-i18n'
import { ref, watchEffect } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  video: schema.Video
}>()

console.log(props.video)

const clearence = ref(props.video.clearence.toString() ?? '3')
const clearences = [
  {
    name: t(`video.video.ranks.0`),
    value: '0',
  },
  {
    name: t(`video.video.ranks.1`),
    value: '1',
  },
  {
    name: t(`video.video.ranks.2`),
    value: '2',
  },
  {
    name: t(`video.video.ranks.3`),
    value: '3',
  },
]

watchEffect(() => {
  console.log(clearence.value)
})

function hi() {
  console.log('hi!')
}
</script>
