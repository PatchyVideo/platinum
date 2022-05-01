import { inject, provide } from 'vue'

declare global {
  interface Window {
    sharedObjectKey: symbol
    sharedObject?: unknown
  }
}

interface OpenWindowOptions {
  url: string
  width?: number
  height?: number
  sharedObject?: unknown
}

window.sharedObjectKey = window.opener?.sharedObjectKey ?? Symbol('sharedObject')

export function openWindow(options: OpenWindowOptions): {
  window: Window
} {
  const width = options.width ?? 800
  const height = options.height ?? 600
  const win = window.open(
    options.url,
    '_blank',
    `toolbar=no,location=no,status=no,menubar=no,width=${width},height=${height},left=${
      (window.screen.width - width) / 2
    },top=${(window.screen.height - height) / 2}`,
  )
  if (!win)
    throw new Error('no-window')

  if (options.sharedObject)
    win.sharedObject = options.sharedObject

  return {
    window: win,
  }
}

export function provideSharedObject(): void {
  if (window.sharedObject)
    provide(window.sharedObjectKey, window.sharedObject!)
}

export function useSharedObject<type>(): type | undefined {
  return inject<type>(window.sharedObjectKey)
}
