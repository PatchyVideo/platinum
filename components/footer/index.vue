<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    small?: boolean
  }>(),
  {
    small: false,
  },
)

const { info: { version, commitHash } } = useAppConfig()

const isDev = process.env.NODE_ENV !== 'production'
</script>

<template>
  <div class="mt-8">
    <FooterLinks />
    <FooterYiyan v-if="!small" />
    <div class="text-center my-2 text-sm text-gray-600 dark:text-gray-300">
      <FooterUserCount />
      <br>
      <span>
        <span>Platinum v{{ version }}</span>
        (<a
          :href="`https://github.com/PatchyVideo/platinum/commit/${commitHash}`"
          :title="commitHash"
          target="_blank"
          rel="noopener noreferrer"
        >{{ commitHash.slice(0, 7) }}</a>,
        {{ isDev ? 'dev' : 'prod' }}).
      </span>
      <span>
        © 2019-2022 VoileLabs. Released under the
        <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>.
      </span>
    </div>
  </div>
</template>
