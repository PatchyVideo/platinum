<template>
  <img :alt="alt + '\'s avatar'" :src="imgs[currImg]" @error="onError" />
</template>

<script lang="ts" setup>
import { computed, defineProps, ref } from 'vue'
import defaultAvatar from '../assets/DefaultAvatar.jpg?url'

const props = defineProps<{
  current?: string
  image?: string | null
  gravatar?: string | null
  alt?: string
}>()

const imgs = computed(() => {
  const imgs: string[] = []
  if (props.current) imgs.push(props.current)
  if (props.image && props.image !== 'default') imgs.push(`https://patchyvideo.com/be/images/userphotos/${props.image}`)
  if (props.gravatar && props.gravatar.length === 32)
    imgs.push(`https://gravatar.com/avatar/${props.gravatar}?d=404`)
  imgs.push(defaultAvatar)
  return imgs
})
const currImg = ref(0)
const onError = (e: Event) => {
  if (imgs.value.length >= currImg.value) currImg.value++
}
</script>
