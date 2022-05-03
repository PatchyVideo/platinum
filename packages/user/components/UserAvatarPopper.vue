<template>
  <div ref="el">
    <slot />
  </div>
  <div
    v-show="popperShowing && user"
    ref="popper"
    class="popper z-910 px-3 py-2 max-w-72 rounded-md border border-purple-300 shadow-md bg-white dark:bg-gray-900"
  >
    <RouterLink :to="`/user/${uid}`">
      <div v-if="user" class="flex flex-row space-x-2">
        <div class="flex-shrink-0 flex-grow-0 rounded-full border border-purple-300 dark:border-purple-800">
          <UserAvatar
            class="inline-block w-16 h-16 rounded-full object-cover"
            :alt="user.username"
            :image="user.image"
            :gravatar="user.gravatar"
          />
        </div>
        <div class="min-w-0 mt-1">
          <div class="truncate font-medium" :title="user.username" v-text="user.username" />
          <div class="line-clamp-2 text-sm text-gray-800 dark:text-gray-300" :title="user.desc" v-text="user.desc" />
        </div>
      </div>
    </RouterLink>
    <div class="popper-arrow" data-popper-arrow />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, shallowRef, watchEffect } from 'vue'
import { until, useEventListener, watchDebounced } from '@vueuse/core'
import { createPopper } from '@popperjs/core'
import type { Instance as PopperInstance } from '@popperjs/core'
import UserAvatar from './UserAvatar.vue'
import { gql, useLazyQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'

const props = defineProps<{
  uid: string
}>()

const el = shallowRef<HTMLImageElement | null>(null)
const popper = shallowRef<HTMLDivElement | null>(null)

const { result, load } = useLazyQuery<Query>(
  gql`
    query ($uid: String!) {
      getUser(para: { uid: $uid }) {
        username
        desc
        image
        gravatar
      }
    }
  `,
  {
    uid: props.uid,
  },
)

const user = useResult(result, null, data => data?.getUser)

const popperShowing = ref(false)
const popperHovering = ref(false)
let popperInstance: PopperInstance
onMounted(() => {
  popperInstance = createPopper(el.value!, popper.value!, {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-10, 8],
        },
      },
      {
        name: 'arrow',
        options: {
          padding: 10,
        },
      },
    ],
  })

  const showPopper = () => {
    if (popperShowing.value)
      return

    popper.value!.setAttribute('data-show', '')

    popperInstance.setOptions(options => ({
      ...options,
      modifiers: [...(options.modifiers ?? []), { name: 'eventListeners', enabled: true }],
    }))

    popperInstance.update()

    popperShowing.value = true
  }
  const hidePopper = () => {
    if (!popperShowing.value)
      return

    popper.value!.removeAttribute('data-show')

    popperInstance.setOptions(options => ({
      ...options,
      modifiers: [...(options.modifiers ?? []), { name: 'eventListeners', enabled: false }],
    }))

    popperShowing.value = false
  }

  useEventListener(el, 'mouseenter', () => {
    popperHovering.value = true
  })
  useEventListener(popper, 'mouseenter', () => {
    popperHovering.value = true
  })
  useEventListener(el, 'mouseleave', () => {
    popperHovering.value = false
  })
  useEventListener(popper, 'mouseleave', () => {
    popperHovering.value = false
  })

  watchDebounced(
    popperHovering,
    (v) => {
      if (v)
        showPopper()
      else hidePopper()
    },
    { debounce: 500 },
  )

  watchEffect(() => {
    if (user)
      popperInstance.update()
  })
})
onUnmounted(() => {
  if (popperInstance)
    popperInstance.destroy()
})
until(popperHovering)
  .toBeTruthy()
  .then(() => {
    load()
  })
</script>

<style lang="postcss" scoped>
.popper-arrow,
.popper-arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  /* border-color: theme('colors.gray.300'); */
  border-color: #d1d5db;
  background: inherit;
}

.popper-arrow {
  visibility: hidden;
}

.popper-arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}

.popper[data-popper-placement^='top'] {
  .popper-arrow {
    bottom: -5px;
  }
  .popper-arrow::before {
    border-bottom-width: 1px;
    border-right-width: 1px;
  }
}

.popper[data-popper-placement^='bottom'] {
  .popper-arrow {
    top: -5px;
  }
  .popper-arrow::before {
    border-top-width: 1px;
    border-left-width: 1px;
  }
}

.popper[data-popper-placement^='left'] {
  .popper-arrow {
    right: -5px;
  }
  .popper-arrow::before {
    border-right-width: 1px;
    border-top-width: 1px;
  }
}

.popper[data-popper-placement^='right'] {
  .popper-arrow {
    left: -5px;
  }
  .popper-arrow::before {
    border-left-width: 1px;
    border-bottom-width: 1px;
  }
}
</style>
