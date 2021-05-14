/// <reference lib="webworker" />
import { render } from './parser'

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (e) => {
  ctx.postMessage({ id: e.data.id, raw: e.data.text, text: render(e.data.text) })
}
