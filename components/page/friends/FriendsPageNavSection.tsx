import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { FriendsPageContext } from 'pages/friends'
import FriendRequestsHandler from '@/logic/app/FriendRequestsHandler'
import AddFriendButton from '@/components/page/friends/AddFriendButton'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Button from '@/components/primitives/Button'
import IconButton from '@/components/primitives/IconButton'
import Spacer from '@/components/primitives/Spacer'
import BackIcon from '@/components/icons/BackIcon'
import Head from 'next/head'
import NextLink from 'next/link'
import Text from '@/components/primitives/Text'

const FriendsPageNavSection = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Flex align="center" sx={{ mb: 3 }}>
        <Head><title>Friends</title></Head>
        <NextLink href="/home">
          <IconButton icon={BackIcon} sx={{ bg: 'transparent' }} />
        </NextLink>
        <Spacer ml={2} />
        <Heading level={2} sx={{ fontSize: ['1.2rem', '1.5rem'] }}>Friends</Heading>
        <Spacer ml="auto" />
        <AddFriendButton />
      </Flex>
      <Tabs />
    </Box>
  )
}

const Tabs = () => {
  const { tab, setTab } = useContext(FriendsPageContext)

  // TODO: style similar to week view mode picker
  return (
    <Flex sx={{ '& button': { flex: 1, background: 'none', borderRadius: 0, borderBottom: 'solid 2px', borderBottomColor: 'transparent' } }}>
      <Button
        onClick={() => setTab('friends')}
        hoverEffect="none"
        sx={{ borderBottomColor: tab === 'friends' ? 'white !important' : null }}
      >
        Friends
      </Button>
      <Button
        onClick={() => setTab('requests')}
        hoverEffect="none"
        sx={{ borderBottomColor: tab === 'requests' ? 'white !important' : null }}
      >
        <RequestsTabText />
      </Button>
    </Flex>
  )
}

const RequestsTabText = observer(() => {
  const { incomingRequests } = container.resolve(FriendRequestsHandler)
  const requestsCount = incomingRequests.length
  return (
    <Text type="span" sx={{ fontFeatureSettings: '"calt" 0'}}>
      Requests{!!requestsCount && ` (${requestsCount})`}
    </Text>
  )
})

export default FriendsPageNavSection