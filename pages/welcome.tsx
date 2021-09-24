import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/dist/client/router'
import { FormEvent, useEffect, useState } from 'react'
import Head from 'next/head'
import authHandler from '@/logic/app/authHandler'
import profileHandler from '@/logic/app/profileHandler'
import withAuthUser from '@/components/app/withAuthUser'
import LoadingScreen from '@/components/app/LoadingScreen'
import BackIcon from '@/components/icons/BackIcon'
import FadeIn from '@/components/primitives/FadeIn'
import Button from '@/components/primitives/Button'
import CenteredFlex from '@/components/primitives/CenteredFlex'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Input from '@/components/primitives/Input'
import Label from '@/components/primitives/Label'
import Text from '@/components/primitives/Text'

const NewUserPage = withAuthUser(observer(({ authUser }) => {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(authUser.displayName || '')
  const { profileInfo, fetchUserProfile } = profileHandler()

  useEffect(() => {
    if (profileInfo === undefined) {
      fetchUserProfile()
    } else if (profileInfo) {
      router.push('/home')
    } 
  }, [profileInfo])

  function handleSubmitUser(e: FormEvent<HTMLDivElement>) {
    e.preventDefault()
    profileHandler().updateUserProfile({ displayName })
  }

  if (profileInfo) return null
  if (profileInfo === undefined) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Welcome</title></Head>
      <IconButton icon={BackIcon} onClick={authHandler.handleSignOut} />
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