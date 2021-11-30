import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useEffect } from 'react'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import CurrentDateHandler from '@/logic/app/CurrentDateHandler'
import HabitTitleSection from '@/components/page/home/habit-tracker/HabitTitleSection'
import TrackerStatusRow from '@/components/page/home/habit-tracker/TrackerStatusRow'
import HabitInfoSection from '@/components/page/home/habit-tracker/HabitInfoSection'
import Spacer from '@/components/primitives/Spacer'
import Flex from '@/components/primitives/Flex'
import Box from '@/components/primitives/Box'

export const HabitContext = createContext<{
  habit: Habit & { friendUid?: string },
  isSharedHabit: boolean
}>(null!)

const HabitWrapper = observer(({ habit }: { habit: Habit & { friendUid?: string } }) => {
  const { yearAndDay } = container.resolve(CurrentDateHandler)
  const isSharedHabit = !!container.resolve(HabitsHandler).sharedHabitIds[habit.id]

  useEffect(() => {
    container.resolve(HabitStatusesHandler).refreshStreak(habit)
  }, [yearAndDay])

  return (
    <HabitContext.Provider value={{ habit, isSharedHabit }}>
      <Box sx={{ mb: [5, 6] }}>
        <Flex column>
          <HabitTitleSection />
          <Spacer mb={1} />
          <HabitInfoSection />
        </Flex>
        <Spacer mb={3} />
        <TrackerStatusRow />
      </Box>
    </HabitContext.Provider>
  )
})

export default HabitWrapper