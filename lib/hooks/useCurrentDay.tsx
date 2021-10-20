import { differenceInMilliseconds, getDay, startOfTomorrow } from 'date-fns'
import { useEffect, useState } from 'react'
import { WeekdayId } from '../logic/app/WeekHandler'

export default function useCurrentDay() {
  const [weekdayId, setWeekdayId] = useState(getCurrentDayIndex())

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWeekdayId(getCurrentDayIndex())
    }, differenceInMilliseconds(startOfTomorrow(), new Date()))
    return () => clearTimeout(timeout)
  }, [weekdayId])

  return { weekdayId }
}

function getCurrentDayIndex() {
  let index = getDay(new Date()) - 1
  if (index < 0) index = 6
  return index as WeekdayId
}