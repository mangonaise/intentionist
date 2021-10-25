import addWeeks from 'date-fns/addWeeks'
import format from 'date-fns/format'
import startOfWeek from 'date-fns/startOfWeek'

const YYYYMMDD = 'yyyy-MM-dd'

export function getFirstDayOfThisWeek() {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

export function getFirstDayOfNextWeek() {
  return startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 })
}

export function formatFirstDayOfThisWeek() {
  return formatYYYYMMDD(getFirstDayOfThisWeek())
}

export function formatYYYYMMDD(date: Date) {
  return format(date, YYYYMMDD)
}

export function separateYYYYfromMMDD(formattedDate: string) {
  const [yyyy, mmdd] = formattedDate.split(/-(.+)/)
  return { yyyy, mmdd }
}