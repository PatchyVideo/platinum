import yiyan from './yiyan'

function getByteLen(val: string): number {
  let len = 0
  for (let i = 0; i < val.length; i++) {
    const length = val.charCodeAt(i)
    if (length >= 0 && length <= 128)
      len += 1
    else
      len += 2
  }
  return len
}

let shortYiyan: string[] = []
function getShortYiyan(): string[] {
  if (shortYiyan.length > 0)
    return shortYiyan
  const yy = [...yiyan]
  shortYiyan = yy.filter(v => getByteLen(v) <= 120)
  return shortYiyan
}

export function getYiyan(short = false): string {
  const yy = [...(short ? getShortYiyan() : yiyan)]
  const random = Math.floor(Math.random() * yy.length + 1)
  return yy[random]
}

export function getYiyanArray(short = false, rand = false): string[] {
  const yy = [...(short ? getShortYiyan() : yiyan)]
  if (rand) {
    for (let i = 1; i < yy.length; i++) {
      const random = Math.floor(Math.random() * (i + 1))
      ;[yy[i], yy[random]] = [yy[random], yy[i]]
    }
  }
  return yy
}
