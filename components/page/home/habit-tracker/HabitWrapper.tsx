import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useEffect } from 'react'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import CurrentDateHandler from '@/logic/app/CurrentDateHandler'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
import HabitTitleSection from '@/components/page/home/habit-tracker/HabitTitleSection'
import TrackerStatusRow from '@/components/page/home/habit-tracker/TrackerStatusRow'
import HabitInfoSection from '@/components/page/home/habit-tracker/HabitInfoSection'
import Spacer from '@/components/primitives/Spacer'
import Flex from '@/components/primitives/Flex'
import Box from '@/components/primitives/Box'

export const HabitContext = createContext<{
  habit: Habit & { friendUid?: string }
  isLinkedHabit: boolean
}>(null!)

const HabitWrapper = observer(({ habit }: { habit: Habit & { friendUid?: string } }) => {
  const { selectedFriendUid } = container.resolve(DisplayedHabitsHandler)
  const { yearAndDay } = container.resolve(CurrentDateHandler)
  const isLinkedHabit = !!container.resolve(HabitsHandler).linkedHabits[habit.id]

  useEffect(() => {
    container.resolve(HabitStatusesHandler).refreshStreak(habit)
  }, [yearAndDay])

  return (
    <HabitContext.Provider value={{ habit, isLinkedHabit }}>
      <Box sx={{ mb: 5, mt: (!selectedFriendUid && isLinkedHabit) ? ['-0.5rem','-0.65rem'] : 1 }}>
        <Flex column>
          {(!isLinkedHabit || selectedFriendUid) && <>
            <HabitTitleSection />
            <Spacer mb={1} />
          </>}
          <HabitInfoSection />
        </Flex>
        <Spacer mb={3} />
        <TrackerStatusRow />
      </Box>
    </HabitContext.Provider>
  )
})

export default HabitWrapper