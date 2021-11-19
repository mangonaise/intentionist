import { container } from 'tsyringe'
import { useState } from 'react'
import HabitsHandler from '@/logic/app/HabitsHandler'
import HabitsPageNavSection from '@/components/page/habits/HabitsPageNavSection'
import EmptyHabitsPageGuide from '@/components/page/habits/EmptyHabitsPageGuide'
import ActiveHabitsList from '@/components/page/habits/ActiveHabitsList'
import withApp from '@/components/app/withApp'
import Box from '@/components/primitives/Box'
import Head from 'next/head'
import Spacer from '@/components/primitives/Spacer'

const HabitsPage = () => {
  const [showGuide] = useState(container.resolve(HabitsHandler).activeHabits.length === 0)

  return (
    <>
      <Head><title>Habits</title></Head>
      <Box sx={{ maxWidth: 'habits', margin: 'auto' }}>
        <HabitsPageNavSection />
        <Spacer mb={[2, 3]} />
        <ActiveHabitsList />
        {showGuide && <EmptyHabitsPageGuide />}
        <Spacer mb={4} />
      </Box>
    </>
  )
}

export default withApp(HabitsPage)