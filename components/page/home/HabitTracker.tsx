import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext } from 'react'
import HomeViewHandler from '@/logic/app/HomeViewHandler'
import useMediaQuery from '@/hooks/useMediaQuery'
import HabitWrapper from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitActions from '@/components/page/home/HabitActions'
import FriendsDropdown from '@/components/page/home/FriendsDropdown'
import WeekdayRow from '@/components/page/home/habit-tracker/WeekdayRow'
import WeekPicker from '@/components/page/home/habit-tracker/WeekPicker'
import NewUserHabitsGuide from '@/components/page/home/NewUserHabitsGuide'
import EmptyPageText from '@/components/app/EmptyPageText'
import Spacer from '@/components/primitives/Spacer'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import FadeIn from '@/components/primitives/FadeIn'

export const HabitTrackerScreenContext = createContext<{
  isLargeScreen: boolean,
  isSmallScreen: boolean
}>(null!)

const HabitTracker = observer(() => {
  const { habitsInView, selectedFriendUid, isLoadingFriendActivity } = container.resolve(HomeViewHandler)
  const isLargeScreen = useMediaQuery('(min-width: 950px', true, false)
  const isSmallScreen = useMediaQuery('(max-width: 500px', true, false)

  const displayNewUserGuide = !selectedFriendUid && !habitsInView.length

  return (
    <HabitTrackerScreenContext.Provider value={{ isLargeScreen, isSmallScreen }}>
      <Box sx={{ maxWidth: '850px', mt: [0, '4rem', '4rem'], marginX: 'auto' }}>
        <Flex>
          <FriendsDropdown />
          <Spacer ml="auto" />
          {!selectedFriendUid && <HabitActions />}
        </Flex>
        <Spacer mb={[2, 0]} />
        {!displayNewUserGuide && <>
          <WeekPicker />
          <Spacer mb={[3, 4, 6]} />
          <WeekdayRow expand={isLargeScreen} />
          <Spacer mb={[4, 5, 6]} />
        </>}
        {isLoadingFriendActivity ? <EmptyPageText text="Loading..." />
          : <FadeIn>
            {(habitsInView.length
              ? habitsInView.map((habit) => <HabitWrapper habit={habit} key={habit.id} />)
              : <EmptyPageText text="Nothing to see here!" />)}
          </FadeIn>}
        {displayNewUserGuide && <NewUserHabitsGuide />}
      </Box>
    </HabitTrackerScreenContext.Provider>
  )
})

export default HabitTracker