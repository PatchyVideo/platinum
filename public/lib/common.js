const zlib = require('zlib')
const pipeline = require('util').promisify(require('stream').pipeline)

module.exports = {
  /**
   *
   * @param {import('@vercel/node').VercelRequest} req
   * @param {import('stream').Stream} stream
   * @param {import('@vercel/node').VercelResponse} res
   */
  compressStream: async function (req, stream, res) {
    /**
     * @type {import('stream').Stream[]}
     */
    const transforms = []

    const acceptEncoding = req.headers['accept-encoding'] || ''
    if (/\bbr\b/.test(acceptEncoding)) {
      res.setHeader('Content-Encoding', 'br')
      transforms.push(
        zlib.createBrotliCompress({
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
          },
        })
      )
    } else if (/\bgzip\b/.test(acceptEncoding)) {
      res.setHeader('Content-Encoding', 'gzip')
      transforms.push(
        zlib.createGzip({
          level: zlib.constants.Z_BEST_COMPRESSION,
        })
      )
    }

    await pipeline(stream, ...transforms, res).catch(() => {
      res.status(502).end()
    })
  },
}
