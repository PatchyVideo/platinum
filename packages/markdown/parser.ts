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

markdownIt.linkify
  .tlds(tlds) // full tld list
  .tlds('onion', true)
  .add('git:', 'http:')
  .add('ac', {
    validate(text, pos, self) {
      const tail = text.slice(pos)
      if (!self.re.aclink) self.re.aclink = /\d+/
      return match(self.re.aclink, tail)
    },
    normalize(match) {
      match.url = 'https://www.acfun.cn/v/' + match.url
    },
  })
  .add('av', {
    validate(text, pos, self) {
      const tail = text.slice(pos)
      if (!self.re.avlink) self.re.avlink = /\d+/
      return match(self.re.avlink, tail)
    },
    normalize(match) {
      match.url = 'https://www.bilibili.com/video/' + match.url
    },
  })
  .add('bv', {
    validate(text, pos, self) {
      const tail = text.slice(pos)
      if (!self.re.bvlink) self.re.bvlink = /[a-zA-Z0-9]+/
      return match(self.re.bvlink, tail)
    },
    normalize(match) {
      match.url = 'https://www.bilibili.com/video/' + match.url
    },
  })
  .add('sm', {
    validate(text, pos, self) {
      const tail = text.slice(pos)
      if (!self.re.smlink) self.re.smlink = /\d+/
      return match(self.re.smlink, tail)
    },
    normalize(match) {
      match.url = 'https://www.nicovideo.jp/watch/' + match.url
    },
  })
  .add('youtube-', {
    validate(text, pos, self) {
      const tail = text.slice(pos)
      if (!self.re.u2blink) self.re.u2blink = /[-\\w]+/
      return match(self.re.u2blink, tail)
    },
    normalize(match) {
      match.url = 'https://www.youtube.com/watch?v=' + match.url.replace(/^youtube-/, '')
    },
  })
  .add('mylist', {
    validate(text, pos, self) {
      const tail = text.slice(pos)
      if (!self.re.ncllink) self.re.ncllink = /[-\\w]+/
      return match(self.re.ncllink, tail)
    },
    normalize(match) {
      match.url = 'https://www.nicovideo.jp/' + match.url
    },
  })

export default markdownIt
