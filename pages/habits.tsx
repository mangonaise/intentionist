import { container } from 'tsyringe'
import { createContext, useState } from 'react'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'
import HabitFilterHandler from '@/lib/logic/app/HabitFilterHandler'
import withApp from '@/components/app/withApp'
import FilteredHabitsList from '@/components/page/habits/FilteredHabitsList'
import HabitsPageNavSection from '@/components/page/habits/HabitsPageNavSection'
import EmptyHabitsPageGuide from '@/components/page/habits/EmptyHabitsPageGuide'
import Spacer from '@/components/primitives/Spacer'
import Box from '@/components/primitives/Box'
import Head from 'next/head'

export const HabitFilterContext = createContext<HabitFilterHandler>(null!)

const HabitsPage = () => {
  const [showGuide] = useState(container.resolve(HabitsHandler).habits.length === 0)

  return (
    <HabitFilterContext.Provider value={container.resolve(HabitFilterHandler)}>
      <Head><title>Habits</title></Head>
      <Box sx={{ maxWidth: 'habits', margin: 'auto' }}>
        <HabitsPageNavSection />
        <Spacer mb={[2, 3]} />
        <FilteredHabitsList />
        {showGuide && <EmptyHabitsPageGuide />}
        <Spacer mb={4} />
      </Box>
    </HabitFilterContext.Provider>
  )
}

export default withApp(HabitsPage, 'neutral')