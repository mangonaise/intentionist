import { differenceInMilliseconds, startOfTomorrow } from 'date-fns'
import { useEffect, useState } from 'react'
import getCurrentWeekdayId from '../logic/utils/getCurrentWeekdayId'

const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function useCurrentDay() {
  const [weekdayId, setWeekdayId] = useState(getCurrentWeekdayId())

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWeekdayId(getCurrentWeekdayId())
    }, differenceInMilliseconds(startOfTomorrow(), new Date()))
    return () => clearTimeout(timeout)
  }, [weekdayId])

  return {
    weekdayId,
    weekdayName: weekdayNames[weekdayId] 
  }
}