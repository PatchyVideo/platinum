const polyfillLibrary = require('polyfill-library')
const mergeStream = require('merge2')
const { compressStream } = require('../lib/common')

const lastModified = new Date().toUTCString()

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
module.exports = async (req, res) => {
  const stream = mergeStream(
    await polyfillLibrary.getPolyfillString({
      uaString: req.headers['user-agent'] || '',
      minify: true,
      rum: false,
      stream: true,
      features: Object.fromEntries(
        [
          'default',
          'es2018',
          'es2019',
          'es2020',
          'es2021',
          'Intl.Locale',
          'Intl.getCanonicalLocales',
          'Intl.DateTimeFormat',
          'Intl.NumberFormat',
        ].map((v) => [v, { flags: new Set() }])
      ),
    })
  )
  await compressStream(
    req,
    stream,
    res
      .status(200)
      .setHeader(
        'Cache-Control',
        'public, s-maxage=31536000, max-age=604800, stale-while-revalidate=604800, stale-if-error=604800'
      )
      .setHeader('Content-Type', 'text/javascript; charset=utf-8')
      .setHeader('Last-Modified', lastModified)
  )
}
