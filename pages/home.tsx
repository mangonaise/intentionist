import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useLayoutEffect } from 'react'
import HabitsHandler from '@/logic/app/HabitsHandler'
import WeekHandler from '@/logic/app/WeekHandler'
import useMediaQuery from '@/hooks/useMediaQuery'
import withApp from '@/components/app/withApp'
import NewWeekPrompt from '@/components/page/home/NewWeekPrompt'
import FriendsDropdown from '@/components/page/home/FriendsDropdown'
import WeekDropdown from '@/components/page/home/WeekDropdown'
import WeekIconDropdown from '@/components/page/home/WeekIconDropdown'
import WeekTable from '@/components/page/home/WeekTable'
import WeekViewModePicker from '@/components/page/home/WeekViewModePicker'
import OpenFocusButton from '@/components/page/home/OpenFocusButton'
import GetStartedSection from '@/components/page/home/GetStartedSection'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Head from 'next/head'

export const HomePageContext = createContext({ narrow: false })

const Home = observer(() => {
  const { habits } = container.resolve(HabitsHandler)
  const { weekInView: { friendUid, refreshHabitsInView } } = container.resolve(WeekHandler)
  const showTable = !!habits.length || !!friendUid
  const narrowLayout = useMediaQuery('(max-width: 700px)', true, false)

  useLayoutEffect(() => {
    if (!friendUid) {
      refreshHabitsInView(container.resolve(HabitsHandler).habits)
    }
  }, [])

  return (
    <HomePageContext.Provider value={{ narrow: narrowLayout }}>
      <Box sx={{ maxWidth: 'max', margin: 'auto' }}>
        <Head><title>Home</title></Head>
        <WeekViewModePicker />
        <Spacer mb={narrowLayout ? 2 : 3} />
        <NewWeekPrompt />
        <Flex sx={{ flexWrap: narrowLayout ? 'wrap' : 'nowrap' }}>
          <FriendsDropdown />
          <Flex sx={{ width: narrowLayout ? '100%' : 'fit-content' }}>
            <WeekDropdown />
            {showTable && <>
              <WeekIconDropdown />
            </>}
          </Flex>
          {showTable && <OpenFocusButton />}
        </Flex>
        <Spacer mb={narrowLayout ? 4 : 6} />
        {showTable ? <WeekTable /> : <GetStartedSection />}
      </Box>
    </HomePageContext.Provider>
  )
})

export default withApp(Home)