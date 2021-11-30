import { container } from 'tsyringe'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitStreak from '@/components/page/home/habit-tracker/HabitStreak'
import HabitVisibilityDropdown from '@/components/page/home/habit-tracker/HabitVisibilityDropdown'
import ShareHabitButton from '@/components/page/home/habit-tracker/ShareHabitButton'
import FriendsHandler from '@/logic/app/FriendsHandler'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import ProfileHandler from '@/logic/app/ProfileHandler'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'

const HabitInfoSection = () => {
  const { habit, isSharedHabit } = useContext(HabitContext)
  const { selectedFriendUid } = container.resolve(DisplayedHabitsHandler)
  const { friends } = container.resolve(FriendsHandler)
  const { profileInfo } = container.resolve(ProfileHandler)

  const friend = friends.find((friend) => friend.uid === habit.friendUid)
  const { avatar, displayName } =
    friend
      ? { avatar: friend.avatar, displayName: friend.displayName }
      : { avatar: profileInfo?.avatar ?? '🙂', displayName: 'You' }

  return (
    <Flex>
      {!!selectedFriendUid ? <ShareHabitButton /> : (
        <Flex align="center" sx={{ pl: 1 }}>
          <SmartEmoji rem={1.1} nativeEmoji={avatar} />
          <Text
            type="span"
            sx={{
              ml: 2, maxWidth: 'min(calc(100vw - 12rem), 400px)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              ...(isSharedHabit ? { color: 'textAccentAlt', fontWeight: 'medium' } : { opacity: 0.5 })
            }}
          >
            {displayName}
          </Text>
        </Flex>
      )}
      <Spacer ml="auto" />
      <HabitStreak />
      <Spacer ml={2} />
      {habit.friendUid
        ? (!selectedFriendUid && <ShareHabitButton anchorRight />)
        : <HabitVisibilityDropdown />}
    </Flex>
  )
}

export default HabitInfoSection