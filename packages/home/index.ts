import { defineAsyncComponent, defineComponent } from 'vue'
import type { Component } from 'vue'

export const homeComponents: Record<string, Component> = {
  fallback: defineComponent({ render: () => [] }),
  playlist: defineAsyncComponent(() => import('./components/Playlist.vue')),
}
