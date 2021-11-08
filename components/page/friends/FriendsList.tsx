import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import FriendsHandler from '@/logic/app/FriendsHandler'
import EmptyFriendsViewText from '@/components/page/friends/EmptyFriendsViewText'
import SmartEmoji from '@/components/app/SmartEmoji'
import Dropdown from '@/components/app/Dropdown'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'

const FriendsList = observer(() => {
  const { friends } = container.resolve(FriendsHandler)

  if (friends.length === 0) {
    return <EmptyFriendsViewText text="You haven't added any friends yet." />
  }

  return (
    <FadeIn>
      {friends.map((friend) => (
        <Flex sx={{ mb: 2 }} key={friend.username}>
          <Flex align="center" flexWrap sx={{ maxWidth: 'calc(100vw - 4rem)' }}>
            <SmartEmoji nativeEmoji={friend.avatar} rem={1.8} />
            <Text type="span" sx={{ mx: 2 }}>{friend.displayName}</Text>
            <Text
              type="span"
              sx={{ py: 1, color: 'whiteAlpha.60', fontWeight: 'light' }}>
              @{friend.username}
            </Text>
          </Flex>
          <Spacer ml="auto" />
          <OptionsDropdown />
        </Flex>
      ))}
    </FadeIn>
  )
})

const OptionsDropdown = () => {
  return (
    <Dropdown anchorRight sx={{ '& button': { bg: 'transparent' } }}>
      <Dropdown.Item>Remove friend</Dropdown.Item>
    </Dropdown>
  )
}

export default FriendsList