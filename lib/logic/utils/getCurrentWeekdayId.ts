import { getDay } from 'date-fns'
import { WeekdayId } from '@/logic/app/WeekHandler'

export default function getCurrentWeekdayId() {
  let index = getDay(new Date()) - 1
  if (index < 0) index = 6
  return index as WeekdayId
}