<template><NavTop v-bind="navtopProps" /><slot /><Footer v-bind="footerProps" /></template>

<script lang="ts" setup>
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import { reactivePick } from '@vueuse/core'

const props = defineProps({
  showSearchBar: {
    type: Boolean,
    default: true,
  },
  fetchNote: {
    type: Boolean,
    default: true,
  },
  small: {
    type: Boolean,
    default: false,
  },
})

const navtopProps = reactivePick(props, 'showSearchBar', 'fetchNote')
const footerProps = reactivePick(props, 'small')
</script>
