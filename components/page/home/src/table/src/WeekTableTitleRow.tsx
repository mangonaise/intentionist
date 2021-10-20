import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { differenceInMilliseconds, getDay, isSameDay, startOfTomorrow } from 'date-fns'
import { Flex } from '@/components/primitives'
import useMediaQuery from '@/lib/hooks/useMediaQuery'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import NewWeekPromptHandler from '@/lib/logic/app/NewWeekPromptHandler'

const weekdaysLong = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekdaysShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WeekTableTitleRow = () => {
  const { viewMode } = container.resolve(WeekHandler)

  switch (viewMode) {
    case 'tracker':
      return <WeekdayLabels />
    case 'journal':
      return (
        <Flex center sx={{ height: 'row' }}>
          Entries
        </Flex>
      )
    case 'focus':
      return (
        <Flex sx={{ height: 'row' }}>
          <WeekdayLabels />
        </Flex>
      )
  }
}

const WeekdayLabels = observer(() => {
  const { viewMode, weekInView, isLoadingWeek } = container.resolve(WeekHandler)
  const { thisWeekStartDate } = container.resolve(NewWeekPromptHandler)
  const [currentDayIndex, setCurrentDayIndex] = useState(getCurrentDayIndex())
  const weekInViewStartDate = new Date(weekInView.startDate)
  const isViewingCurrentWeek = isSameDay(weekInViewStartDate, thisWeekStartDate)
  const weekdayNames = useMediaQuery<string[]>('(max-width: 600px)', weekdaysShort, weekdaysLong)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentDayIndex(getCurrentDayIndex())
    }, differenceInMilliseconds(startOfTomorrow(), new Date()))
    return () => clearTimeout(timeout)
  }, [currentDayIndex])

  return (
    <>
      {weekdayNames.map((day, index) => (
        <Flex
          center
          sx={{
            height: 'row',
            marginLeft: '1px',
            flex: 1,
            backgroundColor: (!isLoadingWeek && isViewingCurrentWeek && index === currentDayIndex) ? viewMode : 'transparent',
            borderTopLeftRadius: 'default',
            borderTopRightRadius: 'default'
          }}
          key={index}
        >
          {day}
        </Flex>
      ))}
    </>
  )
})

function getCurrentDayIndex() {
  let index = getDay(new Date()) - 1
  if (index < 0) index = 6
  return index
}

export default observer(WeekTableTitleRow)