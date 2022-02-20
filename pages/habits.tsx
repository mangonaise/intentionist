import HabitsPageNavSection from '@/components/page/habits/HabitsPageNavSection'
import ReorderHabitsList from '@/components/page/habits/ReorderHabitsList'
import withApp from '@/components/modular/withApp'
import Box from '@/components/primitives/Box'
import Spacer from '@/components/primitives/Spacer'
import Head from 'next/head'

const HabitsPage = () => {
  return (
    <>
      <Head><title>Habits</title></Head>
      <Box sx={{ maxWidth: 'habits', margin: 'auto' }}>
        <HabitsPageNavSection />
        <Spacer mb={[2, 3]} />
        <ReorderHabitsList />
        <Spacer mb={4} />
      </Box>
    </>
  )
}

export default withApp(HabitsPage)