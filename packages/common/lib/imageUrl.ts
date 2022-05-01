export interface CoverImageMeta {
  image?: string | null
}

export function getCoverImage(meta: CoverImageMeta): string {
  if (meta.image && meta.image !== 'default')
    return `https://patchyvideo.com/be/images/covers/${meta.image}`
  return 'https://patchyvideo.com/be/images/covers/default'
}

const siteImages = import.meta.globEager('../assets/WebIcons/*.png')
export function getSiteImage(name: string): string {
  return siteImages[`../assets/WebIcons/${name}.png`].default
}
