export function timeFormatter(timeString: string): string {
  const timeDate = new Date(timeString)
  return `${timeDate.getFullYear()}-${timeDate.getMonth()}-${timeDate.getDay()}`
}
