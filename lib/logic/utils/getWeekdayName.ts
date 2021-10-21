import { WeekdayId } from '../app/WeekHandler'

const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function getWeekdayName(weekdayId: WeekdayId) {
  return weekdayNames[weekdayId]
}