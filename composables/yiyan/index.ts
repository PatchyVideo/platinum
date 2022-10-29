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

export function useYiyan({ short }: { short: boolean }): string {
  const yy = [...(short ? getShortYiyan() : yiyan)]
  const random = Math.floor(Math.random() * yy.length + 1)
  return yy[random]
}

export function useYiyanArray({ short, random }: { short: boolean; random: boolean }): string[] {
  const yy = [...(short ? getShortYiyan() : yiyan)]
  if (random) {
    for (let i = 1; i < yy.length; i++) {
      const rnd = Math.floor(Math.random() * (i + 1))
      ;[yy[i], yy[rnd]] = [yy[rnd], yy[i]]
    }
  }
  return yy
}
