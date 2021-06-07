export interface CoverImageMeta {
  image?: string | null
}

export function getCoverImage(meta: CoverImageMeta): string {
  if (meta.image && meta.image !== 'default') return 'https://patchyvideo.com/be/images/covers/' + meta.image
  return 'https://patchyvideo.com/be/images/covers/default'
}
export const imageMod = Object.fromEntries(
  Object.entries(import.meta.globEager('/packages/common/assets/WebIcons/*.png')).map(([key, value]) => [
    key.replace(/\/packages\/common\/assets\/WebIcons\/(.+)\.png/, '$1'),
    value.default,
  ])
)
