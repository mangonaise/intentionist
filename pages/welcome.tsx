import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { ChangeEvent, FormEvent, useState } from 'react'
import { LoadingScreen, withAuthUser } from '@/components/app'
import { FadeIn, Button, Flex, Form, Heading, IconButton, Input, Label, Text } from '@/components/primitives'
import { BackIcon } from '@/components/icons'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import AuthUser from '@/lib/logic/app/AuthUser'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import Head from 'next/head'
import useAutorun from '@/lib/hooks/useAutorun'

const NewUserPage = withAuthUser(observer(() => {
  const router = useRouter()
  const { initialFetches, hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [displayName, setDisplayName] = useState(container.resolve(AuthUser).displayName || '')

  useAutorun(() => {
    if (initialFetches?.userProfile) {
      router.push('/home')
    }
  })

  function handleSubmitUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    container.resolve(ProfileHandler).updateUserProfile({ displayName })
    router.push('/home')
  }

  if (initialFetches?.userProfile) return null
  if (!hasCompletedInitialFetches) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Welcome</title></Head>
      <IconButton icon={BackIcon} onClick={handleSignOut} />
      <Flex justify="center" column sx={{ width: ['100%', '25rem'], minHeight: '50vh', margin: 'auto', textAlign: 'center' }}>
        <Heading level={1} sx={{ mb: 3 }}>Hello! 👋</Heading>
        <Text sx={{ mb: 8 }}>Welcome to intentionist.</Text>
        <Form onSubmit={handleSubmitUser}>
          <Flex column sx={{ width: '100%', px: 4 }}>
            <Label htmlFor="name" sx={{ fontWeight: 'medium', mb: 2, opacity: 0.6, textAlign: 'left' }}>
              Your name
            </Label>
            <Input
              value={displayName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
              placeholder="Enter your name or a nickname"
              required
              type="text"
              id="name"
              sx={{ mb: 4 }}
            />
            <Button type="submit">Start</Button>
          </Flex>
        </Form>
      </Flex>
    </FadeIn>
  )
}))

export default NewUserPage