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
    res = markdownIt.render(src.replace(/\[\[表情:(\p{L}+)\]\]/gu, '[[face:$1]]'), { last: [] })
  } catch (e) {
    console.error(e)
    res = `<div class="font-mono">Error throwed from Markdown parser: ${e}<br />${
      // @ts-expect-error e might be a Error
      'stack' in e ? e.stack.replaceAll('\n', '<br />') : ''
    }</div>`
  }
  return res
}
