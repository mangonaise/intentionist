import { Habit } from '@/logic/app/HabitsHandler'
import { createContext } from 'react'
import HabitVisibilityDropdown from '@/components/page/home/habit-tracker/HabitVisibilityDropdown'
import HabitTitleSection from '@/components/page/home/habit-tracker/HabitTitleSection'
import TrackerStatusRow from '@/components/page/home/habit-tracker/TrackerStatusRow'
import HabitStreak from '@/components/page/home/habit-tracker/HabitStreak'
import Spacer from '@/components/primitives/Spacer'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'

type HabitProps = {
  habit: Habit
  isLargeScreen: boolean
  isSmallScreen: boolean
}

export const HabitContext = createContext<HabitProps>(null!)

const HabitWrapper = ({ habit, isLargeScreen, isSmallScreen }: HabitProps) => {
  return (
    <HabitContext.Provider value={{ habit, isLargeScreen, isSmallScreen }}>
      <Box sx={{ mb: [4, 7] }}>
        <Flex sx={{ flexDirection: isLargeScreen ? 'row' : 'column' }}>
          <HabitTitleSection />
          <Spacer mb={2} mr={isLargeScreen ? 'auto' : 0} />
          <Flex align="center" sx={{ flexDirection: isLargeScreen ? 'row-reverse' : 'row' }}>
            <HabitVisibilityDropdown />
            <Spacer mr={2} />
            <HabitStreak />
          </Flex>
        </Flex>
        <Spacer mb={isLargeScreen ? 6 : 4} />
        <TrackerStatusRow />
      </Box>
    </HabitContext.Provider>
  )
}

export default HabitWrapper