<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop />

    <div class="my-4 max-w-screen-xl mx-auto">
      <div class="flex justify-start space-x-6">
        <img
          class="flex-shrink-0 w-80 h-50 inline-block border-pink-300 rounded-xl border-4"
          width="320"
          height="200"
          :src="getCoverImage({ image: playlist.item.cover })"
        />
        <div class="mt-2">
          <h1 class="text-2xl font-semibold" v-text="playlist.item.title"></h1>
          <div class="text-sm text-gray-700 dark:text-gray-200">
            {{
              t('playlist.playlist.info.video-count', {
                count: playlist.item.count,
              })
            }}<span v-if="playlist.rating">
              · {{ t('playlist.playlist.info.rating', { rating: playlist.rating.totalRating }) }}</span
            ><span v-if="playlist.meta.modifiedAt || playlist.meta.createdAt">
              ·
              <i18n-t keypath="playlist.playlist.info.edit-date" tag="span"
                ><template #date
                  ><RelativeDate :date="playlist.meta.modifiedAt ?? playlist.meta.createdAt" /></template></i18n-t
            ></span>
          </div>
          <div v-if="playlist.meta.createdBy">
            <UserAvatar
              :image="playlist.meta.createdBy.image"
              :gravatar="playlist.meta.createdBy.gravatar"
              class="inline-block w-8 rounded-full"
            />
            <div class="inline-block align-middle pl-2" v-text="playlist.meta.createdBy.username"></div>
          </div>
          <div
            ref="descContainer"
            class="overflow-hidden transition-all duration-600 ease-in-out"
            :style="{ maxHeight: expandDesc ? (descContainer ? descContainer.scrollWidth + 'px' : 'none') : '96px' }"
          >
            <MarkdownBlock ref="descText" class="py-2" size="sm" :text="playlist.item.desc" />
          </div>
          <div
            v-if="shouldClampDesc || expandDesc"
            class="
              w-full
              rounded
              text-sm text-gray-700
              py-0.5
              px-1
              transition-color
              duration-150
              dark:text-gray-200
              hover:bg-gray-100
              hover:text-blue-600
            "
            @click="expandDesc = !expandDesc"
          >
            <icon-uil-arrow-down class="inline transform" :class="{ 'rotate-180': expandDesc }" />{{
              !expandDesc ? t('playlist.playlist.expand') : t('playlist.playlist.collapse')
            }}
          </div>
        </div>
      </div>
      <div class="pt-2">
        <div
          v-for="(video, index) in playlist.videos"
          :key="video.id.toHexString()"
          class="
            flex
            justify-around
            space-x-2
            py-2
            px-2
            transition-color
            duration-150
            odd:bg-gray-50
            hover:bg-pink-50
            hover:odd:bg-pink-50
          "
          @click="router.push('/video/' + video.id.toHexString())"
        >
          <div class="flex flex-col justify-around flex-shrink-0 w-8 self-center items-center text-center space-y-1">
            <div v-if="playlist.editable" class="text-2xl transition-color duration-100 hover:text-blue-600">
              <icon-uil-arrow-up />
            </div>
            <div v-text="offset + index + 1"></div>
            <div v-if="playlist.editable" class="text-2xl transition-color duration-100 hover:text-blue-600">
              <icon-uil-arrow-down />
            </div>
          </div>
          <img
            class="flex-shrink-0 w-60 h-37.5 inline-block rounded-lg border-gray-200 border-2"
            width="240"
            height="150"
            :src="getCoverImage({ image: playlist.item.cover })"
          />
          <div class="overflow-hidden">
            <h1 class="text-lg font-semibold truncate" v-text="video.item.title"></h1>
            <h2
              v-if="video.item.partName"
              class="-mt-1 text-sm text-gray-700 truncate dark:text-gray-200"
              v-text="`P${pageOfVideo(video.item.url)}: ${video.item.partName}`"
            ></h2>
            <div class="mt-1 line-clamp-3 text-sm whitespace-normal" v-text="video.item.desc"></div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script lang="ts">
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import MarkdownBlock from '@/markdown/components/MarkdownBlock.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import { computed, defineComponent, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import NProgress from 'nprogress'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { gql, useQuery } from '@/graphql'
import { getCoverImage } from '@/common/lib/imageUrl'
import { pageOfVideo } from '@/video/lib/biliHelper'
import { templateRef, useElementBounding, useElementSize } from '@vueuse/core'

export default defineComponent({
  components: {
    NavTop,
    Footer,
    MarkdownBlock,
    UserAvatar,
    RelativeDate,
  },
  async setup() {
    const descContainer = templateRef('descContainer')
    const { height: containerHeight } = useElementBounding(descContainer)
    const descText = templateRef('descText')
    const { height: textHeight } = useElementSize(descText)

    const { t } = useI18n()
    const router = useRouter()

    /* submit query */
    const route = useRoute()
    const pid = computed(() => <string>route.params.pid)
    const offset = ref(0)
    NProgress.inc()
    const res = await useQuery({
      query: gql`
        query ($pid: String!, $offset: Int!, $limit: Int!) {
          getPlaylist(para: { pid: $pid }) {
            item {
              title
              cover
              count
              desc
            }
            rating {
              totalRating
            }
            videos(offset: $offset, limit: $limit) {
              id
              item {
                title
                partName
                desc
                coverImage
                url
              }
            }
            meta {
              createdBy {
                username
                image
                gravatar
              }
              createdAt
              modifiedAt
            }
            editable
          }
        }
      `,
      variables: {
        pid: pid.value,
        offset: offset.value,
        limit: 20,
      },
    })
    if (NProgress.isStarted()) NProgress.done()

    /* basic info */
    const playlist = reactive(res.data.getPlaylist)
    // change title
    setSiteTitle(playlist.item.title)

    console.log(playlist)

    const shouldClampDesc = computed(() => textHeight.value > containerHeight.value)
    const expandDesc = ref(false)

    return {
      t,
      getCoverImage,
      playlist,
      pageOfVideo,
      offset,
      expandDesc,
      shouldClampDesc,
      textHeight,
      descContainer,
      descText,
      router,
    }
  },
})
</script>
