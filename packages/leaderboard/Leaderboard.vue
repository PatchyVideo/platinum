<template>
  <LayoutDefault>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-4/5">
      <div v-if="status === 'loading'">{{ t('leaderboard.loading') }}</div>
      <div v-else-if="status === 'error'">
        {{ error.message }}
      </div>
      <div v-else-if="status === 'result'">
        <PvTabs
          v-model:value="currentRankType"
          :tab-panes="[
            { name: 'tag-contributions', label: t('leaderboard.tag-contributions.name') },
            { name: 'others', label: '其他排行榜' },
          ]"
        >
          <template #tag-contributions>
            <div class="px-0 md:px-2 flex flex-nowrap flex-col justify-start items-center">
              <PvSelect v-model:selected="selectedDateRange" class="md:w-1/4" :item-list="dateRangeList" />
              <div class="rank-list w-full">
                <div v-for="(rankItem, i) in rankList" :key="i" class="rank-item w-full">
                  <div
                    class="w-full my-2 h-auto p-4 box-border flex flex-row justify-between items-center transition-all duration-300 shadow-gray-500/20 hover:bg-[#f4f4f5] hover:shadow-xl hover:rounded-xl hover:cursor-pointer md:my-4 sm:h-36 md:h-30"
                  >
                    <div class="flex w-1/2 sm:w-1/3 md:w-1/5 h-full flex-row justify-start items-center">
                      <div
                        class="w-1/3 text-center transition-all duration-300 text-3xl font-bold text-gray-600 hover:opacity-70 hover:cursor-pointer md:w-14 md:text-left"
                        :class="rankNumberTextIndexToClasses[i]"
                      >
                        {{ i + 1 }}
                      </div>
                      <RouterLink
                        :to="'/user/' + rankItem.user.id"
                        class="relative h-auto md:h-24 w-2/3 md:w-auto md:min-w-max hover:opacity-70 hover:cursor-pointer transition-all duration-300"
                        @click.prevent.capture=""
                      >
                        <!-- TODO add UserAvatarPopper here -->
                        <UserAvatar
                          class="rounded-full h-auto w-auto md:h-full md:w-full"
                          :alt="rankItem.user.username"
                          :image="rankItem.user.image"
                        />
                      </RouterLink>
                    </div>
                    <div
                      class="w-1/2 sm:w-2/3 md:w-4/5 h-full ml-2 md:ml-0 flex flex-col justify-between items-start md:flex-row md:justify-between md:items-center"
                    >
                      <RouterLink
                        :to="'/users/' + rankItem.user.id"
                        class="w-full md:w-1/4 ml-0 md:ml-8"
                        @click.prevent.capture=""
                      >
                        <div
                          class="overflow-hidden overflow-ellipsis whitespace-nowrap transition-all duration-300 text-xl font-bold text-gray-600 hover:opacity-70 hover:cursor-pointer"
                          :class="rankNumberTextIndexToClasses[i]"
                        >
                          {{ rankItem.user.username }}
                        </div>
                      </RouterLink>
                      <div
                        class="w-full md:w-1/3 overflow-hidden overflow-ellipsis md:overflow-clip md:overflow-auto my-2 md:my-0 ml-0 md:ml-4 md:max-h-28 h-6 md:h-auto box-border text-gray-500 md:break-normal whitespace-nowrap md:whitespace-normal overflow-hidden text-ellipsis"
                      >
                        {{ rankItem.user.desc }}
                      </div>
                      <div
                        class="w-full flex-grow ml-0 text-left transition-all duration-300 whitespace-normal text-xl font-bold text-gray-600 hover:opacity-70 hover:cursor-pointer md:whitespace-nowrap md:text-right md:ml-8 md:w-5/12 md:w-auto"
                        :class="rankNumberTextIndexToClasses[i]"
                      >
                        {{ t('leaderboard.tag-contributions.edit-time', rankItem.count) }}
                      </div>
                    </div>
                  </div>
                  <div class="w-full h-px my-4 bg-gray-400 md:my-8" />
                </div>
              </div>
            </div>
          </template>
          <template #others>其他排行榜列表</template>
        </PvTabs>
      </div>
    </div>
    <BackTop />
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import NProgress from 'nprogress'

import { useI18n } from 'vue-i18n'
import BackTop from '@/ui/components/BackTop.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import PvTabs from '@/ui/components/PvTabs.vue'
import PvSelect from '@/ui/components/PvSelect.vue'
import type { Query } from '@/graphql'
import { gql, useQuery } from '@/graphql'

const { t } = useI18n()
const status = ref<'loading' | 'result' | 'error'>()
const currentRankType = ref('tag-contributions')
const dateRangeList = computed(() => [
  { value: (24 * 7 * 52 * 10).toString(), name: t('leaderboard.tag-contributions.date-range.all') },
  { value: (24 * 30).toString(), name: t('leaderboard.tag-contributions.date-range.last-month') },
  { value: (24 * 7).toString(), name: t('leaderboard.tag-contributions.date-range.last-week') },
  { value: (24).toString(), name: t('leaderboard.tag-contributions.date-range.last-day') },
])
const selectedDateRange = ref(dateRangeList.value[0].value)
const rankNumberTextIndexToClasses = reactive({
  0: 'text-shadow-xl text-[#f77]',
  1: 'text-shadow-xl text-[#228dff]',
  2: 'text-shadow-xl text-[#54df31]',
})
const {
  result: rankListResult,
  loading,
  error,
  onError,
} = useQuery<Query>(
  gql`
    query ($dateRangeNumber: Int!) {
      getLeaderboard(hrs: $dateRangeNumber, k: 30) {
        items {
          count
          user {
            id
            username
            desc
            image
          }
        }
      }
    }
  `,
  () => ({
    dateRangeNumber: parseInt(selectedDateRange.value),
  }),
  { fetchPolicy: 'no-cache' }
)
const rankList = computed(() => {
  return rankListResult.value ? rankListResult.value.getLeaderboard.items : []
})

onError(() => {
  status.value = 'error'
})
watchEffect(() => {
  if (loading.value) {
    status.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    status.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})
</script>

<style lang="postcss" scoped></style>
