import { useEffect, useState } from 'react'
import { differenceInMilliseconds, startOfTomorrow } from 'date-fns'
import { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import getYearAndDay from '@/logic/utils/getYearAndDay'
import getCurrentWeekdayId from '@/logic/utils/getCurrentWeekdayId'
import getWeekdayName from '@/logic/utils/getWeekdayName'

export type CurrentDateInfo = {
  weekdayId: number
  yearAndDay: YearAndDay,
  weekdayName: string
}

export default function useCurrentDate(): CurrentDateInfo {
  const [yearAndDay, setYearAndDay] = useState(getYearAndDay(new Date()))
  const [weekdayId, setWeekdayId] = useState(getCurrentWeekdayId())

  useEffect(() => {
    const timeout = setTimeout(() => {
      setYearAndDay(getYearAndDay(new Date()))
      setWeekdayId(getCurrentWeekdayId())
    }, differenceInMilliseconds(startOfTomorrow(), new Date()))
    return () => clearTimeout(timeout)
  }, [])

  return {
    weekdayId,
    yearAndDay,
    weekdayName: getWeekdayName(weekdayId)
  }
}