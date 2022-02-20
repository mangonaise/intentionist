import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import { UserProfileInfo } from '@/logic/app/ProfileHandler'
import AuthUser from '@/logic/app/AuthUser'
import AuthHandler from '@/logic/app/AuthHandler'
import InitialFetchHandler from '@/logic/app/InitialFetchHandler'
import useAutorun from '@/hooks/useAutorun'
import withAuthUser from '@/components/modular/withAuthUser'
import SmartEmoji from '@/components/modular/SmartEmoji'
import UserProfileEditor from '@/components/modular/UserProfileEditor'
import LoadingScreen from '@/components/modular/LoadingScreen'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Text from '@/components/primitives/Text'
import BackIcon from '@/components/icons/BackIcon'
import Head from 'next/head'

const NewUserPage = withAuthUser(observer(() => {
  const router = useRouter()
  const { handleSignOut } = container.resolve(AuthHandler)
  const { initialFetches, hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [initialProfile] = useState<UserProfileInfo>({
    avatar: '🙂',
    displayName: container.resolve(AuthUser).displayName || '',
    username: ''
  })

  useAutorun(() => {
    if (initialFetches?.userProfile) {
      router.push('/home')
    }
  })

  if (initialFetches?.userProfile) return null
  if (!hasCompletedInitialFetches) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Welcome</title></Head>
      <IconButton icon={BackIcon} onClick={handleSignOut} sx={{ bg: 'transparent' }} />
      <Flex justify="center" column sx={{ width: ['100%', '25rem'], minHeight: ['80vh', '70vh'], margin: 'auto', textAlign: 'center' }}>
        <Heading level={1} sx={{ mb: 3, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
          Hello!
          <Text type="span" sx={{ mr: 3 }} />
          <SmartEmoji nativeEmoji="👋" rem={1.5} />
        </Heading>
        <Text sx={{ mb: 8 }}>Welcome to intentionist.</Text>
        <UserProfileEditor
          isNewUser={true}
          initialProfile={initialProfile}
        />
      </Flex>
    </FadeIn>
  )
}))

export default NewUserPage