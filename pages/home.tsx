import { withApp } from '@/components/app'
import { WeekDropdown, WeekTable, WeekViewModePicker } from '@/components/page/home'
import { Box, Spacer } from '@/components/primitives'
import Head from 'next/head'

const Home = () => {
  return (
    <Box maxWidth="max" margin="auto">
      <Head><title>Home</title></Head>
      <WeekViewModePicker />
      <Spacer mb={4} />
      <WeekDropdown />
      <Spacer mb={4} />
      <WeekTable />
    </Box>
  )
}

export default withApp(Home)