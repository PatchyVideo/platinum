<template>
  <LayoutDefault>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-4/5">
      <div v-if="status === 'loading'" />
      <div v-else-if="status === 'error'">
        {{ errMsg }}
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
                    class="rank-item-body w-full my-2 md:my-8 h-30 sm:h-36 md:h-24 flex flex-row justify-between items-center"
                  >
                    <div class="flex w-1/2 sm:w-1/3 md:w-1/5 h-full flex-row justify-start items-center">
                      <div class="rank-number w-1/3 md:w-14 text-center md:text-left">{{ i + 1 }}</div>
                      <RouterLink
                        :to="'/user/' + rankItem._id.$oid"
                        class="relative h-auto md:h-24 w-2/3 md:w-auto md:min-w-max hover:opacity-70 hover:cursor-pointer transition-all duration-300"
                        @click.prevent.capture=""
                      >
                        <!-- TODO add UserAvatarPopper here -->
                        <UserAvatar
                          class="rounded-full h-auto w-auto md:h-full md:w-full"
                          :alt="rankItem.user_obj.profile.username"
                          :image="rankItem.user_obj.profile.image"
                        />
                      </RouterLink>
                    </div>
                    <div
                      class="w-1/2 sm:w-2/3 md:w-4/5 h-full ml-2 md:ml-0 flex flex-col justify-between items-start md:flex-row md:justify-between md:items-center"
                    >
                      <RouterLink
                        :to="'/users/' + rankItem._id.$oid"
                        class="w-full md:w-1/4 ml-0 md:ml-8"
                        @click.prevent.capture=""
                      >
                        <div class="rank-text overflow-hidden overflow-ellipsis whitespace-nowrap">
                          {{ rankItem.user_obj.profile.username }}
                        </div>
                      </RouterLink>
                      <div
                        class="w-full md:w-1/3 overflow-hidden overflow-ellipsis md:overflow-clip md:overflow-auto my-2 md:my-0 ml-0 md:ml-4 md:max-h-28 h-6 md:h-auto box-border text-gray-500 md:break-normal whitespace-nowrap md:whitespace-normal"
                      >
                        {{ rankItem.user_obj.profile.desc }}
                      </div>
                      <div
                        class="rank-text w-full md:w-5/12 md:w-auto flex-grow ml-0 md:ml-8 text-left md:text-right whitespace-normal md:whitespace-nowrap"
                      >
                        {{ t('leaderboard.tag-contributions.edit-time', rankItem.count) }}
                      </div>
                    </div>
                  </div>
                  <div class="w-full h-px my-4 md:my-8 bg-gray-400" />
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
import { computed, ref, watch, watchEffect } from 'vue'
import NProgress from 'nprogress'
import { resDataStatus } from '@/common/lib/resDataStatus'

import { useI18n } from 'vue-i18n'
import BackTop from '@/ui/components/BackTop.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
// import UserAvatarPopper from '@/user/components/UserAvatarPopper.vue'
import PvTabs from '@/ui/components/PvTabs.vue'
import PvSelect from '@/ui/components/PvSelect.vue'

const { t } = useI18n()
const status = ref<'loading' | 'result' | 'error'>()
const loading = ref(false)
const errMsg = ref('')
const rankList = ref([])
const currentRankType = ref('tag-contributions')
const dateRangeList = computed(() => [
  { value: (24 * 7 * 52 * 10).toString(), name: t('leaderboard.tag-contributions.date-range.all') },
  { value: (24 * 30).toString(), name: t('leaderboard.tag-contributions.date-range.last-month') },
  { value: (24 * 7).toString(), name: t('leaderboard.tag-contributions.date-range.last-week') },
  { value: (24).toString(), name: t('leaderboard.tag-contributions.date-range.last-day') },
])
const selectedDateRange = ref(dateRangeList.value[0].value)

watch(
  selectedDateRange,
  async (newValue) => {
    let res = await fetch('https://patchyvideo.com/be/ranking/tag_contributor.do', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        hrs: newValue,
        size: 30,
      }),
      credentials: 'include',
    })
      .then((data) => data.json())
      .catch((err) => {
        errMsg.value = err
        status.value = 'error'
      })
    if (res.status === resDataStatus.SUCCEED) rankList.value = res.data
    else {
      status.value = 'error'
      errMsg.value = t('leaderboard.failed.load-failed')
    }
  },
  { immediate: true }
)

watchEffect(() => {
  if (loading.value) {
    status.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    status.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})
/*setInterval(() => {
  currentRankType.value = currentRankType.value === '1' ? '2' : '1'
  test.value = test.value + 1
}, 1000)*/
</script>

<style lang="postcss" scoped>
.rank-list {
  > .rank-item > .rank-item-body {
    transition: all 0.3s ease;
    &:hover {
      background-color: #f4f4f5;
      -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    .rank-number,
    .rank-text {
      transition: all 0.3s ease;
    }
    .rank-number {
      /* TODO remove apply, but rewriting leaderboard is absolutely going to happened */
      @apply text-3xl font-bold text-gray-600 hover:opacity-70 hover:cursor-pointer;
    }
    .rank-text {
      @apply text-xl font-bold text-gray-600 hover:opacity-70 hover:cursor-pointer;
    }
  }
  > .rank-item:nth-child(1) > .rank-item-body {
    .rank-number,
    .rank-text {
      text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 5px #f77;
      color: #f77 !important;
    }
  }
  > .rank-item:nth-child(2) > .rank-item-body {
    .rank-number,
    .rank-text {
      text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 5px #228dff;
      color: #228dff !important;
    }
  }
  > .rank-item:nth-child(3) > .rank-item-body {
    .rank-number,
    .rank-text {
      text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 5px #54df31;
      color: #54df31 !important;
    }
  }
}
</style>
