export interface CoverImageMeta {
  image?: string | null
}

export function getCoverImage(meta: CoverImageMeta): string {
  if (meta.image && meta.image !== 'default') return 'https://patchyvideo.com/be/images/covers/' + meta.image
  return 'https://patchyvideo.com/be/images/covers/default'
}
export function getSiteImage(name: string): string {
  return new URL(`../assets/WebIcons/${name}.png`, import.meta.url).toString()
}
