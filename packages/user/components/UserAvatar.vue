<template>
  <img
    ref="el"
    class="dark:filter dark:brightness-90 bg-gray-300 dark:bg-gray-600"
    :alt="t('user.avatar.alt', { alt })"
    :title="hideTitle ? undefined : t('user.avatar.alt', { alt })"
    :src="currUrl"
    @error="onError"
    @click="onClick"
    @auxclick="onAuxClick"
  >
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, shallowRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { hash as md5 } from 'spark-md5'
import defaultAvatar from '../assets/DefaultAvatar.jpg?url'

const props = defineProps<{
  current?: string
  image?: string | null
  gravatar?: string | null
  email?: string | null
  alt?: string
  openable?: boolean
  hideTitle?: boolean
}>()

const { t } = useI18n()

const el = shallowRef<HTMLImageElement | null>(null)

const imgs = ref<Set<string>>(new Set())
const originalImgs = ref<Set<string>>(new Set())

const currImg = ref(0)
const currUrl = computed(() => [...imgs.value][currImg.value])
const currOriginalUrl = computed(() => [...originalImgs.value][currImg.value])
const onError = (e: Event) => {
  if (currImg.value < imgs.value.size - 1)
    currImg.value++
}

const setImgs = () => {
  const width = el.value?.clientWidth
  const s = width && width > 10 ? width : 48

  const pushImg = (url: string, ori?: string) => {
    if (ori) {
      imgs.value.add(url)
      originalImgs.value.add(ori)
    }
    else {
      imgs.value.add(url)
      originalImgs.value.add(url)
    }
  }

  if (props.current)
    pushImg(props.current)
  if (props.image && props.image !== 'default')
    pushImg(`https://patchyvideo.com/be/images/userphotos/${props.image}`)
  if (props.gravatar && props.gravatar.length === 32) {
    pushImg(
      `https://gravatar.loli.net/avatar/${props.gravatar}?s=${s}&d=404`,
      `https://gravatar.loli.net/avatar/${props.gravatar}?s=512&d=404`,
    )
  }
  if (props.email) {
    pushImg(
      `https://gravatar.loli.net/avatar/${md5(props.email)}?s=${s}&d=404`,
      `https://gravatar.loli.net/avatar/${md5(props.email)}?s=512&d=404`,
    )
  }
  if (props.gravatar && props.gravatar.length === 32) {
    pushImg(
      `https://gravatar.com/avatar/${props.gravatar}?s=${s}&d=404`,
      `https://gravatar.com/avatar/${props.gravatar}?s=512&d=404`,
    )
  }
  if (props.email) {
    pushImg(
      `https://gravatar.com/avatar/${md5(props.email)}?s=${s}&d=404`,
      `https://gravatar.com/avatar/${md5(props.email)}?s=512&d=404`,
    )
  }
  pushImg(defaultAvatar)

  currImg.value = 0
}

onMounted(() => {
  watchEffect(() => {
    setImgs()
  })
})

const onClick = () => {
  // use a `window.open` to open link here since this component should expose an `img` element
  if (props.openable)
    window.open(currOriginalUrl.value, '_blank')
}
const onAuxClick = (e: MouseEvent) => {
  if (e.button === 1)
    onClick()
}
</script>
