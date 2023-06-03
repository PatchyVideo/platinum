<script lang="ts">
export interface Link {
  key: string
  type: 'router' | 'a' | 'blank'
  icon?: string
  text: string
  path?: string
  href?: string
}
</script>

<script lang="ts" setup>
const props = defineProps<{
  link: Partial<Link>
}>()
</script>

<template>
  <div>
    <div v-if="link.type === 'blank'" class="w-full ">
      <div v-if="link.text === ''" class="w-full p-2" />
      <div v-else class="px-2 pt-5 text-sm text-gray-500">
        {{ link.text }}
      </div>
    </div>
    <div v-else class="transition transition-colors hover:bg-purple-100 px-2 py-1 rounded">
      <NuxtLink v-if="props.link.type === 'router'" :to="props.link.path" class="flex flex-row items-center gap-x-2">
        <div v-if="props.link.icon" class="text-xl text-center" :class="props.link.icon" />
        <div v-text="props.link.text" />
      </NuxtLink>
      <a
        v-else-if="props.link.type === 'a'" class="flex flex-row items-center gap-x-2" target="_blank"
        rel="noopener noreferrer" :href="props.link.href"
      >
        <span v-if="props.link.icon" class="text-xl text-center" :class="props.link.icon" />
        <span v-text="props.link.text" />
      </a>
    </div>
  </div>
</template>
