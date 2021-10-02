import { container } from 'tsyringe'
import { createContext } from 'react'
import { withApp } from '@/components/app'
import { Box } from '@/components/primitives'
import { FilteredHabitsList, HabitsPageNavSection } from '@/components/page/habits'
import HabitFilterHandler from '@/lib/logic/app/HabitFilterHandler'
import Head from 'next/head'

export const HabitFilterContext = createContext<HabitFilterHandler>(null!)

const HabitsPage = () => {
  return (
    <HabitFilterContext.Provider value={container.resolve(HabitFilterHandler)}>
      <Head><title>Habits</title></Head>
      <Box maxWidth="habits" margin="auto">
        <HabitsPageNavSection />
        <FilteredHabitsList />
      </Box>
    </HabitFilterContext.Provider>
  )
}

export default withApp(HabitsPage, 'neutral')