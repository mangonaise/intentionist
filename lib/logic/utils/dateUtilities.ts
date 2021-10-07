import format from 'date-fns/format'
import startOfWeek from 'date-fns/startOfWeek'

const YYYYMMDD = 'yyyy-MM-dd'

export function formatFirstDayOfThisWeek() {
  return formatYYYYMMDD(startOfWeek(new Date(), { weekStartsOn: 1 }))
}

export function formatYYYYMMDD(date: Date) {
  return format(date, YYYYMMDD)
}