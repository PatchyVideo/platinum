declare global {
  interface Window {
    PatchyVideo: typeof PatchyVideo
  }
}

const PatchyVideo = {}

window.PatchyVideo = PatchyVideo

export default PatchyVideo
