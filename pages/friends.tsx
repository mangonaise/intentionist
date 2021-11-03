import withApp from '@/components/app/withApp'
import AddFriendButton from '@/components/page/friends/AddFriendButton'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import Spacer from '@/components/primitives/Spacer'
import BackIcon from '@/components/icons/BackIcon'
import Heading from '@/components/primitives/Heading'
import NextLink from 'next/link'
import Head from 'next/head'

const FriendsPage = () => {
  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
      <NavSection />
    </Box>
  )
}

const NavSection = () => {
  return (
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
  )
}

export default withApp(FriendsPage, 'neutral')