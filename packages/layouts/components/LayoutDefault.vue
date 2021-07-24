<template><NavTop v-bind="navtopProps" /><slot /><Footer v-bind="footerProps" /></template>

<script lang="ts" setup>
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import { defineProps } from 'vue'
import { reactivePick } from '@vueuse/shared'

const props = defineProps({
  showSearchBar: {
    type: Boolean,
    default: true,
  },
  fetchNotice: {
    type: Boolean,
    default: true,
  },
  small: {
    type: Boolean,
    default: false,
  },
})

const navtopProps = reactivePick(props, 'showSearchBar', 'fetchNotice')
const footerProps = reactivePick(props, 'small')
</script>
