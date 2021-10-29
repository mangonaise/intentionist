import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { ChangeEvent, useState } from 'react'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import AuthUser from '@/lib/logic/app/AuthUser'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'
import ProfileHandler, { ProfileInfo } from '@/lib/logic/app/ProfileHandler'
import useAutorun from '@/lib/hooks/useAutorun'
import withAuthUser from '@/components/app/withAuthUser'
import LoadingScreen from '@/components/app/LoadingScreen'
import EmojiButton from '@/components/app/EmojiButton'
import FadeIn from '@/components/primitives/FadeIn'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Input from '@/components/primitives/Input'
import Label from '@/components/primitives/Label'
import Text from '@/components/primitives/Text'
import BackIcon from '@/components/icons/BackIcon'
import Head from 'next/head'

const NewUserPage = withAuthUser(observer(() => {
  const router = useRouter()
  const { initialFetches, hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    displayName: container.resolve(AuthUser).displayName || '',
    avatar: '🙂'
  })

  useAutorun(() => {
    if (initialFetches?.userProfile) {
      router.push('/home')
    }
  })

  function updateProfileInfo(updates: Partial<ProfileInfo>) {
    setProfileInfo({ ...profileInfo, ...updates })
  }

  function handleSubmitUser() {
    container.resolve(ProfileHandler).updateUserProfile(profileInfo)
    router.push('/home')
  }

  if (initialFetches?.userProfile) return null
  if (!hasCompletedInitialFetches) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Welcome</title></Head>
      <IconButton icon={BackIcon} onClick={handleSignOut} sx={{ bg: 'transparent' }} />
      <Flex justify="center" column sx={{ width: ['100%', '25rem'], minHeight: '50vh', margin: 'auto', textAlign: 'center' }}>
        <Heading level={1} sx={{ mb: 3 }}>Hello! 👋</Heading>
        <Text sx={{ mb: 8 }}>Welcome to intentionist.</Text>
        <Flex center column sx={{ mb: 8 }}>
          <EmojiButton
            label="as your avatar"
            value={profileInfo.avatar}
            onChangeEmoji={(emoji) => updateProfileInfo({ avatar: emoji })}
            buttonSize="5rem"
            emojiSizeRem={2.25}
            sx={{ borderRadius: '50%' }}
          />
          <Text type="span" sx={{ color: 'whiteAlpha.60', mt: 2 }}>Choose an avatar</Text>
        </Flex>
        <Flex column sx={{ width: '100%', px: 4 }}>
          <Label sx={{ mb: 4, textAlign: 'left', color: 'whiteAlpha.60' }}>
            Your name
            <Input
              value={profileInfo.displayName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateProfileInfo({ displayName: e.target.value })}
              placeholder="Enter your name or a nickname"
              required
              type="text"
              aria-label="Your name"
              sx={{ mt: 2 }}
            />
          </Label>
          <Button onClick={handleSubmitUser} disabled={!profileInfo.displayName || !profileInfo.avatar}>
            Start
          </Button>
        </Flex>
      </Flex>
    </FadeIn>
  )
}))

export default NewUserPage