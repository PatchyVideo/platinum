import yiyan from './yiyan'

function getByteLen(val: string): number {
  let len = 0
  for (let i = 0; i < val.length; i++) {
    const length = val.charCodeAt(i)
    if (length >= 0 && length <= 128) {
      len += 1
    } else {
      len += 2
    }
  }
  return len
}

export function getYiyan(short = false): string {
  let yy = [...yiyan]
  if (short) {
    yy = yy.filter((v) => getByteLen(v) <= 80)
  }
  const random = Math.floor(Math.random() * yy.length + 1)
  return yy[random]
}

export function getYiyanArray(short = false, rand = false): string[] {
  let yy = [...yiyan]
  if (short) {
    yy = yy.filter((v) => getByteLen(v) <= 80)
  }
  if (rand) {
    for (let i = 1; i < yy.length; i++) {
      const random = Math.floor(Math.random() * (i + 1))
      const tmp = yy[random]
      yy[random] = yy[i]
      yy[i] = tmp
    }
  }
  return yy
}
