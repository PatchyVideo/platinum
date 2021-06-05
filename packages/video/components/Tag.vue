<template>
  <div
    class="inline-block tag text-sm text-white whitespace-nowrap pr-1 mr-1"
    :class="'tag-' + tag.category.toLowerCase()"
    v-text="tag.name"
  ></div>
</template>

<script lang="ts" setup>
import type { schema } from '@/graphql'
import { behMostMatch } from '@/locales'
import { computed, defineProps } from 'vue'

const props = defineProps<{
  tag: schema.TagObject
}>()

const tag = computed(() => {
  return {
    id: props.tag.id,
    category: props.tag.category.toLowerCase(),
    name: behMostMatch(props.tag.languages),
  }
})
</script>

<style lang="postcss" scoped>
@define-mixin border $color {
  border-image-source: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.2' overflow='visible' width='64' height='64'%3e%3cpath fill='$(color)' stroke='$(color)' stroke-width='6.619' stroke-miterlimit='10' d='M53.912 3.31h-14.75c-2.317 0-4.633.772-6.287 2.096L5.74 27.256c-3.309 2.647-3.309 6.84 0 9.489l27.134 21.849c1.654 1.324 3.86 2.096 6.287 2.096h14.75c3.75 0 6.728-2.207 6.728-4.855V8.165c0-2.648-2.978-4.855-6.728-4.855zm-29.2 38.732c-5.514 0-10.037-4.525-10.037-10.042 0-5.517 4.523-10.042 10.038-10.042 5.514 0 10.037 4.525 10.037 10.042a10.005 10.005 0 01-10.037 10.042z' /%3e%3c/svg%3e");
}
.tag {
  border-width: 2px 2px 2px 15px;
  border-image-slice: 8 8 8 40 fill;
  @mixin border %230073ff;
}
.tag-copyright {
  @mixin border %23a0a;
}
.tag-language {
  @mixin border %23585455;
}
.tag-character {
  @mixin border %230a0;
}
/* .tag-author {
  @mixin border %23a00;
} */
/* .tag-general {
  @mixin border %230073ff;
} */
.tag-meta {
  @mixin border %23f80;
}
.tag-soundtrack {
  @mixin border %23ff7792;
}
</style>
