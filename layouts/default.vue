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

const navtopProps = reactivePick(props, 'showSearchBar', 'fetchNote')
const footerProps = reactivePick(props, 'small')
</script>

<template>
  <div>
    <Toolbar v-bind="navtopProps" />

    <div class="max-w-screen-3xl mx-auto px-2">
      <slot />
    </div>

    <Footer v-bind="footerProps" />
  </div>
</template>
