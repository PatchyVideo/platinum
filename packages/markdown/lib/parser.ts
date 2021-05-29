import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
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
  .tlds(tlds) // full tld list
  .tlds('onion', true)
  .add('git:', 'http:')
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

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  Array.prototype.forEach.call(node.attributes, (v: Attr) => {
    try {
      switch (node.tagName) {
        case 'a': {
          switch (v.name) {
            case 'href':
              if (new URL(v.value).protocol.match(/^(https?|mailto|xmpp|ircs?):$/)) return
              break
          }
          break
        }
        case 'img': {
          switch (v.name) {
            case 'src':
            case 'longdesc':
              if (new URL(v.value).protocol.match(/^(https?):$/)) return
              break
          }
          break
        }
        case 'div': {
          switch (v.name) {
            case 'itemscope':
            case 'itemtype':
              return
          }
          break
        }
        case 'blockquote':
        case 'del':
        case 'ins':
        case 'q': {
          switch (v.name) {
            case 'cite':
              if (new URL(v.value).protocol.match(/^(https?):$/)) return
              break
          }
          break
        }
      }
      if (
        [
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
        ].includes(v.name)
      )
        return
      node.removeAttribute(v.name)
    } catch (_) {
      node.removeAttribute(v.name)
    }
  })
})

DOMPurify.setConfig({
  ALLOWED_TAGS: [
    '#text',
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
  ],
})

export function render(src: string): string {
  let res
  try {
    res = markdownIt.render(DOMPurify.sanitize(src), { last: [] })
  } catch (e) {
    res = `Error throwed from Markdown parser:\n${e.name}: ${e.message}`
  }
  return res
}
