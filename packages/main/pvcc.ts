import { extensions, extensionTweaks } from './extension'

declare global {
  interface Window {
    PatchyVideo: typeof PatchyVideo
  }
}

const PatchyVideo = {
  extension: {
    extensions: extensions,
    extensionTweaks: extensionTweaks,
    clear(): void {
      extensions.value = {}
      extensionTweaks.value = []
    },
  },
}

window.PatchyVideo = PatchyVideo

export default PatchyVideo

console.log(
  `%cPatchy%cVideo%cVer${import.meta.env.VITE_APP_VERSION}%c\nBuilt@${import.meta.env.VITE_APP_BUILDTIME}`,
  'color:#9c71b2;font-size:2rem;font-family: Arial,Helvetica,sans-serif;font-weight: 700;',
  'color:#ffb458;font-size:2rem;font-family: Arial,Helvetica,sans-serif;font-weight: 700;',
  'color:#6a8935;font-size:0.9rem;font-family: Arial,Helvetica,sans-serif;padding: 0px 5px;',
  'color:#c586c0;font-size:1rem;font-family: Arial,Helvetica,sans-serif;'
)
