import { reactive } from 'vue'

interface VNotification {
  type: 'info' | 'warn' | 'error'
  message: string
  timeout?: number
  endtime?: Date
}
export const notis = reactive<Record<number, VNotification>>({})
let totalCount = -1

export function notify(type: 'info' | 'warn' | 'error', message: string, timeout = 15000): number {
  const id = totalCount++
  if (timeout <= 0) {
    notis[id] = {
      type,
      message,
    }
  }
  else {
    notis[id] = {
      type,
      message,
      timeout: window.setTimeout(() => {
        delete notis[id]
      }, timeout),
      endtime: new Date(Date.now() + timeout),
    }
  }
  return id
}

export function updateNotification(
  id: number,
  newInfo: {
    message?: string
    timeout?: number
  },
): void {
  if (notis[id]) {
    if (newInfo.message)
      notis[id].message = newInfo.message
    if (newInfo.timeout) {
      if (notis[id].timeout) {
        clearTimeout(notis[id].timeout)
        delete notis[id].timeout
        delete notis[id].endtime
      }
      if (newInfo.timeout > 0) {
        notis[id].timeout = window.setTimeout(() => {
          delete notis[id]
        }, newInfo.timeout)
        notis[id].endtime = new Date(Date.now() + newInfo.timeout)
      }
    }
  }
}

export function deleteNotification(id: number): void {
  if (notis[id]) {
    if (notis[id].timeout)
      clearTimeout(notis[id].timeout)
    delete notis[id]
  }
}
