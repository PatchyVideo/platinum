<template>
  <div class="max-w-screen-3xl mx-auto">
    <NavTop />

    <div class="md:my-4 xl:my-6 max-w-screen-xl mx-auto">
      <div class="md:ml-4 md:flex justify-start space-x-2 md:space-x-4">
        <div class="flex-shrink-0 flex-grow-0 md:w-80 <md:h-30 overflow-hidden">
          <div class="md:aspect-5/8 <md:relative <md:top-1/2 <md:transform <md:-translate-y-1/2">
            <img
              class="inline-block <md:w-full md:border-pink-300 md:rounded-xl md:border-4"
              width="320"
              height="200"
              :src="getCoverImage({ image: playlist.item.cover })"
            />
          </div>
        </div>
        <div class="mt-2">
          <h1 class="text-2xl font-semibold" v-text="playlist.item.title"></h1>
          <div class="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
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
          <div v-if="playlist.meta.createdBy" class="mt-2">
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
              dark:hover:bg-gray-800
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
      <div class="pt-2 xl:pt-4">
        <div
          v-for="(video, index) in playlist.videos"
          :key="video.id.toHexString()"
          class="
            flex
            justify-start
            space-x-1
            md:space-x-2
            xl:space-x-3
            py-2
            xl:py-3
            md:px-2
            transition-color
            duration-150
            odd:bg-gray-50
            dark:odd:bg-gray-600
            hover:bg-pink-50
            dark:hover:bg-gray-800
            hover:odd:bg-pink-50
            dark:hover:odd:bg-gray-800
          "
          @click="router.push('/video/' + video.id.toHexString())"
        >
          <div
            class="
              flex flex-col flex-shrink-0 flex-grow-0
              justify-around
              w-8
              self-center
              items-center
              text-center
              md:space-y-1
            "
          >
            <div v-if="playlist.editable" class="md:text-2xl transition-color duration-100 hover:text-blue-600">
              <icon-uil-arrow-up />
            </div>
            <div class="<md:text-xs" v-text="offset + index + 1"></div>
            <div v-if="playlist.editable" class="md:text-2xl transition-color duration-100 hover:text-blue-600">
              <icon-uil-arrow-down />
            </div>
          </div>
          <div class="flex-shrink-0 flex-grow-0 w-35 md:w-60">
            <div class="aspect-5/8">
              <img
                class="inline-block rounded-lg border-gray-200 border-2"
                width="240"
                height="150"
                :src="getCoverImage({ image: playlist.item.cover })"
              />
            </div>
          </div>
          <div class="overflow-hidden">
            <h1 class="text-sm md:text-lg font-semibold <md:line-clamp-2 md:truncate" v-text="video.item.title"></h1>
            <h2
              v-if="video.item.partName"
              class="-mt-1 text-sm text-gray-700 truncate dark:text-gray-200"
              v-text="`P${pageOfVideo(video.item.url)}: ${video.item.partName}`"
            ></h2>
            <div
              v-if="screenSizes.md"
              class="mt-1 line-clamp-3 text-sm whitespace-normal"
              v-text="video.item.desc"
            ></div>
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
import { screenSizes } from '@/tailwindcss'

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
      screenSizes,
    }
  },
})
</script>
