import type MarkdownIt from 'markdown-it'
import tlds from 'tlds'

export function linkifyAdditionPlugin(markdownIt: MarkdownIt) {
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
        match.url = `https://www.acfun.cn/v/${match.url}`
      },
    })
    .add('av', {
      validate: val(/\d+/),
      normalize(match) {
        match.url = `https://www.bilibili.com/video/${match.url}`
      },
    })
    .add('bv', {
      validate: val(/[a-zA-Z0-9]+/),
      normalize(match) {
        match.url = `https://www.bilibili.com/video/${match.url}`
      },
    })
    .add('sm', {
      validate: val(/\d+/),
      normalize(match) {
        match.url = `https://www.nicovideo.jp/watch/${match.url}`
      },
    })
    .add('youtube-', {
      validate: val(/[-\w]+/),
      normalize(match) {
        match.url = `https://www.youtube.com/watch?v=${match.url.replace(/^youtube-/, '')}`
      },
    })
    .add('mylist/', {
      validate: val(/\d+/),
      normalize(match) {
        match.url = `https://www.nicovideo.jp/${match.url}`
      },
    })
}

// { name: url }
const faces: Record<string, string> = {}
export function facePlugin(markdownIt: MarkdownIt) {
  markdownIt.inline.ruler.before('link', 'face', (state, silent) => {
    if (silent)
      return false

    if (state.posMax - state.pos < 10)
      return false
    if (!state.src.slice(state.pos).startsWith('[[face:'))
      return false

    const start = state.pos
    const max = state.posMax
    state.pos++

    let found
    while (state.pos < state.posMax) {
      if (state.src.charCodeAt(state.pos) === 0x5D /* ] */) {
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
      token.attrSet('src', faces[face])
      token.content = face
    }
    else {
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
}
