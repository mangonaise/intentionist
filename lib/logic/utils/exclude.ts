export default function exclude(original: object, ...keysToExclude: string[]) {
  const newEntries = Object.entries(original).filter(([key]) => !keysToExclude.includes(key))
  return Object.fromEntries(newEntries)
}