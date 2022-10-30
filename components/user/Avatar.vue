<script lang="ts" setup>
import { hash as md5 } from 'spark-md5'
// @ts-expect-error TODO: why
import defaultAvatar from '@/assets/images/DefaultAvatar.jpg?url'

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

const el = $shallowRef<HTMLImageElement | null>(null)

const imgs = $ref<Set<string>>(new Set())
const originalImgs = $ref<Set<string>>(new Set())

let currImg = $ref(0)
const currUrl = $computed(() => [...imgs][currImg])
const currOriginalUrl = $computed(() => [...originalImgs][currImg])
const onError = (e: Event) => {
  if (currImg < imgs.size - 1)
    currImg++
}

const setImgs = () => {
  const width = el?.clientWidth
  const s = width && width > 10 ? width : 48

  const pushImg = (url: string, ori?: string) => {
    if (ori) {
      imgs.add(url)
      originalImgs.add(ori)
    }
    else {
      imgs.add(url)
      originalImgs.add(url)
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

  currImg = 0
}

onMounted(() => {
  watchEffect(() => {
    setImgs()
  })
})

const onClick = () => {
  // use a `window.open` to open link here since this component should expose an `img` element
  if (props.openable)
    window.open(currOriginalUrl, '_blank')
}
const onAuxClick = (e: MouseEvent) => {
  if (e.button === 1)
    onClick()
}
</script>

<template>
  <img
    ref="el"
    class="max-w-none aspect-square overflow-hidden dark:filter dark:brightness-90 bg-gray-300 dark:bg-gray-600"
    :alt="t('user.avatar.alt', { alt })"
    :title="hideTitle ? undefined : t('user.avatar.alt', { alt })"
    :src="currUrl"
    @error="onError"
    @click="onClick"
    @auxclick="onAuxClick"
  >
</template>
