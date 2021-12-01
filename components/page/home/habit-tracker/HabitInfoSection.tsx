import { container } from 'tsyringe'
import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import HabitStreak from '@/components/page/home/habit-tracker/HabitStreak'
import HabitVisibilityDropdown from '@/components/page/home/habit-tracker/HabitVisibilityDropdown'
import LinkHabitButton from '@/components/page/home/habit-tracker/LinkHabitButton'
import FriendsHandler from '@/logic/app/FriendsHandler'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
import ProfileHandler from '@/logic/app/ProfileHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'
import Box from '@/components/primitives/Box'

const HabitInfoSection = () => {
  const { habit, isLinkedHabit } = useContext(HabitContext)
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
      {!!selectedFriendUid ? <LinkHabitButton /> : (
        <Flex asSpan align="center" sx={{ pl: 1 }}>
          <SmartEmoji rem={1.1} nativeEmoji={avatar} />
          <Text
            type="span"
            sx={{
              ml: 2, maxWidth: 'min(calc(100vw - 12rem), 400px)', color: 'whiteAlpha.50',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: 'light'
            }}
          >
            <Text type="span" sx={{
              color: isLinkedHabit ? 'textAccentAlt' : undefined,
              fontWeight: isLinkedHabit ? 'medium' : undefined
            }}>
              {displayName}
            </Text>
            {isLinkedHabit && <>
              <Box role="presentation" sx={{ display: 'inline', borderRight: 'solid 1px', borderColor: 'whiteAlpha.30', mx: 2 }} />
              <Text type="span">
                {habit.name}
              </Text>
            </>}
          </Text>
        </Flex>
      )}
      <Spacer ml="auto" />
      <HabitStreak />
      <Spacer ml={2} />
      {habit.friendUid
        ? (!selectedFriendUid && <LinkHabitButton anchorRight />)
        : <HabitVisibilityDropdown />}
    </Flex>
  )
}

export default HabitInfoSection