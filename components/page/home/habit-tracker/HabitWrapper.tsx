import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useEffect } from 'react'
import HabitsHandler, { Habit } from '@/logic/app/HabitsHandler'
import { CurrentDateContext } from '@/components/app/withApp'
import HabitStatusesHandler from '@/logic/app/HabitStatusesHandler'
import HabitTitleSection from '@/components/page/home/habit-tracker/HabitTitleSection'
import TrackerStatusRow from '@/components/page/home/habit-tracker/TrackerStatusRow'
import HabitInfoSection from '@/components/page/home/habit-tracker/HabitInfoSection'
import Spacer from '@/components/primitives/Spacer'
import Flex from '@/components/primitives/Flex'
import Box from '@/components/primitives/Box'

type HabitProps = {
  habit: Habit & { friendUid?: string },
  isSharedHabit: boolean
}

export const HabitContext = createContext<HabitProps>(null!)

const HabitWrapper = observer(({ habit }: HabitProps) => {
  const { yearAndDay } = useContext(CurrentDateContext)
  const isSharedHabit = !!container.resolve(HabitsHandler).sharedHabitIds[habit.id]

  useEffect(() => {
    container.resolve(HabitStatusesHandler).refreshStreak(habit)
  }, [yearAndDay])

  return (
    <HabitContext.Provider value={{ habit, isSharedHabit }}>
      <Box sx={{ mb: [5, 6] }}>
        <Flex column>
          <HabitInfoSection />
          <Spacer mb={1} />
          <HabitTitleSection />
        </Flex>
        <Spacer mb={3} />
        <TrackerStatusRow />
      </Box>
    </HabitContext.Provider>
  )
})

export default HabitWrapper