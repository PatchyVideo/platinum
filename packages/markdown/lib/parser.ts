import MarkdownIt from 'markdown-it'
import { Parser as HTMLParser } from 'htmlparser2'
import { encode as encodeHTML } from 'html-entities'
import hljs from 'highlight.js/lib/common'
import tlds from 'tlds'

const markdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: function (str, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(str, { language }).value
      } catch (__) {
        // if error, just run as not renderd.
      }
    }
    return '' // use external default escaping
  },
})

function match(reg: RegExp, text: string): number {
  if (reg.test(text)) {
    const m = text.match(reg)
    return m ? m[0].length : 0
  }
  return 0
}

function val(reg: RegExp) {
  return (text: string, pos: number) => {
    const tail = text.slice(pos)
    return match(reg, tail)
  }
}

markdownIt.linkify
  .set({
    fuzzyLink: true,
    fuzzyEmail: false,
    fuzzyIP: false,
  })
  .tlds(tlds) // full tld list
  .tlds('onion', true)
  .add('ac', {
    validate: val(/\d+/),
    normalize(match) {
      match.url = 'https://www.acfun.cn/v/' + match.url
    },
  })
  .add('av', {
    validate: val(/\d+/),
    normalize(match) {
      match.url = 'https://www.bilibili.com/video/' + match.url
    },
  })
  .add('bv', {
    validate: val(/[a-zA-Z0-9]+/),
    normalize(match) {
      match.url = 'https://www.bilibili.com/video/' + match.url
    },
  })
  .add('sm', {
    validate: val(/\d+/),
    normalize(match) {
      match.url = 'https://www.nicovideo.jp/watch/' + match.url
    },
  })
  .add('youtube-', {
    validate: val(/[-\w]+/),
    normalize(match) {
      match.url = 'https://www.youtube.com/watch?v=' + match.url.replace(/^youtube-/, '')
    },
  })
  .add('mylist/', {
    validate: val(/\d+/),
    normalize(match) {
      match.url = 'https://www.nicovideo.jp/' + match.url
    },
  })

interface MarkdownItEnv {
  last: {
    level: number
    url: URL
  }[]
}

const DRlink_open =
  markdownIt.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

markdownIt.renderer.rules.link_open = function (tokens, idx, options, env: MarkdownItEnv, self) {
  const link = tokens[idx].attrGet('href')
  if (link && !(tokens[idx + 1].type === 'text' && tokens[idx + 1].content.trim() === link))
    env.last.push({
      level: tokens[idx].level,
      url: new URL(link),
    })
  return DRlink_open(tokens, idx, options, env, self)
}

const DRlink_close =
  markdownIt.renderer.rules.link_close ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

markdownIt.renderer.rules.link_close = function (tokens, idx, options, env: MarkdownItEnv, self) {
  return (
    env.last.reduce((pv: string | undefined, cv, index) => {
      if (tokens[idx].level === cv.level) {
        const str = `<span class="text-xs text-gray-600 dark:text-gray-300">[${cv.url.hostname.replace(
          /^www./,
          ''
        )}]</span>`
        env.last.splice(index, 1)
        return DRlink_close(tokens, idx, options, env, self) + str
      }
      return pv
    }, undefined) || DRlink_close(tokens, idx, options, env, self)
  )
}

/* face */
// { name: url }
const faces: Record<string, string> = {}
markdownIt.inline.ruler.before('link', 'face', (state, silent) => {
  if (silent) return false

  if (state.posMax - state.pos < 10) return false
  if (!state.src.slice(state.pos).startsWith('[[face:')) return false

  const start = state.pos
  const max = state.posMax
  state.pos++

  let found
  while (state.pos < state.posMax) {
    if (state.src.charCodeAt(state.pos) === 0x5d /* ] */) {
      found = true
      break
    }
    state.md.inline.skipToken(state)
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start
    return false
  }

  const face = markdownIt.utils.unescapeMd(state.src.slice(start + 7, state.pos))

  if (face.match(/\s/)) {
    state.pos = start
    return false
  }

  state.posMax = state.pos
  state.pos = start + 1

  if (face in faces) {
    const token = state.push('face', '', 0)
    token.attrSet('href', faces['face'])
    token.content = face
  } else {
    const token = state.push('text', '', 0)
    token.content = `[${face}]`
  }

  state.pos = state.posMax + 2
  state.posMax = max

  return true
})
markdownIt.renderer.rules.face = function (tokens, idx) {
  const token = tokens[idx]
  return `<img class="face inline-block w-4 h-4" src="${token.attrGet('src')}" alt="${token.content}" />`
}

const allowedTags = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'h7',
  'h8',
  'br',
  'b',
  'i',
  'strong',
  'em',
  'a',
  'pre',
  'code',
  'img',
  'tt',
  'div',
  'ins',
  'del',
  'sup',
  'sub',
  'p',
  'ol',
  'ul',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'blockquote',
  'dl',
  'dt',
  'dd',
  'kbd',
  'q',
  'samp',
  'var',
  'hr',
  'ruby',
  'rt',
  'rp',
  'li',
  'tr',
  'td',
  'th',
  's',
  'strike',
  'summary',
  'details',
  'caption',
  'figure',
  'figcaption',
  'abbr',
  'bdo',
  'cite',
  'dfn',
  'mark',
  'small',
  'span',
  'time',
  'wbr',
]
const allowedAttributes = [
  'abbr',
  'accept',
  'accept-charset',
  'accesskey',
  'action',
  'align',
  'alt',
  'aria-describedby',
  'aria-hidden',
  'aria-label',
  'aria-labelledby',
  'axis',
  'border',
  'cellpadding',
  'cellspacing',
  'char',
  'charoff',
  'charset',
  'checked',
  'clear',
  'cols',
  'colspan',
  'color',
  'compact',
  'coords',
  'datetime',
  'dir',
  'disabled',
  'enctype',
  'for',
  'frame',
  'headers',
  'height',
  'hreflang',
  'hspace',
  'ismap',
  'label',
  'lang',
  'maxlength',
  'media',
  'method',
  'multiple',
  'name',
  'nohref',
  'noshade',
  'nowrap',
  'open',
  'progress',
  'prompt',
  'readonly',
  'rel',
  'rev',
  'role',
  'rows',
  'rowspan',
  'rules',
  'scope',
  'selected',
  'shape',
  'size',
  'span',
  'start',
  'summary',
  'tabindex',
  'target',
  'title',
  'type',
  'usemap',
  'valign',
  'value',
  'vspace',
  'width',
  'itemprop',
]
const voidElements = [
  'area',
  'base',
  'basefont',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'isindex',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

function sanitizeHTML(src: string) {
  const stack: string[] = []
  let result = ''
  const htmlParser = new HTMLParser({
    onopentag(tagName, attribs) {
      if (/^(https?|ftps?|mailto|xmpp|ircs?):$/.test(tagName) && Object.keys(attribs).length === 1) {
        result += `<${tagName}//${Object.keys(attribs).join(' ')}>`
        return
      } else if (!allowedTags.includes(tagName)) {
        result += encodeHTML(
          '<' +
            tagName +
            Object.entries(attribs)
              .map(([k, v]) => ` ${k}="${v.replaceAll(/"/g, '&quot;')}"`)
              .join('') +
            '>'
        )
        return
      } else {
        result += '<' + tagName
        Object.entries(attribs).forEach(([attrName, attrValue]) => {
          const addAttr = (encode = false) => {
            const v = encode ? attrValue.replaceAll(/"/g, '&quot;') : attrValue
            result += attrValue ? ` ${attrName}="${v}"` : ` ${attrName}`
          }
          try {
            switch (tagName) {
              case 'a': {
                switch (attrName) {
                  case 'href':
                    if (new URL(attrValue).protocol.match(/^(https?|ftps?|mailto|xmpp|ircs?):$/)) addAttr(true)
                    break
                }
                break
              }
              case 'img': {
                switch (attrName) {
                  case 'src':
                  case 'longdesc':
                    if (new URL(attrValue).protocol.match(/^(https?):$/)) addAttr(true)
                    break
                }
                break
              }
              case 'div': {
                switch (attrName) {
                  case 'itemscope':
                  case 'itemtype':
                    addAttr()
                }
                break
              }
              case 'blockquote':
              case 'del':
              case 'ins':
              case 'q': {
                switch (attrName) {
                  case 'cite':
                    if (new URL(attrValue).protocol.match(/^(https?):$/)) addAttr(true)
                    break
                }
                break
              }
            }
            if (allowedAttributes.includes(attrName)) addAttr(true)
          } catch (e) {
            // do nothing
          }
        })
        if (voidElements.includes(tagName)) {
          result += ' />'
        } else {
          result += '>'
          stack.push(tagName)
        }
      }
    },
    ontext(data: string) {
      result += data
    },
    onclosetag(tagName) {
      const last = stack[stack.length - 1]
      if (tagName === last) {
        result += `</${tagName}>`
        stack.pop()
      } else if (!/^(https?|ftps?|mailto|xmpp|ircs?):$/.test(tagName) && !voidElements.includes(tagName)) {
        result += encodeHTML(`</${tagName}>`)
      }
    },
  })
  htmlParser.write(src)
  htmlParser.end()
  return result
}

export function render(src: string): string {
  let res
  try {
    res = markdownIt.render(sanitizeHTML(src).replace(/\[\[表情:(\p{L}+)\]\]/gu, '[[face:$1]]'), { last: [] })
  } catch (e) {
    res = `Error throwed from Markdown parser:\n${e.name}: ${e.message}`
  }
  return res
}
