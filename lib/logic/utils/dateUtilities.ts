import lightFormat from 'date-fns/lightFormat'
import startOfWeek from 'date-fns/startOfWeek'

const YYYYMMDD = 'yyyy-MM-dd'

export function getFirstDayOfThisWeek() {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

export function formatFirstDayOfThisWeek() {
  return formatYYYYMMDD(getFirstDayOfThisWeek())
}

export function formatYYYYMMDD(date: Date) {
  return lightFormat(date, YYYYMMDD)
}