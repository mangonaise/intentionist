import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
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

const HabitTracker = observer(() => {
  const { habitsInView, selectedFriendUid, isLoadingHabits, refreshHabitsInView } = container.resolve(DisplayedHabitsHandler)
  const displayNewUserGuide = !isLoadingHabits && !selectedFriendUid && !habitsInView.length

  useEffect(() => {
    refreshHabitsInView()
  }, [])

  return (
    <Box sx={{ mt: [0, '4rem', '4rem'], maxWidth: 'max', mx: 'auto' }}>
      <Flex>
        <FriendsDropdown />
        <Spacer ml="auto" />
        {!selectedFriendUid && <HabitActions />}
      </Flex>
      <Spacer mb={[2, 0]} />
      {!displayNewUserGuide && <Box>
        <WeekPicker />
        <Spacer mb={[3, 4, 6]} />
        <WeekdayRow />
        <Spacer mb={[4, 5, 6]} />
      </Box>}
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