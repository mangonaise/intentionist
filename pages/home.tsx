import { withApp } from '@/components/app'
import { NewWeekPrompt, WeekDropdown, WeekTable, WeekViewModePicker } from '@/components/page/home'
import { Box, Spacer } from '@/components/primitives'
import Head from 'next/head'

const Home = () => {
  return (
    <Box sx={{ maxWidth: 'max', margin: 'auto' }}>
      <Head><title>Home</title></Head>
      <WeekViewModePicker />
      <Spacer mb={3} />
      <NewWeekPrompt />
      <WeekDropdown />
      <Spacer mb={3} />
      <WeekTable />
    </Box>
  )
}

export default withApp(Home)