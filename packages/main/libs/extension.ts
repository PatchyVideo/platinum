import { useSessionStorage } from '@vueuse/core'

export interface extData {
  type: '__PATCHYVIDEO_PLATINUM_extension_installed'
  version: 1
  name: string
  extVersion: string
  tweaks?: string[]
}

export const extensions = useSessionStorage<Record<string, extData>>('extensions', {})
export const extensionTweaks = useSessionStorage<string[]>('extension_tweaks', [])
extensionTweaks.value = []

const installed: string[] = []
function loadExtension(ext: extData) {
  try {
    if (installed.includes(ext.name))
      return

    if (ext.tweaks)
      extensionTweaks.value.push(...ext.tweaks.filter(v => !extensionTweaks.value.includes(v)))

    // console.log(`Extension installed: ${ext.name} (${ext.extVersion})`, ext)
    installed.push(ext.name)
  }
  catch (e) {
    // do nothing
  }
}

for (const ext of Object.values(extensions.value))
  loadExtension(ext)

const ticked: string[] = []
addEventListener('message', (event) => {
  try {
    if (
      typeof event.data === 'object'
      && 'type' in event.data
      && event.data.type === '__PATCHYVIDEO_PLATINUM_extension_installed'
    ) {
      const extInfo = event.data as extData

      loadExtension(extInfo)

      extensions.value[extInfo.name] = extInfo
      ticked.push(extInfo.name)
    }
  }
  catch (e) {
    // do nothing
  }
})
postMessage('__PATCHYVIDEO_PLATINUM_pull_extension_info', '*')
setTimeout(() => {
  for (const extName in extensions.value) {
    if (!ticked.includes(extName))
      delete extensions.value[extName]
  }
}, 5000)
