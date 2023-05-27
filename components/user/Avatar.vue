<script lang="ts" setup>
import { hash as md5 } from 'spark-md5'
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

const imgs = ref<Set<string>>(new Set())
const originalImgs = ref<Set<string>>(new Set())

const currImg = ref(0)
const currUrl = computed(() => [...imgs.value][currImg.value])
const currOriginalUrl = computed(() => [...originalImgs.value][currImg.value])
function onError(e: Event) {
  if (currImg.value < imgs.value.size - 1)
    currImg.value++
}

function setImgs() {
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
      `https://gravatar.loli.net/avatar/${props.gravatar}?s=256&d=404`,
      `https://gravatar.loli.net/avatar/${props.gravatar}?s=512&d=404`,
    )
  }
  if (props.email) {
    pushImg(
      `https://gravatar.loli.net/avatar/${md5(props.email)}?s=256&d=404`,
      `https://gravatar.loli.net/avatar/${md5(props.email)}?s=512&d=404`,
    )
  }
  if (props.gravatar && props.gravatar.length === 32) {
    pushImg(
      `https://gravatar.com/avatar/${props.gravatar}?s=256&d=404`,
      `https://gravatar.com/avatar/${props.gravatar}?s=512&d=404`,
    )
  }
  if (props.email) {
    pushImg(
      `https://gravatar.com/avatar/${md5(props.email)}?s=256&d=404`,
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

function onClick() {
  // use a `window.open` to open link here since this component should expose an `img` element
  if (props.openable)
    window.open(currOriginalUrl.value, '_blank')
}
function onAuxClick(e: MouseEvent) {
  if (e.button === 1)
    onClick()
}
</script>

<template>
  <img
    class="max-w-none aspect-square overflow-hidden dark:filter dark:brightness-90 bg-gray-300 dark:bg-gray-600"
    :alt="t('user.avatar.alt', { alt })"
    :title="hideTitle ? undefined : t('user.avatar.alt', { alt })"
    :src="currUrl"
    @error="onError"
    @click="onClick"
    @auxclick="onAuxClick"
  >
</template>
