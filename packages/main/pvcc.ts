import { extensions, extensionTweaks } from './extension'

declare global {
  interface Window {
    PatchyVideo: typeof PatchyVideo
  }
}

const PatchyVideo = {
  extension: {
    /**
     * list of registered extension data
     */
    extensions: extensions,
    /**
     * list of tweaks that extensions applied
     */
    extensionTweaks: extensionTweaks,
    /**
     * clear cached extension data
     * can also be done by clear SesstionStorage and a reload
     */
    clear(): void {
      extensions.value = {}
      extensionTweaks.value = []
    },
  },
  settings: {
    /**
     * list of all settings in LocalStorage
     *
     * // category: description
     * key: [type, defaultValue]
     */
    list: {
      // global: user preferred language
      lang: [String, undefined],
      // video: player: player volume
      player_settings_volume: [Number, 0.5],
      // video: player: sync video & audio stream
      player_settings_sync_audio: [Boolean, false],
      // video: render tags as plain text, rather than render with a tag-like border
      video_tag_render_as_plain_text: [Boolean, false],
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
