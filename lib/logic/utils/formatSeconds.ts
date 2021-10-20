export default function formatSeconds(time: number) {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor(time / 60) % 60
  const seconds = time % 60

  const segments = [minutes, seconds]
    .map((value) => value < 10 ? '0' + value : value)
  if (hours) segments.unshift(hours)

  return segments.join(':')
}