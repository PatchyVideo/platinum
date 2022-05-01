import MarkdownIt from 'markdown-it'

import { facePlugin } from './parserCommon'

const markdownIt = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
}).use(facePlugin)

markdownIt.block.ruler.enableOnly(['paragraph'])

export function render(src: string): string {
  let res
  try {
    res = markdownIt.render(src.replace(/\[\[表情:(\p{L}+)\]\]/gu, '[[face' /* escape unocss */ + ':$1]]'), {
      last: [],
    })
  }
  catch (e) {
    console.error(e)
    res = `<div class="font-mono">Error throwed from Markdown parser: ${e}<br />${
      e instanceof Error && e.stack ? e.stack.replaceAll('\n', '<br />') : String(e)
    }</div>`
  }
  return res
}
