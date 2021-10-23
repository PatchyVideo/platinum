<template>
  <img ref="el" :alt="alt + '\'s avatar'" :src="[...imgs][currImg]" @error="onError" />
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, watchEffect } from 'vue'
import { hash as md5 } from 'spark-md5'
import defaultAvatar from '../assets/DefaultAvatar.jpg?url'

const props = defineProps<{
  current?: string
  image?: string | null
  gravatar?: string | null
  email?: string | null
  alt?: string
}>()

const el = shallowRef<HTMLImageElement | null>(null)

const imgs = ref<Set<string>>(new Set())
onMounted(() => {
  watchEffect(() => {
    setImgs()
  })
})

const setImgs = () => {
  const width = el.value?.clientWidth
  const s = width && width > 10 ? width : 48

  if (props.current) imgs.value.add(props.current)
  if (props.image && props.image !== 'default')
    imgs.value.add(`https://patchyvideo.com/be/images/userphotos/${props.image}`)
  if (props.gravatar && props.gravatar.length === 32)
    imgs.value.add(`https://gravatar.com/avatar/${props.gravatar}?s=${s}&d=404`)
  if (props.email) imgs.value.add(`https://gravatar.com/avatar/${md5(props.email)}?s=${s}&d=404`)
  imgs.value.add(defaultAvatar)

  currImg.value = 0
}

const currImg = ref(0)
const onError = (e: Event) => {
  if (imgs.value.size >= currImg.value) currImg.value++
}
</script>
