export interface CoverImageMeta {
  image?: string | null
}

export function getCoverImage(meta: CoverImageMeta): string {
  if (meta.image && meta.image !== 'default') return 'https://patchyvideo.com/be/images/covers/' + meta.image
  return 'https://patchyvideo.com/be/images/covers/default'
}
