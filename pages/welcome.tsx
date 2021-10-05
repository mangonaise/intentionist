import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { FormEvent, useEffect, useState } from 'react'
import { LoadingScreen, withAuthUser } from '@/components/app'
import { FadeIn, Button, CenteredFlex, Flex, Heading, IconButton, Input, Label, Text } from '@/components/primitives'
import { BackIcon } from '@/components/icons'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import AuthUser from '@/lib/logic/app/AuthUser'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import Head from 'next/head'

const NewUserPage = withAuthUser(observer(() => {
  const router = useRouter()
  const { initialFetches, hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [displayName, setDisplayName] = useState(container.resolve(AuthUser).displayName || '')

  useEffect(() => {
    if (initialFetches.userProfile) {
      router.push('/home')
    } 
  }, [hasCompletedInitialFetches])

  function handleSubmitUser(e: FormEvent<HTMLDivElement>) {
    e.preventDefault()
    container.resolve(ProfileHandler).updateUserProfile({ displayName })
  }

  if (initialFetches.userProfile) return null
  if (!hasCompletedInitialFetches) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Welcome</title></Head>
      <IconButton icon={BackIcon} onClick={handleSignOut} />
      <CenteredFlex flexDirection="column" width={['100%', '25rem']} minHeight="50vh" margin="auto">
        <Heading as="h1" mb={3}>Hello! 👋</Heading>
        <Text mb={8} textAlign="center">Welcome to intentionist.</Text>
        <Flex as="form" flexDirection="column" width="100%" px={4} onSubmit={handleSubmitUser}>
          <Label htmlFor="name" fontWeight="medium" mb={2} opacity={0.6}>
            Your name
          </Label>
          <Input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Enter your name or a nickname"
            required
            type="text"
            id="name"
            mb={4}
          />
          <Button type="submit">Start</Button>
        </Flex>
      </CenteredFlex>
    </FadeIn>
  )
}))

export default NewUserPage