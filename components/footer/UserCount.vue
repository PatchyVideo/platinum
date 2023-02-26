<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const { t } = useI18n()

const { data } = await useAsyncQuery<Query>(gql`
  query {
    getStats {
      users
    }
  }
`)
const userCount = computed(() => data.value?.getStats.users || 0)
</script>

<template>
  <span>{{ t('common.footer.user-number', { users: userCount }) }}</span>
</template>
