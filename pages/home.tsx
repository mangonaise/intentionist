import { withApp } from '@/components/app'
import { NewWeekPrompt, WeekDropdown, WeekTable, WeekViewModePicker } from '@/components/page/home'
import { Box, Flex, Spacer } from '@/components/primitives'
import OpenFocusButton from '@/components/page/home/src/OpenFocusButton'
import Head from 'next/head'

const Home = () => {
  return (
    <Box sx={{ maxWidth: 'max', margin: 'auto' }}>
      <Head><title>Home</title></Head>
      <WeekViewModePicker />
      <Spacer mb={3} />
      <NewWeekPrompt />
      <Flex sx={{ flexWrap: ['wrap', 'nowrap'] }}>
        <WeekDropdown />
        <OpenFocusButton />
      </Flex>
      <Spacer mb={3} />
      <WeekTable />
    </Box>
  )
}

export default withApp(Home)