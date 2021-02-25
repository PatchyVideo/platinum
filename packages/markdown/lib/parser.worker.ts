/// <reference lib="webworker" />
import markdownIt from './parser'

const ctx: DedicatedWorkerGlobalScope = (self as unknown) as DedicatedWorkerGlobalScope

ctx.onmessage = (e) => {
  ctx.postMessage({ id: e.data.id, raw: e.data.text, text: markdownIt.render(e.data.text) })
}
