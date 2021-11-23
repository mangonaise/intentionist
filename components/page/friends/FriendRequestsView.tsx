import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, useState } from 'react'
import FriendRequestsHandler, { FriendRequest } from '@/logic/app/FriendRequestsHandler'
import EmptyFriendsViewText from '@/components/page/friends/EmptyFriendsViewText'
import FriendsLoadingIndicator from '@/components/page/friends/FriendsLoadingIndicator'
import Dropdown from '@/components/app/Dropdown'
import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import FadeIn from '@/components/primitives/FadeIn'
import Button from '@/components/primitives/Button'
import IconButton from '@/components/primitives/IconButton'
import CheckIcon from '@/components/icons/CheckIcon'
import CrossIcon from '@/components/icons/CrossIcon'
import EllipsisIcon from '@/components/icons/EllipsisIcon'

const FriendRequestsView = observer(() => {
  const { viewMode, setViewMode, hasLoadedRequests } = container.resolve(FriendRequestsHandler)

  return (
    <FadeIn>
      <Dropdown
        title={{ incoming: 'Incoming requests', outgoing: 'Sent requests' }[viewMode]}
        sx={{ width: ['100%', 'fit-content'], mb: 3 }}
      >
        <Dropdown.Item itemAction={() => setViewMode('incoming')}>Incoming requests</Dropdown.Item>
        <Dropdown.Item itemAction={() => setViewMode('outgoing')}>Sent requests</Dropdown.Item>
      </Dropdown>
      {hasLoadedRequests
        ? (viewMode === 'incoming' ? <IncomingRequestsList /> : <OutgoingRequestsList />)
        : <FriendsLoadingIndicator />}
    </FadeIn>
  )
})

const IncomingRequestsList = observer(() => {
  const { incomingRequests } = container.resolve(FriendRequestsHandler)

  if (incomingRequests.length === 0) {
    return <EmptyFriendsViewText text="You don't have any incoming friend requests." />
  }

  return (
    <Box>
      {incomingRequests.map((request) => (
        <IncomingRequest request={request} key={request.username} />
      ))}
    </Box>
  )
})

const OutgoingRequestsList = observer(() => {
  const { outgoingRequests } = container.resolve(FriendRequestsHandler)

  if (outgoingRequests.length === 0) {
    return <EmptyFriendsViewText text="You don't have any outgoing friend requests." />
  }

  return (
    <Box>
      {outgoingRequests.map((request) => (
        <OutgoingRequest request={request} key={request.username} />
      ))}
    </Box>
  )
})

const FriendRequestLayout: FC<{ request: FriendRequest }> = ({ request, children }) => {
  return (
    <Flex
      align="center"
      flexWrap
      sx={{ mb: [4, 3] }}
    >
      <Flex align="center" flexWrap sx={{ mb: [3, 0] }}>
        <SmartEmoji nativeEmoji={request.avatar} rem={1.8} />
        <Text type="span" sx={{ mx: 2 }}>{request.displayName}</Text>
        <Text
          type="span"
          sx={{ py: 1, color: 'whiteAlpha.60', fontWeight: 'light' }}>
          @{request.username}
        </Text>
      </Flex>
      <Flex sx={{ ml: [0, 'auto'], width: ['100%', 'auto'] }}>
        {children}
      </Flex>
    </Flex>
  )
}

const IncomingRequest = ({ request }: { request: FriendRequest }) => {
  const { declineFriendRequest, acceptFriendRequest } = container.resolve(FriendRequestsHandler)
  const [isDeclining, setIsDeclining] = useState(false)

  function handleAcceptRequest() {
    // ui handled in pending request modal
    acceptFriendRequest(request)
  }

  async function handleDeclineRequest() {
    setIsDeclining(true)
    await declineFriendRequest(request)
  }

  return (
    <FriendRequestLayout request={request}>
      <IconButton
        onClick={handleAcceptRequest}
        disabled={isDeclining}
        icon={CheckIcon}
        hoverEffect="opacity"
        sx={{ flex: 1, bg: 'accent', fontWeight: 'medium' }}
      >
        Accept
      </IconButton>
      <IconButton
        onClick={handleDeclineRequest}
        disabled={isDeclining}
        icon={isDeclining ? EllipsisIcon : CrossIcon}
        sx={{ ml: 2 }}
      />
    </FriendRequestLayout>
  )
}

const OutgoingRequest = ({ request }: { request: FriendRequest }) => {
  const { cancelOutgoingFriendRequest } = container.resolve(FriendRequestsHandler)
  const [isCanceling, setIsCanceling] = useState(false)

  async function handleCancelRequest() {
    setIsCanceling(true)
    await cancelOutgoingFriendRequest(request)
  }

  return (
    <FriendRequestLayout request={request}>
      <Button
        onClick={handleCancelRequest}
        disabled={isCanceling}
        sx={{ flex: 1, bg: isCanceling ? 'transparent' : null }}
      >
        {isCanceling ? 'Canceling...' : 'Cancel request'}
      </Button>
    </FriendRequestLayout>
  )
}

export default FriendRequestsView