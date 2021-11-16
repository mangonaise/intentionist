import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HomePageContext } from 'pages/home'
import ProfileHandler, { UserProfileInfo } from '@/logic/app/ProfileHandler'
import FriendsHandler, { Friend } from '@/logic/app/FriendsHandler'
import WeekHandler from '@/logic/app/WeekHandler'
import Dropdown from '@/components/app/Dropdown'
import SmartEmoji from '@/components/app/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Divider from '@/components/primitives/Divider'
import Icon from '@/components/primitives/Icon'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'

const FriendsDropdown = observer(() => {
  const { viewWeek, weekInView } = container.resolve(WeekHandler)
  const { friends } = container.resolve(FriendsHandler)
  const { narrow } = useContext(HomePageContext)

  function handleSelectUser(uid?: string) {
    viewWeek({
      startDate: weekInView.data.startDate,
      friendUid: uid
    })
  }

  return (
    <Dropdown
      title={<DropdownTitle friendUid={weekInView.friendUid} />}
      sx={{ mr: narrow ? 0 : 2, mb: narrow ? 2 : 0, width: narrow ? '100%' : 'auto' }}
    >
      <FriendButton friend={null} onClick={() => handleSelectUser()} />
      {!!friends.length && <Divider />}
      {friends.map((friend) => (
        <FriendButton friend={friend} onClick={() => handleSelectUser(friend.uid)} key={friend.uid} />
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
    <Dropdown.Item itemAction={onClick}>
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

const DropdownTitle = observer(({ friendUid }: { friendUid?: string }) => {
  const { profileInfo } = container.resolve(ProfileHandler)
  const { friends } = container.resolve(FriendsHandler)
  const { narrow } = useContext(HomePageContext)

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

  if (!profile) profile = { ...profileInfo!, displayName: 'You' }

  return (
    <Flex align="center">
      <SmartEmoji nativeEmoji={profile.avatar} rem={1.2} />
      <Text
        type="span"
        sx={{
          ml: 3, maxWidth: narrow ? 'calc(100vw - 7rem)' : 'min(25vw, 250px)',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
        }}
      >
        {profile.displayName}
      </Text>
    </Flex >
  )
})

export default FriendsDropdown