import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import { HabitTrackerContext } from '@/components/page/home/HabitTracker'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import TrackerStatus from '@/components/page/home/habit-tracker/TrackerStatus'
import Flex from '@/components/primitives/Flex'

const TrackerStatusRow = observer(() => {
  const { getWeeklyHabitStatusData } = container.resolve(HabitStatusesHandler)
  const { weekStart, isLargeScreen } = useContext(HabitTrackerContext)
  const { habit } = useContext(HabitContext)

  const weeklyData = getWeeklyHabitStatusData(habit, weekStart)

  return (
    <Flex
      align="center"
      sx={{
        position: 'relative', mx: '-0.5rem',
        width: isLargeScreen ? '950px' : 'auto', right: isLargeScreen ? '43px' : 0
      }}
    >
      {weeklyData.map(({ value, date, hasPreviousValue, hasNextValue }, index) => (
        <TrackerStatus
          value={value}
          date={date}
          connectLeft={hasPreviousValue}
          connectRight={hasNextValue}
          weekdayIndex={index}
          key={index}
        />
      ))}
    </Flex>
  )
})

export default TrackerStatusRow