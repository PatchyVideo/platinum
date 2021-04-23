import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import tlds from 'tlds'

const markdownIt = new MarkdownIt({
  breaks: true,
  linkify: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
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

const DRlink_open =
  markdownIt.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

let last: {
  level: number
  url: URL
}[] = []

markdownIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const link = tokens[idx].attrGet('href')
  if (link && !(tokens[idx + 1].type === 'text' && tokens[idx + 1].content.trim() === link))
    last.push({
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

markdownIt.renderer.rules.link_close = function (tokens, idx, options, env, self) {
  return (
    last.reduce((pv: string | undefined, cv, index) => {
      if (tokens[idx].level === cv.level) {
        const str = `<span class="text-xs text-gray-600 dark:text-gray-300">[${cv.url.hostname.replace(
          /^www./,
          ''
        )}]</span>`
        last.splice(index, 1)
        return DRlink_close(tokens, idx, options, env, self) + str
      }
      return pv
    }, undefined) || DRlink_close(tokens, idx, options, env, self)
  )
}

export function render(src: string): string {
  const l = last
  last = []
  let res
  try {
    res = markdownIt.render(src)
  } catch (e) {
    res = `Error throwed from Markdown parser:\n${e.name}: ${e.message}`
  }
  last = l
  return res
}
