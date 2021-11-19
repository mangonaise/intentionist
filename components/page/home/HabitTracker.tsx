import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useState } from 'react'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import HabitsHandler from '@/logic/app/HabitsHandler'
import useMediaQuery from '@/hooks/useMediaQuery'
import HabitWrapper from '@/components/page/home/habit-tracker/HabitWrapper'
import Box from '@/components/primitives/Box'
import IconButton from '@/components/primitives/IconButton'
import PencilIcon from '@/components/icons/PencilIcon'
import NextLink from 'next/link'

const HabitTrackerContext = createContext<{
  weekStartDate: Date,
  incrementWeek: () => void,
  decrementWeek: () => void,
}>(null!)

const HabitTracker = observer(() => {
  const { activeHabits } = container.resolve(HabitsHandler)
  const [weekStartDate, setWeekStartDate] = useState(getFirstDayOfThisWeek())
  const isLargeScreen = useMediaQuery('(min-width: 950px', true, false)
  const isSmallScreen = useMediaQuery('(max-width: 500px', true, false)

  function incrementWeek() {
    // todo: implement
  }

  function decrementWeek() {
    // todo: implement
  }

  return (
    <HabitTrackerContext.Provider value={{ weekStartDate, incrementWeek, decrementWeek }}>
      <Box sx={{ maxWidth: '850px', mt: '4rem', marginX: 'auto' }}>
        {activeHabits.map((habit) => (
          <HabitWrapper habit={habit} isLargeScreen={isLargeScreen} isSmallScreen={isSmallScreen} key={habit.id} />
        ))}
        <NextLink href="/habits">
          <IconButton icon={PencilIcon} sx={{ mt: 8, margin: 'auto', bg: 'transparent' }}>Your habits</IconButton>
        </NextLink>
      </Box>
    </HabitTrackerContext.Provider>
  )
})

export default HabitTracker