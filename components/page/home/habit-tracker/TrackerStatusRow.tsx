import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
import TrackerStatus from '@/components/page/home/habit-tracker/TrackerStatus'
import Flex from '@/components/primitives/Flex'

const TrackerStatusRow = observer(() => {
  const { getWeeklyHabitStatusData } = container.resolve(HabitStatusesHandler)
  const { selectedWeekStartDate } = container.resolve(DisplayedHabitsHandler)
  const { habit } = useContext(HabitContext)

  const weeklyData = getWeeklyHabitStatusData(habit, selectedWeekStartDate)

  return (
    <Flex
      align="center"
      sx={{ mx: ['-0.5rem', 'auto'] }}
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