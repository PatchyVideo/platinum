export interface UserAvatarMeta {
  image?: string | null
  gravatar?: string | null
}

export function getUserAvatar(meta: UserAvatarMeta): string {
  if (meta.image && meta.image !== 'default') return 'https://patchyvideo.com/be/images/userphotos/' + meta.image
  if (meta.gravatar && meta.gravatar.length === 32)
    return (
      'https://www.gravatar.com/avatar/' +
      meta.gravatar +
      '?d=https%3A%2F%2Fpatchyvideo.com%2Fbe%2Fimages%2Fuserphotos%2Fdefault'
    )
  return 'https://patchyvideo.com/be/images/userphotos/default'
}

export interface CoverImageMeta {
  image?: string | null
}

export function getCoverImage(meta: CoverImageMeta): string {
  if (meta.image && meta.image !== 'default') return 'https://patchyvideo.com/be/images/covers/' + meta.image
  return 'https://patchyvideo.com/be/images/covers/default'
}
