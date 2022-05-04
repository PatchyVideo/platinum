import MarkdownIt from 'markdown-it'
import { Parser as HTMLParser } from 'htmlparser2'
import { encode as encodeHTML } from 'html-entities'
import hljs from 'highlight.js/lib/common'
import { facePlugin, linkifyAdditionPlugin } from './parserCommon'

const markdownIt = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight(str, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(str, { language }).value
      }
      catch (__) {
        // if error, just run as not renderd.
      }
    }
    return '' // use external default escaping
  },
})
  .use(linkifyAdditionPlugin)
  .use(facePlugin)

interface MarkdownItEnv {
  last: {
    level: number
    url: URL
  }[]
}

const DRlink_open
  = markdownIt.renderer.rules.link_open
  || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

markdownIt.renderer.rules.link_open = function (tokens, idx, options, env: MarkdownItEnv, self) {
  const link = tokens[idx].attrGet('href')
  if (link && !(tokens[idx + 1].type === 'text' && tokens[idx + 1].content.trim() === link)) {
    env.last.push({
      level: tokens[idx].level,
      url: new URL(link),
    })
  }
  return DRlink_open(tokens, idx, options, env, self)
}

const DRlink_close
  = markdownIt.renderer.rules.link_close
  || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

markdownIt.renderer.rules.link_close = function (tokens, idx, options, env: MarkdownItEnv, self) {
  return (
    env.last.reduce((pv: string | undefined, cv, index) => {
      if (tokens[idx].level === cv.level) {
        const str = `<span class="text-xs text-gray-600 dark:text-gray-300">[${cv.url.hostname.replace(
          /^www./,
          '',
        )}]</span>`
        env.last.splice(index, 1)
        return DRlink_close(tokens, idx, options, env, self) + str
      }
      return pv
    }, undefined) || DRlink_close(tokens, idx, options, env, self)
  )
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
      }
      else if (!allowedTags.includes(tagName.toLowerCase())) {
        result += encodeHTML(
          `<${
            tagName
            }${Object.entries(attribs)
              .map(([k, v]) => ` ${k}="${v.replaceAll(/"/g, '&quot;')}"`)
              .join('')
            }>`,
        )
      }
      else {
        result += `<${tagName}`
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
                    if (new URL(attrValue).protocol.match(/^(https?|ftps?|mailto|xmpp|ircs?):$/))
                      addAttr(true)
                    break
                }
                break
              }
              case 'img': {
                switch (attrName) {
                  case 'src':
                  case 'longdesc':
                    if (new URL(attrValue).protocol.match(/^(https?):$/))
                      addAttr(true)
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
                    if (new URL(attrValue).protocol.match(/^(https?):$/))
                      addAttr(true)
                    break
                }
                break
              }
            }
            if (allowedAttributes.includes(attrName.toLowerCase()))
              addAttr(true)
          }
          catch (e) {
            // do nothing
          }
        })
        if (voidElements.includes(tagName.toLowerCase())) {
          result += ' />'
        }
        else {
          result += '>'
          stack.push(tagName)
        }
      }
    },
    ontext(data: string) {
      result += data
      // console.log(data)
    },
    onclosetag(tagName) {
      const last = stack[stack.length - 1]
      if (tagName === last) {
        result += `</${tagName}>`
        stack.pop()
      }
      else if (
        !/^(https?|ftps?|mailto|xmpp|ircs?):$/.test(tagName)
        && !voidElements.includes(tagName.toLowerCase())
      ) {
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
    res = markdownIt.render(
      sanitizeHTML(src).replace(/\[\[表情:(\p{L}+)\]\]/gu, '[[face' /* escape unocss */ + ':$1]]'),
      { last: [] },
    )
  }
  catch (e) {
    console.error(e)
    res = `<div class="font-mono">Error throwed from Markdown parser: ${e}<br />${
      e instanceof Error && e.stack ? e.stack.replaceAll('\n', '<br />') : String(e)
    }</div>`
  }
  return res
}
