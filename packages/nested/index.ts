import { useEventListener } from '@vueuse/core'
import { inject, provide, reactive } from 'vue'

declare global {
  interface Window {
    sharedObjectKey: symbol
    sharedObject?: unknown
  }
}

type OpenWindowOptions = {
  url: string
  width?: string
  height?: string
  sharedObject?: unknown
}

window.sharedObjectKey = window.opener?.sharedObjectKey ?? Symbol('sharedObject')

const mouse = reactive({
  x: 0,
  y: 0,
})
useEventListener('mousemove', (e) => {
  mouse.x = e.screenX
  mouse.y = e.screenY
})

export function openWindow(options: OpenWindowOptions): {
  window: Window
} {
  const win = window.open(
    options.url,
    '_blank',
    `toolbar=no,location=no,status=no,menubar=no,width=${options.width ?? 800},height=${options.height ?? 600},left=${
      mouse.x - 150
    },top=${mouse.y - 100}`
  )
  if (!win) {
    throw new Error('no-window')
  }
  if (options.sharedObject) {
    win.sharedObject = options.sharedObject
  }
  return {
    window: win,
  }
}

export function provideSharedObject(): void {
  if (window.sharedObject) provide(window.sharedObjectKey, window.sharedObject!)
}

export function useSharedObject<type>(): type | undefined {
  return inject<type>(window.sharedObjectKey)
}
