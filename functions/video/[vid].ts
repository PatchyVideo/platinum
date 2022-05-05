// @ts-expect-error no types
import gql from 'fake-tag'
import { encode } from 'html-entities'
import { encodeHTML, indexHtml, queryGraphQL, returnDefault, returnHTML } from '../libs'

export const onRequestGet: PagesFunction = async ({ request, params }) => {
  const startTime = Date.now()

  const vid = params.vid
  if (!vid)
    return returnDefault()

  const res = await queryGraphQL(
    gql`
      query ($vid: String!) {
        getVideo(para: { vid: $vid, lang: "CHS" }) {
          item {
            coverImage
            title
            desc
          }
          tags {
            languages {
              value
            }
          }
        }
      }
    `,
    {
      vid,
    },
  ).catch(() => null)
  const video = res?.data?.getVideo
  if (!video)
    return returnDefault()

  const og = [
    // common data
    `<title>${encode(video.item.title)} - PatchyVideo</title>`,
    `<meta property="description" content="${encodeHTML(video.item.desc)}" />`,
    `<meta name="keywords" content="${encodeHTML(
      video.tags.map(tag => tag.languages.map(v => v.value).join(' ')).join(' '),
    )}" />`,
    `<meta itemprop="name" content="${encode(video.item.title)}" />`,
    `<meta itemprop="description" content="${encodeHTML(video.item.desc)}" />`,
    `<meta itemprop="image" content="https://patchyvideo.com/images/covers/${video.item.coverImage}" />`,

    // opengraph data
    '<meta property="og:type" content="video.other" />',
    `<meta property="og:title" content="${encodeHTML(video.item.title)}" />`,
    `<meta property="og:image" content="https://patchyvideo.com/images/covers/${video.item.coverImage}" />`,
    `<meta property="og:description" content="${encodeHTML(video.item.desc)}" />`,
    `<meta property="og:url" content="https://${request.headers.get('host')}${request.url}" />`,
    '<meta property="og:site_name" content="PatchyVideo" />',
    `<meta property="og:video:url" content="https://${request.headers.get('host')}/embed/${vid}" />`,
    `<meta property="og:video:secure_url" content="https://${request.headers.get('host')}/embed/${vid}" />`,
    '<meta property="og:video:type" content="text/html" />',
    ...[...new Set(video.tags.reduce<string[]>((pv, cv) => [...pv, ...cv.languages.map(v => v.value)], []))]
      .map(v => `<meta property="og:video:tag" content="${encodeHTML(v)}" />`),

    // twitter data
    '<meta name="twitter:card" content="player" />',
    '<meta name="twitter:site" content="@PatchyVideo" />',
    `<meta name="twitter:url" content="https://${request.headers.get('host')}${request.url}" />`,
    `<meta name="twitter:title" content="${encodeHTML(video.item.title)}" />`,
    `<meta name="twitter:description" content="${encodeHTML(video.item.desc)}" />`,
    `<meta name="twitter:image" content="https://patchyvideo.com/images/covers/${video.item.coverImage}" />`,
    `<meta name="twitter:player" content="https://${request.headers.get('host')}/embed/${vid}" />`,
  ].join('\n')

  return returnHTML(indexHtml
    .replace(/<!-- META-START -->[\S\s]*<!-- META-END -->/, og)
    .replace('<!-- TIMING -->', `<!-- RENDER: ${Date.now() - startTime}ms -->`))
}
