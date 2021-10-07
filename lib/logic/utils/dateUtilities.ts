import { format, startOfWeek } from 'date-fns'

const YYYYMMDD = 'yyyy-MM-dd'

export function formatFirstDayOfThisWeek() {
  return formatYYYYMMDD(startOfWeek(new Date(), { weekStartsOn: 1 }))
}

export function formatYYYYMMDD(date: Date) {
  return format(date, YYYYMMDD)
}