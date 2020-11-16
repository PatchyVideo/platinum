const htmlRoot = document.querySelector('html')

export function dark(): void {
  if (!htmlRoot) return
  htmlRoot.classList.contains('dark') || htmlRoot.classList.add('dark')
}

export function light(): void {
  if (!htmlRoot) return
  htmlRoot.classList.contains('dark') && htmlRoot.classList.remove('dark')
}
