import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { FriendsPageContext, FriendsPageTab } from 'pages/friends'
import SlidingTabPicker from '@/components/modular/SlidingTabPicker'
import FriendRequestsHandler from '@/logic/app/FriendRequestsHandler'
import AddFriendButton from '@/components/page/friends/AddFriendButton'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'
import BackIcon from '@/components/icons/BackIcon'
import Head from 'next/head'
import NextLink from 'next/link'

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

  return (
    <SlidingTabPicker
      data={[
        { text: 'Friends', icon: null, color: 'text', onClick: () => setTab('friends') },
        { text: <RequestsTabText />, icon: null, color: 'text', onClick: () => setTab('requests') }
      ]}
      activeIndex={tab === 'friends' ? 0 : 1}
    />
  )
}

const RequestsTabText = observer(() => {
  const { incomingRequests } = container.resolve(FriendRequestsHandler)
  const requestsCount = incomingRequests.length
  return (
    <Text type="span" sx={{ fontFeatureSettings: '"calt" 0' }}>
      Requests{!!requestsCount && ` (${requestsCount})`}
    </Text>
  )
})

export default FriendsPageNavSection