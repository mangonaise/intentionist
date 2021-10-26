import withApp from '@/components/app/withApp'
import NewWeekPrompt from '@/components/page/home/NewWeekPrompt'
import WeekDropdown from '@/components/page/home/WeekDropdown'
import WeekIconDropdown from '@/components/page/home/WeekIconDropdown'
import WeekTable from '@/components/page/home/WeekTable'
import WeekViewModePicker from '@/components/page/home/WeekViewModePicker'
import OpenFocusButton from '@/components/page/home/OpenFocusButton'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Head from 'next/head'

const Home = () => {
  return (
    <Box sx={{ maxWidth: 'max', margin: 'auto' }}>
      <Head><title>Home</title></Head>
      <WeekViewModePicker />
      <Spacer mb={[2, 3]} />
      <NewWeekPrompt />
      <Flex sx={{ flexWrap: ['wrap', 'nowrap'] }}>
        <Flex sx={{ width: ['100%', 'fit-content'] }}>
          <WeekDropdown />
          <Spacer mr={2} />
          <WeekIconDropdown />
        </Flex>
        <OpenFocusButton />
      </Flex>
      <Spacer mb={[4, 6]} />
      <WeekTable />
    </Box>
  )
}

export default withApp(Home)