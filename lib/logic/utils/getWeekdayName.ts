import { WeekdayId } from '../app/WeekHandler'
import { weekdayNames } from './_consts'

export default function getWeekdayName(weekdayId: WeekdayId) {
  return weekdayNames[weekdayId]
}