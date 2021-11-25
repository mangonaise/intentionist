import { container } from 'tsyringe'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitStreak from '@/components/page/home/habit-tracker/HabitStreak'
import HabitVisibilityDropdown from '@/components/page/home/habit-tracker/HabitVisibilityDropdown'
import ShareHabitButton from '@/components/page/home/habit-tracker/ShareHabitButton'
import FriendsHandler from '@/logic/app/FriendsHandler'
import HomeViewHandler from '@/logic/app/HomeViewHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import ProfileHandler from '@/logic/app/ProfileHandler'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'

const HabitInfoSection = () => {
  const { habit } = useContext(HabitContext)
  const { selectedFriendUid } = container.resolve(HomeViewHandler)
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
          <Text type="span" sx={{ ml: 2, opacity: 0.5, fontWeight: 'light' }}>
            {displayName}
          </Text>
        </Flex>
      )}
      <Spacer ml="auto" />
      <HabitStreak />
      {!habit.friendUid && <>
        <Spacer ml={2} />
        <HabitVisibilityDropdown />
      </>}
    </Flex>
  )
}

export default HabitInfoSection