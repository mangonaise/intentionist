import withApp from '@/lib/withApp'
import profileHandler from '@/lib/app/profileHandler'
import authHandler from '@/lib/auth'
import Head from 'next/head'
import Button from '@/components/primitives/Button'
import CenteredFlex from '@/components/primitives/CenteredFlex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'
import PageWrapper from '@/components/PageWrapper'

const Home = withApp(() => {
  return (
    <PageWrapper>
      <CenteredFlex height="90vh" flexDirection="column">
        <Head><title>Home</title></Head>
        <Heading mb={6}>Home</Heading>
        <Text>This page is only visible to users with a profile in the database.</Text>
        <Text>If there is no profile, you will be redirected to the /welcome page.</Text>
        <Text mb={6}>Your display name: {profileHandler().profileInfo?.displayName}</Text>
        <Button onClick={authHandler.handleSignOut}>Sign out</Button>
      </CenteredFlex>
    </PageWrapper>
  )
})

export default Home