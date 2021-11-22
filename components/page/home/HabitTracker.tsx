import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, Dispatch, SetStateAction, useState } from 'react'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import useMediaQuery from '@/hooks/useMediaQuery'
import getYearAndDay from '@/logic/utils/getYearAndDay'
import HabitsHandler from '@/logic/app/HabitsHandler'
import HabitWrapper from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitActions from '@/components/page/home/HabitActions'
import WeekdayRow from '@/components/page/home/habit-tracker/WeekdayRow'
import WeekPicker from '@/components/page/home/habit-tracker/WeekPicker'
import Spacer from '@/components/primitives/Spacer'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'

export const HabitTrackerContext = createContext<{
  weekStart: YearAndDay,
  setWeekStart: Dispatch<SetStateAction<YearAndDay>>
}>(null!)

const HabitTracker = observer(() => {
  const { activeHabits } = container.resolve(HabitsHandler)
  const [weekStart, setWeekStart] = useState(getYearAndDay(getFirstDayOfThisWeek()))
  const isLargeScreen = useMediaQuery('(min-width: 950px', true, false)
  const isSmallScreen = useMediaQuery('(max-width: 500px', true, false)

  return (
    <HabitTrackerContext.Provider value={{ weekStart, setWeekStart }}>
      <Box sx={{ maxWidth: '850px', mt: [0, '4rem', '4rem'], marginX: 'auto' }}>
        <Flex>
          <WeekPicker />
          <Spacer ml="auto" />
          <HabitActions />
        </Flex>
        <Spacer mb={[4, 6, 8]} />
        <WeekdayRow expand={isLargeScreen} />
        <Spacer mb={[4, 6, 8]} />
        {activeHabits.map((habit) => (
          <HabitWrapper habit={habit} isLargeScreen={isLargeScreen} isSmallScreen={isSmallScreen} key={habit.id} />
        ))}
      </Box>
    </HabitTrackerContext.Provider>
  )
})

export default HabitTracker