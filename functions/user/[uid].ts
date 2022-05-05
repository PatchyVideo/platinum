// @ts-expect-error no types
import gql from 'fake-tag'
import { encode } from 'html-entities'
import { encodeHTML, indexHtml, queryGraphQL, returnDefault, returnHTML } from '../libs'

export const onRequestGet: PagesFunction = async ({ request, params }) => {
  const startTime = Date.now()

  const uid = params.uid
  if (!uid)
    return returnDefault()

  const res = await queryGraphQL(
    gql`
      query ($uid: String!) {
        getUser(para: { uid: $uid }) {
          username
          desc
          image
          gravatar
        }
      }
    `,
    {
      uid,
    },
  ).catch(() => null)
  const user = res?.data?.getUser
  if (!user)
    return returnDefault()

  const og = [
    // common data
    `<title>${encode(user.username)} - PatchyVideo</title>`,
    `<meta property="description" content="${encodeHTML(user.desc)}" />`,
    `<meta itemprop="name" content="${encode(user.username)}" />`,
    `<meta itemprop="description" content="${encodeHTML(user.desc)}" />`,
    `<meta itemprop="image" content="https://patchyvideo.com/images/userphotos/${user.image}" />`,

    // opengraph data
    '<meta property="og:type" content="profile" />',
    `<meta property="og:profile:username" content="${encodeHTML(user.username)}" />`,
    `<meta property="og:image" content="https://patchyvideo.com/images/userphotos/${user.image}" />`,
    `<meta property="og:description" content="${encodeHTML(user.desc)}" />`,
    `<meta property="og:url" content="https://${request.headers.get('host')}${request.url}" />`,
    '<meta property="og:site_name" content="PatchyVideo" />',

    // twitter data
    '<meta name="twitter:card" content="summary" />',
    '<meta name="twitter:site" content="@PatchyVideo" />',
    `<meta name="twitter:url" content="https://${request.headers.get('host')}${request.url}" />`,
    `<meta name="twitter:title" content="${encodeHTML(user.username)}" />`,
    `<meta name="twitter:description" content="${encodeHTML(user.desc)}" />`,
    `<meta name="twitter:image" content="https://patchyvideo.com/images/userphotos/${user.image}" />`,
  ].join('\n')

  return returnHTML(indexHtml
    .replace(/<!-- META-START -->[\S\s]*<!-- META-END -->/, og)
    .replace('<!-- TIMING -->', `<!-- RENDER: ${Date.now() - startTime}ms -->`))
}
