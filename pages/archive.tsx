import withApp from '@/components/app/withApp'
import ArchivedHabitsList from '@/components/page/archive/ArchivedHabitsList'
import ArchiveNavSection from '@/components/page/archive/ArchiveNavSection'
import Box from '@/components/primitives/Box'
import Spacer from '@/components/primitives/Spacer'
import Head from 'next/head'

const ArchivedHabitsPage = () => {
  return (
    <>
      <Head><title>Archive</title></Head>
      <Box sx={{ maxWidth: 'habits', margin: 'auto' }}>
        <ArchiveNavSection />
        <Spacer mb={[2, 3]} />
        <ArchivedHabitsList />
        <Spacer mb={4} />
      </Box>
    </>
  )
}

export default withApp(ArchivedHabitsPage)