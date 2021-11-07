import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, useEffect } from 'react'
import { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import FriendRequestsHandler, { FriendRequestsViewMode } from '@/logic/app/FriendRequestsHandler'
import Dropdown from '@/components/app/Dropdown'
import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import FadeIn from '@/components/primitives/FadeIn'
import Icon from '@/components/primitives/Icon'
import Button from '@/components/primitives/Button'
import IconButton from '@/components/primitives/IconButton'
import CheckIcon from '@/components/icons/CheckIcon'
import CrossIcon from '@/components/icons/CrossIcon'
import EllipsisIcon from '@/components/icons/EllipsisIcon'

const FriendRequestsView = observer(() => {
  const { viewMode, setViewMode, setUserDataFetchingEnabled } = container.resolve(FriendRequestsHandler)

  useEffect(() => {
    setUserDataFetchingEnabled(true)
    return () => setUserDataFetchingEnabled(false)
  }, [])

  return (
    <FadeIn>
      <Dropdown
        title={{ incoming: 'Incoming requests', outgoing: 'Sent requests' }[viewMode]}
        sx={{ width: ['100%', 'fit-content'], mb: 3 }}
      >
        <Dropdown.Item itemAction={() => setViewMode('incoming')}>Incoming requests</Dropdown.Item>
        <Dropdown.Item itemAction={() => setViewMode('outgoing')}>Sent requests</Dropdown.Item>
      </Dropdown>
      {viewMode === 'incoming' ? <IncomingRequestsList /> : <OutgoingRequestsList />}
    </FadeIn>
  )
})

const IncomingRequestsList = observer(() => {
  const { requestsData: { incomingUsernames }, cachedUserData } = container.resolve(FriendRequestsHandler)

  if (incomingUsernames.length === 0) {
    return <NoRequestsText viewMode="incoming" />
  }

  return (
    <Box>
      {incomingUsernames.map((username) => (
        <FriendRequestLayout username={username} cachedUserData={cachedUserData[username]} key={username}>
          <IconButton
            icon={CheckIcon}
            hoverEffect="opacity"
            sx={{ flex: 1, bg: 'text', color: 'bg', fontWeight: 'medium' }}
          >
            Accept
          </IconButton>
          <IconButton icon={CrossIcon} sx={{ ml: 2 }} />
        </FriendRequestLayout>
      ))}
    </Box>
  )
})

const OutgoingRequestsList = observer(() => {
  const { requestsData: { outgoingUsernames }, cachedUserData } = container.resolve(FriendRequestsHandler)

  if (outgoingUsernames.length === 0) {
    return <NoRequestsText viewMode="outgoing" />
  }

  return (
    <Box>
      {outgoingUsernames.map((username) => (
        <FriendRequestLayout username={username} cachedUserData={cachedUserData[username]} key={username}>
          <Button sx={{ flex: 1 }}>
            Cancel request
          </Button>
        </FriendRequestLayout>
      ))}
    </Box>
  )
})

const FriendRequestLayout: FC<{ username: string, cachedUserData: AvatarAndDisplayName | undefined }> = ({ username, cachedUserData, children }) => {
  return (
    <Flex
      align="center"
      flexWrap
      sx={{ mb: [4, 3] }}
    >
      {cachedUserData
        ? <>
          <Flex align="center" flexWrap sx={{ mb: [3, 0] }}>
            <SmartEmoji nativeEmoji={cachedUserData.avatar} rem={1.8} />
            <Text type="span" sx={{ mx: 2 }}>{cachedUserData.displayName}</Text>
            <Text
              type="span"
              sx={{ py: 1, color: 'whiteAlpha.60', fontWeight: 'light' }}>
              @{username}
            </Text>
          </Flex>
          <Flex sx={{ ml: [0, 'auto'], width: ['100%', 'auto'] }}>
            {children}
          </Flex>
        </>
        : <LoadingRequest />
      }
    </Flex>
  )
}

const LoadingRequest = () => {
  return (
    <Flex center sx={{ minHeight: '2.5rem', width: '100%' }}>
      <Icon icon={EllipsisIcon} sx={{ fontSize: '1.5rem', animation: 'pulse infinite 2s' }} />
    </Flex>
  )
}

const NoRequestsText = ({ viewMode }: { viewMode: FriendRequestsViewMode }) => {
  const content = viewMode === 'incoming'
    ? `You don't have any incoming friend requests.`
    : `You don't have any outgoing friend requests.`

  return (
    <Flex center sx={{ height: '4rem' }}>
      <Text sx={{ fontSize: '1.2rem', textAlign: 'center', color: 'whiteAlpha.60' }}>
        {content}
      </Text>
    </Flex>
  )
}

export default FriendRequestsView