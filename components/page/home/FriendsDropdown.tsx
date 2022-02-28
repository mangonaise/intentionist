import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import ProfileHandler, { UserProfileInfo } from '@/logic/app/ProfileHandler'
import FriendsHandler, { Friend } from '@/logic/app/FriendsHandler'
import DisplayedHabitsHandler from '@/logic/app/DisplayedHabitsHandler'
import Dropdown from '@/components/modular/Dropdown'
import SmartEmoji from '@/components/modular/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Divider from '@/components/primitives/Divider'
import Icon from '@/components/primitives/Icon'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'

const FriendsDropdown = observer(() => {
  const { friends } = container.resolve(FriendsHandler)
  const { viewUser, selectedFriendUid } = container.resolve(DisplayedHabitsHandler)

  const selectedUserProfile = getUserProfile(selectedFriendUid)

  function handleSelectFriend(friendUid: string | null) {
    if (selectedFriendUid !== friendUid) {
      viewUser(friendUid)
    }
  }

  return (
    <Dropdown
      title={<DropdownTitle profile={selectedUserProfile} />}
      label={`Friends menu, currently viewing ${selectedUserProfile.displayName}`}
      sx={{ '& > button': { bg: 'transparent', px: 3 } }}
    >
      <FriendButton friend={null} onClick={() => handleSelectFriend(null)} />
      {!!friends.length && <Divider />}
      {friends.map((friend) => (
        <FriendButton friend={friend} onClick={() => handleSelectFriend(friend.uid)} key={friend.uid} />
      ))}
      <Divider />
      <Dropdown.Item href="/friends" sx={{ color: 'whiteAlpha.70', '&:hover': { color: 'text' } }}>
        <Flex center>
          Friends<Icon icon={ArrowRightIcon} sx={{ ml: 3 }} />
        </Flex>
      </Dropdown.Item>
    </Dropdown>
  )
})

const FriendButton = ({ friend, onClick }: { friend: Friend | null, onClick: () => void }) => {
  const { profileInfo } = container.resolve(ProfileHandler)

  const displayName = friend?.displayName ?? 'You'
  const avatar = friend?.avatar ?? profileInfo!.avatar

  return (
    <Dropdown.Item label={displayName} itemAction={onClick}>
      <Flex align="center" sx={{ maxWidth: '100%' }}>
        <SmartEmoji nativeEmoji={avatar} rem={1.2} />
        <Text
          type="span"
          sx={{
            ml: 4, maxWidth: 'min(1000px, calc(100vw - 5rem))',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
          }}>
          {displayName}
        </Text>
      </Flex>
    </Dropdown.Item>
  )
}

const DropdownTitle = observer(({ profile }: { profile: UserProfileInfo }) => {
  return (
    <Flex align="center">
      <SmartEmoji nativeEmoji={profile.avatar} rem={1.2} />
      <Text
        type="span"
        sx={{
          ml: 3, maxWidth: ['calc(100vw - 6rem)', 'min(calc(100vw - 27rem), 500px)'],
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
        }}
      >
        {profile.displayName}
      </Text>
    </Flex >
  )
})

function getUserProfile(friendUid: string | null) {
  const { friends } = container.resolve(FriendsHandler)
  const { profileInfo: loggedInUserProfileInfo } = container.resolve(ProfileHandler)

  let profile: UserProfileInfo | undefined

  if (friendUid) {
    const friend = friends.find((friend) => friend.uid === friendUid)
    if (friend) {
      profile = {
        avatar: friend.avatar,
        displayName: friend.displayName,
        username: friend.username
      }
    }
  }

  if (!profile) profile = { ...loggedInUserProfileInfo!, displayName: 'You' }

  return profile
}

export default FriendsDropdown