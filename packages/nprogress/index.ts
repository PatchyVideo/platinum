import NProgress from 'nprogress'

let pendingNProgress: number | undefined
export function startProgress() {
  if (pendingNProgress === undefined) {
    // @ts-expect-error node
    pendingNProgress = setTimeout(() => {
      if (!NProgress.isStarted())
        NProgress.start()
      pendingNProgress = undefined
    }, 150)
  }
}

export function stopProgress() {
  if (pendingNProgress !== undefined) {
    clearTimeout(pendingNProgress)
    pendingNProgress = undefined
  }
  if (NProgress.isStarted())
    NProgress.done()
}

export function incProcess() {
  if (NProgress.isStarted())
    NProgress.inc()
}
