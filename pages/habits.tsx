import { container } from 'tsyringe'
import { createContext } from 'react'
import HabitFilterHandler from '@/lib/logic/app/HabitFilterHandler'
import withApp from '@/components/app/withApp'
import FilteredHabitsList from '@/components/page/habits/FilteredHabitsList'
import HabitsPageNavSection from '@/components/page/habits/HabitsPageNavSection'
import Box from '@/components/primitives/Box'
import Head from 'next/head'

export const HabitFilterContext = createContext<HabitFilterHandler>(null!)

const HabitsPage = () => {
  return (
    <HabitFilterContext.Provider value={container.resolve(HabitFilterHandler)}>
      <Head><title>Habits</title></Head>
      <Box sx={{ maxWidth: 'habits', margin: 'auto' }}>
        <HabitsPageNavSection />
        <FilteredHabitsList />
      </Box>
    </HabitFilterContext.Provider>
  )
}

export default withApp(HabitsPage, 'neutral')