const htmlRoot = document.querySelector('html')

export function dark(): void {
  if (!htmlRoot) return
  htmlRoot.classList.contains('dark') || htmlRoot.classList.add('dark')
}

export function light(): void {
  if (!htmlRoot) return
  htmlRoot.classList.contains('dark') && htmlRoot.classList.remove('dark')
}

export function currentColorMode(): string {
  return htmlRoot?.classList.contains('dark') ? 'dark' : 'light'
}

if ('themePreference' in localStorage && localStorage.themePreference === 'dark') {
  dark()
} else if (!('themePreference' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  dark()
}
document.querySelector('body')?.classList.add('dark:bg-gray-700')
