export default function getUtcSeconds() {
  return Math.round(Date.now() / 1000)
}