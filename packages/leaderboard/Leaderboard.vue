<template>
  <LayoutDefault>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-4/5">
      <div v-if="loading">
        {{ t('leaderboard.loading') }}
      </div>
      <div v-else-if="error">
        {{ error.message }}
      </div>
      <div v-else>
        <PvTabs
          v-model="currentRankType"
          :tabs="[
            { name: 'tag-contributions', label: t('leaderboard.tag-contributions.name') },
            { name: 'others', label: '其他排行榜' },
          ]"
        >
          <template #tag-contributions>
            <div class="flex flex-col flex-nowrap justify-start items-center px-0 md:px-2">
              <PvSelect v-model="selectedDateRange" class="md:w-1/4" :item-list="dateRangeList" />
              <div class="rank-list w-full">
                <div v-for="(rankItem, i) in rankList" :key="i" class="rank-item w-full">
                  <div
                    class="flex flex-row justify-between items-center w-full my-2 md:my-4 sm:h-36 md:h-30 p-4 hover:rounded-xl hover:bg-[#f4f4f5] hover:shadow-xl box-border transition-all duration-300 shadow-gray-500/20 cursor-pointer"
                  >
                    <div class="flex flex-row justify-start items-center w-1/2 sm:w-1/3 md:w-1/5 h-full">
                      <div
                        class="w-1/3 md:w-14 text-3xl text-center md:text-left text-gray-600 font-bold hover:opacity-70 transition-all duration-300 cursor-pointer"
                        :class="rankNumberTextIndexToClasses[i]"
                        v-text="i + 1"
                      />
                      <RouterLink
                        :to="`/user/${rankItem.user.id}`"
                        class="relative lt-md:w-2/3 md:min-w-max md:h-24 hover:opacity-70 transition-all duration-300 cursor-pointer"
                      >
                        <!-- TODO add UserAvatarPopper here -->
                        <UserAvatar
                          class="md:w-full md:h-full rounded-full"
                          :alt="rankItem.user.username"
                          :image="rankItem.user.image"
                        />
                      </RouterLink>
                    </div>
                    <div
                      class="flex flex-col md:flex-row justify-between md:items-center w-1/2 sm:w-2/3 md:w-4/5 h-full lt-md:ml-2"
                    >
                      <RouterLink :to="`/users/${rankItem.user.id}`" class="w-full md:w-1/4 md:ml-8">
                        <div
                          class="text-xl text-gray-600 font-bold hover:opacity-70 whitespace-nowrap overflow-hidden transition-all duration-300 cursor-pointer"
                          :class="rankNumberTextIndexToClasses[i]"
                          v-text="rankItem.user.username"
                        />
                      </RouterLink>
                      <div
                        class="w-full md:w-1/3 lt-md:h-6 md:max-h-28 md:overflow-auto md:ml-4 lt-md:my-2 text-gray-500 text-ellipsis overflow-hidden md:overflow-clip whitespace-nowrap md:whitespace-normal box-border"
                        v-text="rankItem.user.desc"
                      />
                      <div
                        class="flex-grow w-full md:w-5/12 md:ml-8 text-left md:text-right text-xl font-bold text-gray-600 hover:opacity-70 whitespace-normal md:whitespace-nowrap transition-all duration-300 cursor-pointer"
                        :class="rankNumberTextIndexToClasses[i]"
                        v-text="t('leaderboard.tag-contributions.edit-time', rankItem.count)"
                      />
                    </div>
                  </div>
                  <div class="w-full h-px my-4 md:my-8 bg-gray-400" />
                </div>
              </div>
            </div>
          </template>
          <template #others>
            其他排行榜列表
          </template>
        </PvTabs>
      </div>
    </div>
    <BackTop />
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import BackTop from '@/ui/components/BackTop.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import PvTabs from '@/ui/components/PvTabs.vue'
import PvSelect from '@/ui/components/PvSelect.vue'
import type { Query } from '@/graphql'
import { gql, useQuery, useResult } from '@/graphql'
import { startProgress, stopProgress } from '@/nprogress'

const { t } = useI18n()

const currentRankType = ref('tag-contributions')
const dateRangeList = computed(() => [
  { value: `${24 * 7 * 52 * 10}`, name: t('leaderboard.tag-contributions.date-range.all') },
  { value: `${24 * 30}`, name: t('leaderboard.tag-contributions.date-range.last-month') },
  { value: `${24 * 7}`, name: t('leaderboard.tag-contributions.date-range.last-week') },
  { value: `${24}`, name: t('leaderboard.tag-contributions.date-range.last-day') },
])
const selectedDateRange = ref(dateRangeList.value[0].value)
const rankNumberTextIndexToClasses = reactive<Record<number, string>>({
  0: 'text-shadow-xl text-[#f77]',
  1: 'text-shadow-xl text-[#228dff]',
  2: 'text-shadow-xl text-[#54df31]',
})
const { result, loading, error } = useQuery<Query>(
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
  {
    dateRangeNumber: computed(() => parseInt(selectedDateRange.value)),
  },
  {
    fetchPolicy: 'network-only',
  },
)
watchEffect(() => {
  if (loading.value)
    startProgress()
  else
    stopProgress()
})

const rankList = useResult(result, [], data => data.getLeaderboard.items)
</script>
