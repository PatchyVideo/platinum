require('cross-fetch/polyfill')

const path = require('path')
const fs = require('fs')
const gql = require('fake-tag')
const { encode } = require('html-entities')
const { Readable } = require('stream')
const { compressStream } = require('../libs/common')

const html = fs.readFileSync(path.join(__dirname, '../index.html')).toString()

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
module.exports = async (req, res) => {
  try {
    processRequest(req, res)
  } catch (e) {
    res.status(200)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  }
}

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
async function processRequest(req, res) {
  let body = html

  const timeStart = Date.now()

  /* Open Graph */
  try {
    if (/\/video\/\w+/.test(req.url)) {
      const vid = req.url.match(/\/video\/(\w+)/)[1]
      const data = (
        await queryGraphQL(
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
          }
        )
      ).data.getVideo
      const og = [
        // common data
        `<title>${encode(data.item.title)} - PatchyVideo</title>`,
        `<meta property="description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta name="keywords" content="${encodeHTML(
          data.tags.map((tag) => tag.languages.map((v) => v.value).join(' ')).join(' ')
        )}" />`,
        `<meta itemprop="name" content="${encode(data.item.title)}" />`,
        `<meta itemprop="description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta itemprop="image" content="https://patchyvideo.com/images/covers/${data.item.coverImage}" />`,

        // opengraph data
        `<meta property="og:type" content="video.other" />`,
        `<meta property="og:title" content="${encodeHTML(data.item.title)}" />`,
        `<meta property="og:image" content="https://patchyvideo.com/images/covers/${data.item.coverImage}" />`,
        `<meta property="og:description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta property="og:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta property="og:site_name" content="PatchyVideo" />`,
        `<meta property="og:video:url" content="https://${req.headers.host}/embed/${vid}" />`,
        `<meta property="og:video:secure_url" content="https://${req.headers.host}/embed/${vid}" />`,
        `<meta property="og:video:type" content="text/html" />`,
        ...[...new Set(data.tags.reduce((pv, cv) => [...pv, ...cv.languages.map((v) => v.value)], []))].map(
          (v) => `<meta property="og:video:tag" content="${encodeHTML(v)}" />`
        ),

        // twitter data
        `<meta name="twitter:card" content="player" />`,
        `<meta name="twitter:site" content="@PatchyVideo" />`,
        `<meta name="twitter:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta name="twitter:title" content="${encodeHTML(data.item.title)}" />`,
        `<meta name="twitter:description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta name="twitter:image" content="https://patchyvideo.com/images/covers/${data.item.coverImage}" />`,
        `<meta name="twitter:player" content="https://${req.headers.host}/embed/${vid}" />`,
      ].join('\n')
      body = body.replace(/<!-- META-START -->[\S\s]*<!-- META-END -->/, og)
    } else if (/\/playlist\/\w+/.test(req.url)) {
      const pid = req.url.match(/\/playlist\/(\w+)/)[1]
      const data = (
        await queryGraphQL(
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
          }
        )
      ).data.getPlaylist
      const og = [
        // common data
        `<title>${encode(data.item.title)} - PatchyVideo</title>`,
        `<meta property="description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta itemprop="name" content="${encode(data.item.title)}" />`,
        `<meta itemprop="description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta itemprop="image" content="https://patchyvideo.com/images/covers/${data.item.cover}" />`,

        // opengraph data
        `<meta property="og:title" content="${encodeHTML(data.item.title)}" />`,
        `<meta property="og:image" content="https://patchyvideo.com/images/covers/${data.item.cover}" />`,
        `<meta property="og:description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta property="og:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta property="og:site_name" content="PatchyVideo" />`,

        // twitter data
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:site" content="@PatchyVideo" />`,
        `<meta name="twitter:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta name="twitter:title" content="${encodeHTML(data.item.title)}" />`,
        `<meta name="twitter:description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta name="twitter:image" content="https://patchyvideo.com/images/covers/${data.item.cover}" />`,
      ].join('\n')
      body = body.replace(/<!-- META-START -->[\S\s]*<!-- META-END -->/, og)
    } else if (/\/user\/\w+/.test(req.url)) {
      const uid = req.url.match(/\/user\/(\w+)/)[1]
      const data = (
        await queryGraphQL(
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
          }
        )
      ).data.getUser
      const og = [
        // common data
        `<title>${encode(data.username)} - PatchyVideo</title>`,
        `<meta property="description" content="${encodeHTML(data.desc)}" />`,
        `<meta itemprop="name" content="${encode(data.username)}" />`,
        `<meta itemprop="description" content="${encodeHTML(data.desc)}" />`,
        `<meta itemprop="image" content="https://patchyvideo.com/images/userphotos/${data.image}" />`,

        // opengraph data
        `<meta property="og:type" content="profile" />`,
        `<meta property="og:profile:username" content="${encodeHTML(data.username)}" />`,
        `<meta property="og:image" content="https://patchyvideo.com/images/userphotos/${data.image}" />`,
        `<meta property="og:description" content="${encodeHTML(data.desc)}" />`,
        `<meta property="og:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta property="og:site_name" content="PatchyVideo" />`,

        // twitter data
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:site" content="@PatchyVideo" />`,
        `<meta name="twitter:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta name="twitter:title" content="${encodeHTML(data.username)}" />`,
        `<meta name="twitter:description" content="${encodeHTML(data.desc)}" />`,
        `<meta name="twitter:image" content="https://patchyvideo.com/images/userphotos/${data.image}" />`,
      ].join('\n')
      body = body.replace(/<!-- META-START -->[\S\s]*<!-- META-END -->/, og)
    }
  } catch (e) {
    body += '\n<!--\nServer responsed with error:\n' + encodeHTML(String(e), false) + '\n-->'
  }

  body = body.replace('<!-- TIMING -->', `<!-- RENDER: ${Date.now() - timeStart}ms -->`)

  res.status(200)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  await compressStream(req, Readable.from(body), res)
}

/**
 * @param {string} gql
 * @returns {Promise<import('graphql').ExecutionResult<import('../../packages/graphql/__generated__/graphql').Query>>}
 */
function queryGraphQL(gql, vari) {
  return fetch('https://patchyvideo.com/be/gql/graphql', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      query: gql,
      variables: vari,
    }),
  }).then((res) => res.json())
}

function encodeHTML(string, replaceBr = true) {
  return encode(replaceBr ? string.replace(/[\n\r]/g, ' ') : string, { level: 'xml' })
}
