<template>
  <img :alt="alt + '\'s avatar'" :src="img" @error="onError" />
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue-demi'

const props = defineProps<{
  image?: string
  gravatar?: string
  alt?: string
}>()

const img = computed(() => {
  if (props.image && props.image !== 'default') return `https://patchyvideo.com/be/images/userphotos/${props.image}`
  if (props.gravatar && props.gravatar.length === 32)
    return `https://www.gravatar.com/avatar/${props.gravatar}?d=https%3A%2F%2Fpatchyvideo.com%2Fbe%2Fimages%2Fuserphotos%2Fdefault`
  return 'https://patchyvideo.com/be/images/userphotos/default'
})
const fallbackImg = computed(() => `https://patchyvideo.com/be/images/userphotos/${props.image}`)
const onError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = fallbackImg.value
}
</script>
