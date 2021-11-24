import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import HomeViewHandler from '@/logic/app/HomeViewHandler'
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
  const { habitsInView, selectedFriendUid, isLoadingFriendActivity } = container.resolve(HomeViewHandler)
  const displayNewUserGuide = !selectedFriendUid && !habitsInView.length

  return (
    <Box sx={{ mt: [0, '4rem', '4rem'] }}>
      <Flex sx={{ maxWidth: 'max', mx: 'auto' }}>
        <FriendsDropdown />
        <Spacer ml="auto" />
        {!selectedFriendUid && <HabitActions />}
      </Flex>
      <Spacer mb={[2, 0]} />
      {!displayNewUserGuide && <Box sx={{ maxWidth: 'max', mx: 'auto' }}>
        <WeekPicker />
        <Spacer mb={[3, 4, 6]} />
        <WeekdayRow />
        <Spacer mb={[4, 5, 6]} />
      </Box>}
      {isLoadingFriendActivity ? <EmptyPageText text="Loading..." />
        : <FadeIn>
          {(habitsInView.length
            ? habitsInView.map((habit) => <HabitWrapper habit={habit} key={habit.id} />)
            : <EmptyPageText text="Nothing to see here!" />)}
        </FadeIn>}
      {displayNewUserGuide && <NewUserHabitsGuide />}
    </Box>
  )
})

export default HabitTracker