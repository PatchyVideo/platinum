<template>
  <NavTop v-bind="navtopProps" /><slot /><Footer v-bind="footerProps" />
</template>

<script lang="ts" setup>
import { reactivePick } from '@vueuse/core'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'

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
