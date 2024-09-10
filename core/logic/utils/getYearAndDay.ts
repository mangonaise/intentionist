import { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import getDayOfYear from 'date-fns/getDayOfYear'

export default function getYearAndDay(date: Date): YearAndDay {
  return {
    year: date.getFullYear(),
    dayOfYear: getDayOfYear(date)
  }
}