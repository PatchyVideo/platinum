<template>
  <h2 class="inline-block text-2xl font-light" v-text="t('settings.account.profile.name')"></h2>
  <RouterLink
    class="ml-2 px-1 pb-0.5 rounded-lg border border-purple-400 dark:border-purple-800"
    :to="'/user/' + user.uid"
    >{{ t('common.nav-top.user.userprofile') }}
    <div class="i-uil:external-link-alt text-lg"></div
  ></RouterLink>
  <div class="w-full h-px my-2 bg-gray-300"></div>
  <div v-if="!loading" class="flex flex-col">
    <div>
      <div class="mb-1">
        <h3 class="font-medium" v-text="t('settings.account.profile.username.label')"></h3>
        <div
          class="text-sm text-gray-600 dark:text-gray-300"
          v-text="t('settings.account.profile.username.desc')"
        ></div>
      </div>
      <div
        class="w-full max-w-112 rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-gray-800"
      >
        <input v-model="name" class="inline-block px-2 py-1 w-full rounded-lg outline-none dark:bg-gray-800" />
      </div>
    </div>
    <div class="mt-4">
      <div class="mb-1">
        <h3 class="font-medium" v-text="t('settings.account.profile.description.label')"></h3>
      </div>
      <div
        class="w-full max-w-112 rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-gray-800"
      >
        <textarea
          v-model="desc"
          rows="4"
          class="inline-block px-2 py-1 w-full rounded-lg outline-none dark:bg-gray-800"
        ></textarea>
      </div>
    </div>
  </div>
  <div v-else class="flex">
    <div class="mt-30vh mb-40vh mx-auto text-xl text-gray-600 dark:text-gray-300">
      <div class="inline-block align-middle" v-text="t('settings.account.loading')"></div>
      <div class="i-uil:spinner-alt text-2xl animate-spin"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'
import { user } from '@/user'

const { t } = useI18n()

const name = ref('')
const desc = ref('')

const { result, loading } = useQuery<Query>(
  gql`
    query ($uid: String!) {
      getUser(para: { uid: $uid }) {
        id
        desc
        username
        image
        email
        gravatar
      }
    }
  `,
  {
    uid: user.value.uid,
  },
  {
    fetchPolicy: 'network-only',
  }
)
const userData = useResult(result, null, (data) => data.getUser)
watchEffect(() => {
  if (userData.value) {
    name.value = userData.value.username
    desc.value = userData.value.desc
  }
})
</script>
