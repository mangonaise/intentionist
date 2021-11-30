import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
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
import Divider from '@/components/primitives/Divider'

const HabitTracker = observer(() => {
  const { habitsInView, selectedFriendUid, isLoadingHabits, refreshHabitsInView } = container.resolve(DisplayedHabitsHandler)
  const displayNewUserGuide = !isLoadingHabits && !selectedFriendUid && !habitsInView.length

  const multiRowNav = useMediaQuery('(max-width: 500px)', true, false)
  const fillNavWidth = useMediaQuery('(max-width: 700px)', true, false)

  useEffect(() => {
    refreshHabitsInView()
  }, [])

  return (
    <Box sx={{ maxWidth: 'max', mx: 'auto' }}>
      <Flex>
        <Box sx={{ bg: 'nav', borderRadius: 'default', flex: fillNavWidth ? 1 : 0 }}>
          <FriendsDropdown />
        </Box>
        {!multiRowNav && <>
          <Spacer mr={2} />
          <Box sx={{ bg: 'nav', borderRadius: 'default' }}>
            <WeekPicker />
          </Box>
        </>}
        {!selectedFriendUid && <>
          <Spacer ml={fillNavWidth ? 2 : 'auto'} />
          <HabitActions />
        </>}
      </Flex>

      {multiRowNav && <>
        <Spacer mt={2} />
        <Box sx={{ bg: 'nav', borderRadius: 'default' }}>
          <WeekPicker />
        </Box>
      </>}

      {!fillNavWidth && <Divider sx={{ my: 3 }} />}

      {!displayNewUserGuide && <>
        <Spacer mb={[3, 5]} />
        <WeekdayRow />
        <Spacer mb={[3, 4]} />
      </>}

      {isLoadingHabits ? <EmptyPageText text="Loading..." />
        : <FadeIn delay={50}>
          {(habitsInView.length
            ? habitsInView.map((habit) => <HabitWrapper habit={habit} key={habit.id} />)
            : (!displayNewUserGuide && <EmptyPageText text="Nothing to see here!" />))}
        </FadeIn>}
      {displayNewUserGuide && <NewUserHabitsGuide />}
    </Box>
  )
})

export default HabitTracker