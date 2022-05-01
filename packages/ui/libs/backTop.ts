export function backTop(): void {
  const top: number = document.body.scrollTop || document.documentElement.scrollTop
  if (top > 0) {
    window.requestAnimationFrame(backTop)
    window.scrollTo(0, top - top / 5)
  }
}
