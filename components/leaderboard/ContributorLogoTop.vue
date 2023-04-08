<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    // colorType: 1 | 2 | 3
    colorType?: number
  }>(),
  {
    colorType: 1,
  },
)
const colors = [
  {
    fill: '#FFD130',
    stroke: '#FFE072',
  },
  {
    fill: '#ADADAD',
    stroke: '#D4D4D4',
  },
  {
    fill: '#FFB966',
    stroke: '#FFCF97',
  },
]
</script>

<template>
  <div class="inline-block w-full relative">
    <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 157 164" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0">
      <rect x="46" width="65" height="86" fill="#D5A6FF" />
      <rect x="57" width="43" height="86" fill="#F3E8FF" />
      <path d="M78.5 18.6101L95.4279 54.0853C96.8857 57.1404 99.7901 59.2505 103.146 59.6929L142.116 64.8299L113.608 91.8917C111.153 94.2222 110.044 97.6366 110.66 100.965L117.817 139.615L83.2702 120.865C80.295 119.25 76.705 119.25 73.7298 120.865L39.1831 139.615L46.3399 100.965C46.9563 97.6366 45.8469 94.2222 43.3918 91.8917L14.884 64.8299L53.8538 59.6929C57.2099 59.2505 60.1143 57.1404 61.5721 54.0853L78.5 18.6101Z" :fill="colors[colorType - 1].fill" :stroke="colors[colorType - 1].stroke" stroke-width="10" />
    </svg>
  </div>
</template>
