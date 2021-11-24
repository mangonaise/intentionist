import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import { HabitTrackerScreenContext } from '@/components/page/home/HabitTracker'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import HomeViewHandler from '@/logic/app/HomeViewHandler'
import TrackerStatus from '@/components/page/home/habit-tracker/TrackerStatus'
import Flex from '@/components/primitives/Flex'

const TrackerStatusRow = observer(() => {
  const { getWeeklyHabitStatusData } = container.resolve(HabitStatusesHandler)
  const { selectedWeekStartDate } = container.resolve(HomeViewHandler)
  const { isLargeScreen } = useContext(HabitTrackerScreenContext)
  const { habit } = useContext(HabitContext)

  const weeklyData = getWeeklyHabitStatusData(habit, selectedWeekStartDate)

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