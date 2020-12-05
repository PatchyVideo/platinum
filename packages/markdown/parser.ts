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
    validate: val(/[-\\w]+/),
    normalize(match) {
      match.url = 'https://www.youtube.com/watch?v=' + match.url.replace(/^youtube-/, '')
    },
  })
  .add('mylist', {
    validate: val(/[-\\w]+/),
    normalize(match) {
      match.url = 'https://www.nicovideo.jp/' + match.url
    },
  })

export default markdownIt
