export default function formatSeconds(time: number, style: 'digital' | 'letters') {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor(time / 60) % 60
  const seconds = time % 60

  return style === 'digital' 
    ? formatSecondsDigital(hours, minutes, seconds)
    : formatSecondsWithLetters(hours, minutes, seconds)
}

function formatSecondsDigital(hours: number, minutes: number, seconds: number) {
  const segments = [minutes, seconds]
    .map((value) => value < 10 ? '0' + value : value)
  if (hours) segments.unshift(hours)
  return segments.join(':')
}

function formatSecondsWithLetters(hours: number, minutes: number, seconds: number) {
  const segments = []
  if (hours) segments.push(`${hours}h`)
  if (minutes) {
    segments.push(`${minutes}m`)
  } else if (!hours) {
    segments.push(`${seconds}s`)
  }
  return segments.join(' ')
}