export function pageOfVideo(url: string): number {
  return Number(new URL(url).searchParams.get('p') || '0')
}
