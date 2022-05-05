// @ts-expect-error no types
import gql from 'fake-tag'
import { encode } from 'html-entities'
import { encodeHTML, indexHtml, queryGraphQL, returnDefault, returnHTML } from '../libs'

export const onRequestGet: PagesFunction = async ({ request, params }) => {
  const startTime = Date.now()

  const pid = params.pid
  if (!pid)
    return returnDefault()

  const res = await queryGraphQL(
    gql`
      query ($pid: String!) {
        getPlaylist(para: { pid: $pid }) {
          item {
            title
            cover
            desc
          }
        }
      }
    `,
    {
      pid,
    },
  ).catch(() => null)
  const playlist = res?.data?.getPlaylist
  if (!playlist)
    return returnDefault()

  const og = [
    // common data
    `<title>${encode(playlist.item.title)} - PatchyVideo</title>`,
    `<meta property="description" content="${encodeHTML(playlist.item.desc)}" />`,
    `<meta itemprop="name" content="${encode(playlist.item.title)}" />`,
    `<meta itemprop="description" content="${encodeHTML(playlist.item.desc)}" />`,
    `<meta itemprop="image" content="https://patchyvideo.com/images/covers/${playlist.item.cover}" />`,

    // opengraph data
    `<meta property="og:title" content="${encodeHTML(playlist.item.title)}" />`,
    `<meta property="og:image" content="https://patchyvideo.com/images/covers/${playlist.item.cover}" />`,
    `<meta property="og:description" content="${encodeHTML(playlist.item.desc)}" />`,
    `<meta property="og:url" content="https://${request.headers.get('host')}${request.url}" />`,
    '<meta property="og:site_name" content="PatchyVideo" />',

    // twitter data
    '<meta name="twitter:card" content="summary" />',
    '<meta name="twitter:site" content="@PatchyVideo" />',
    `<meta name="twitter:url" content="https://${request.headers.get('host')}${request.url}" />`,
    `<meta name="twitter:title" content="${encodeHTML(playlist.item.title)}" />`,
    `<meta name="twitter:description" content="${encodeHTML(playlist.item.desc)}" />`,
    `<meta name="twitter:image" content="https://patchyvideo.com/images/covers/${playlist.item.cover}" />`,
  ].join('\n')

  return returnHTML(indexHtml
    .replace(/<!-- META-START -->[\S\s]*<!-- META-END -->/, og)
    .replace('<!-- TIMING -->', `<!-- RENDER: ${Date.now() - startTime}ms -->`))
}
