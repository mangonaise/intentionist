import { useContext } from 'react'
import { FriendsPageContext } from 'pages/friends'
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
        Requests
      </Button>
    </Flex>
  )
}

export default FriendsPageNavSection