import { useContext } from 'react'
import withAuthUser, { AuthUserContext } from '@/lib/withAuthUser'
import authHandler from '@/lib/auth'
import Head from 'next/head'
import Button from '@/components/primitives/Button'
import CenteredFlex from '@/components/primitives/CenteredFlex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'

const Home = withAuthUser(() => {
  const user = useContext(AuthUserContext)

  return (
    <CenteredFlex height="90vh" flexDirection="column">
      <Head><title>Home</title></Head>
      <Heading mb={6}>Home</Heading>
      <Text>This page is only visible to authenticated users.</Text>
      <Text mb={6}>You are signed in as <Text as="span" color="skyblue">{user.displayName}</Text>.</Text>
      <Button onClick={() => authHandler.handleSignOut()}>Sign out</Button>
    </CenteredFlex>
  )
})

export default Home