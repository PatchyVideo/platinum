import markdownIt from './parser'

const ctx: Worker = (self as unknown) as Worker

ctx.onmessage = (e) => {
  ctx.postMessage({ id: e.data.id, raw: e.data.text, text: markdownIt.render(e.data.text) })
}
