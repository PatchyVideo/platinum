require('cross-fetch/polyfill')

const isbot = require('isbot')
const fs = require('fs')
const gql = require('fake-tag')
const { encode } = require('html-entities')

const html = fs.readFileSync('./index.html').toString()

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
module.exports = async (req, res) => {
  let body = html

  /* Open Graph */
  const ua = req.headers['user-agent']
  if (isbot(ua)) {
    // we only serve opengraph to bots
    if (/\/video\/\w+/.test(req.url)) {
      const vid = req.url.match(/\/video\/(\w+)/)[1]
      const data = (
        await queryGraphQL(
          gql`
            query($vid: String!) {
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
        `<meta itemprop="image" content="${data.item.coverImage}" />`,

        // opengraph data
        `<meta property="og:title" content="${encodeHTML(data.item.title)}" />`,
        `<meta property="og:type" content="video.other" />`,
        `<meta property="og:image" content="${encodeHTML(data.item.coverImage)}" />`,
        `<meta property="og:description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta property="og:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta property="og:site_name" content="PatchyVideo" />`,
        `<meta property="og:video:url" content="https://${req.headers.host}/embed/${vid}" />`,
        `<meta property="og:video:secure_url" content="https://${req.headers.host}/embed/${vid}" />`,
        `<meta property="og:video:type" content="text/html" />`,
        ...data.tags
          .reduce((pv, cv) => [...pv, ...cv.languages.map((v) => v.value)], [])
          .map((v) => `<meta property="og:video:tag" content="${encodeHTML(v)}" />`),

        // twitter data
        `<meta name="twitter:card" content="player" />`,
        `<meta name="twitter:url" content="https://${req.headers.host}${req.url}" />`,
        `<meta name="twitter:title" content="${encodeHTML(data.item.title)}" />`,
        `<meta name="twitter:description" content="${encodeHTML(data.item.desc)}" />`,
        `<meta name="twitter:image" content="${data.item.coverImage}" />`,
        `<meta name="twitter:player" content="https://${req.headers.host}/embed/${vid}" />`,
      ].join('\n')
      body = body.replace(/<!-- meta start -->[\S\s]*<!-- meta end -->/, og)
    }
  }

  body += '<!-- UA: ' + ua + ' -->'

  res
    .writeHead(200, {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'text/html',
    })
    .end(body)
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

function encodeHTML(string) {
  return encode(string.replace(/[\n\r]/g, ' '), { level: 'xml' })
}
