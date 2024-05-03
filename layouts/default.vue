<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    showSearchBar?: boolean
    fetchNote?: boolean
    small?: boolean
  }>(),
  {
    showSearchBar: true,
    fetchNote: true,
    small: false,
  },
)

const route = useRoute()

const navtopProps = reactivePick(props, 'showSearchBar', 'fetchNote')
const footerProps = reactivePick(props, 'small')
</script>

<template>
  <div>
    <Toolbar v-bind="navtopProps" :key="route.path" />

    <div class="max-w-460 mx-auto mt-2 md:mt-5 px-2">
      <slot />
    </div>

    <Footer v-bind="footerProps" />
  </div>
</template>
