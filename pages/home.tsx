import Button from '@/components/primitives/Button'
import CenteredFlex from '@/components/primitives/CenteredFlex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'
import authHandler from '@/lib/auth'
import withAuth from '@/lib/withAuth'

const Home = withAuth(({ user }) => {
  return (
    <CenteredFlex height="90vh" flexDirection="column">
      <Heading mb={6}>Home</Heading>
      <Text>This page is only visible to authenticated users.</Text>
      <Text mb={6}>You are signed in as <Text as="span" color="skyblue">{user.displayName}</Text>.</Text>
      <Button onClick={() => authHandler.handleSignOut()}>Sign out</Button>
    </CenteredFlex>
  )
})

export default Home