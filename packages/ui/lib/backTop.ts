export function backTop(): void {
  const top: number = document.body.scrollTop || document.documentElement.scrollTop
  if (top > 0) {
    window.requestAnimationFrame(backTop)
    window.scrollTo(0, top - top / 5)
  }
  //   if ($("html").scrollTop()) {
  //     //动画效果
  //     $("html").animate({ scrollTop: 0 }, 100);
  //   }
}
