import { differenceInMilliseconds, startOfTomorrow } from 'date-fns'
import { useEffect, useState } from 'react'
import getCurrentWeekdayId from '../logic/utils/getCurrentWeekdayId'
import getWeekdayName from '../logic/utils/getWeekdayName'

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
    weekdayName: getWeekdayName(weekdayId)
  }
}