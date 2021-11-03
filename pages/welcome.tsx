import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { ChangeEvent, useState } from 'react'
import { handleSignOut } from '@/lib/logic/utils/authUtilities'
import AuthUser from '@/lib/logic/app/AuthUser'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'
import ProfileHandler, { UsernameAvailability, UserProfileInfo } from '@/lib/logic/app/ProfileHandler'
import useAutorun from '@/lib/hooks/useAutorun'
import withAuthUser from '@/components/app/withAuthUser'
import LoadingScreen from '@/components/app/LoadingScreen'
import EmojiButton from '@/components/app/EmojiButton'
import ModalPopup from '@/components/app/ModalPopup'
import FadeIn from '@/components/primitives/FadeIn'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Box from '@/components/primitives/Box'
import Heading from '@/components/primitives/Heading'
import IconButton from '@/components/primitives/IconButton'
import Input from '@/components/primitives/Input'
import Label from '@/components/primitives/Label'
import Text from '@/components/primitives/Text'
import Spacer from '@/components/primitives/Spacer'
import BackIcon from '@/components/icons/BackIcon'
import Head from 'next/head'

const NewUserPage = withAuthUser(observer(() => {
  const router = useRouter()
  const { initialFetches, hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [profileDraft, setProfileDraft] = useState<UserProfileInfo>({
    avatar: '🙂',
    displayName: container.resolve(AuthUser).displayName || '',
    username: ''
  })
  const [usernameAvailability, setUsernameAvailability] = useState('unknown' as UsernameAvailability)
  const [isSubmittingUser, setIsSubmittingUser] = useState(false)

  useAutorun(() => {
    if (initialFetches?.userProfile) {
      router.push('/home')
    }
  })

  function updateProfileDraft(updates: Partial<UserProfileInfo>) {
    setProfileDraft({ ...profileDraft, ...updates })
    if (updates.username !== undefined) setUsernameAvailability('unknown')
  }

  async function handleCheckUsernameAvailability() {
    setUsernameAvailability('checking')
    const isAvailable = await container.resolve(ProfileHandler).checkUsernameAvailability(profileDraft.username)
    setUsernameAvailability(isAvailable)
  }

  async function handleSubmitUser() {
    setIsSubmittingUser(true)
    try {
      await container.resolve(ProfileHandler).setUserProfileInfo(profileDraft)
      router.push('/home')
    } catch {
      setUsernameAvailability('taken')
      setIsSubmittingUser(false)
    }
  }

  if (initialFetches?.userProfile) return null
  if (!hasCompletedInitialFetches) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Welcome</title></Head>
      <IconButton icon={BackIcon} onClick={handleSignOut} sx={{ bg: 'transparent' }} />
      <Flex justify="center" column sx={{ width: ['100%', '25rem'], minHeight: ['80vh', '70vh'], margin: 'auto', textAlign: 'center' }}>
        <Heading level={1} sx={{ mb: 3 }}>Hello! 👋</Heading>
        <Text sx={{ mb: 8 }}>Welcome to intentionist.</Text>
        <AvatarPicker
          avatar={profileDraft.avatar}
          onChangeAvatar={(avatar) => updateProfileDraft({ avatar })}
        />
        <Spacer mb={8} />
        <Flex column sx={{ width: '100%', px: 2 }}>
          <DisplayNameInput
            displayName={profileDraft.displayName}
            onChangeDisplayName={(displayName) => updateProfileDraft({ displayName })}
          />
          <Spacer mb={4} />
          <UsernameInput
            username={profileDraft.username}
            onChangeUsername={(username) => updateProfileDraft({ username })}
          />
          <Spacer mb={4} />
          <UsernameInfo />
          <Spacer mb={4} />
          {!!profileDraft.username && usernameAvailability === 'available'
            ? (
              <Button
                onClick={handleSubmitUser}
                disabled={isSubmittingUser || Object.values(profileDraft).some((value) => !value)}
                hoverEffect="opacity"
                sx={{ color: 'bg', bg: 'text', fontWeight: 'medium', '&:disabled': { opacity: 0.5 } }}
              >
                {isSubmittingUser ? 'Creating your profile...' : 'Start'}
              </Button>
            )
            : <UsernameAvailabilitySection
              username={profileDraft.username}
              availability={usernameAvailability}
              onCheckAvailability={handleCheckUsernameAvailability}
            />}
        </Flex>
      </Flex>
    </FadeIn>
  )
}))

const AvatarPicker = ({ avatar, onChangeAvatar }: { avatar: string, onChangeAvatar: (emoji: string) => void }) => {
  return (
    <Flex center column>
      <EmojiButton
        label="as your avatar"
        value={avatar}
        onChangeEmoji={(emoji) => onChangeAvatar(emoji)}
        buttonSize="5rem"
        emojiSizeRem={2.25}
        sx={{ borderRadius: '50%' }}
      />
      <Text type="span" sx={{ color: 'whiteAlpha.60', mt: 2 }}>Choose an avatar</Text>
    </Flex>
  )
}

const DisplayNameInput = ({ displayName, onChangeDisplayName }: { displayName: string, onChangeDisplayName: (name: string) => void }) => {
  return (
    <Label sx={{ textAlign: 'left', color: 'whiteAlpha.60' }}>
      Display name
      <Input
        value={displayName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeDisplayName(e.target.value)}
        placeholder="Enter your name or a nickname"
        required
        type="text"
        aria-label="Display name"
        sx={{ mt: 2 }}
      />
    </Label>
  )
}

const UsernameInput = ({ username, onChangeUsername }: { username: string, onChangeUsername: (name: string) => void }) => {
  return (
    <Label sx={{ textAlign: 'left', color: 'whiteAlpha.60' }}>
      Username
      <Flex align="center" sx={{ mt: 2 }}>
        <Text type="span" sx={{ mr: 2 }}>@</Text>
        <Input
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeUsername(e.target.value.toLowerCase())}
          placeholder="Choose a unique username"
          required
          type="text"
          aria-label="Username"
        />
      </Flex>
    </Label>
  )
}

const UsernameInfo = () => {
  return (
    <Text sx={{ p: 3, textAlign: 'left', fontWeight: 'light', lineHeight: '1.3', bg: 'whiteAlpha.5', color: 'whiteAlpha.80', borderRadius: 'default' }}>
      Others can search for you by your @username, but nobody can see your activity unless you add them as a friend.
    </Text>
  )
}

interface UsernameAvailabilitySectionProps {
  username: string,
  availability: UsernameAvailability,
  onCheckAvailability: () => void
}

const UsernameAvailabilitySection = ({ username, availability, onCheckAvailability }: UsernameAvailabilitySectionProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false)

  const textMap = {
    unknown: 'Check username availability',
    checking: 'Checking...',
    invalid: 'Username is invalid',
    taken: 'Username is already taken'
  } as { [availability in UsernameAvailability]: string }

  const displayWarningColor = ['invalid', 'taken'].includes(availability)

  return (
    <Flex center sx={{ height: '2.5rem' }}>
      {availability === 'unknown' ? (
        <Button
          onClick={onCheckAvailability}
          disabled={!username || [false, 'invalid'].includes(availability)}
          sx={{
            flex: 1,
            '&:disabled': { opacity: displayWarningColor ? 1 : undefined }
          }}
        >
          {textMap.unknown}
        </Button>)
        : (
          <Text
            sx={{
              display: 'grid',
              placeItems: 'center',
              flex: 1,
              height: '100%',
              backgroundColor: 'whiteAlpha.5',
              borderRadius: 'default',
              color: displayWarningColor ? 'warning' : 'text',
              fontWeight: displayWarningColor ? 'medium' : 'normal',
              textAlign: 'center'
            }}
          >
            {textMap[availability]}
          </Text>
        )}
      {availability === 'invalid' && (
        <Button onClick={() => setShowInfoModal(true)} sx={{ ml: 2 }}>
          Why?
        </Button>
      )}
      <UsernameLimitationsModal isOpen={showInfoModal} closeModal={() => setShowInfoModal(false)} />
    </Flex>
  )
}

const UsernameLimitationsModal = ({ isOpen, closeModal }: { isOpen: boolean, closeModal: () => void }) => {
  return (
    <ModalPopup isOpen={isOpen} closeModal={closeModal}>
      <Flex center column sx={{ px: 4, pb: 4 }}>
        <Heading sx={{ my: 6 }}>Invalid username</Heading>
        <Box sx={{
          maxWidth: '350px',
          bg: 'whiteAlpha.5',
          borderRadius: 'default',
          p: 4, mb: 4,
          fontWeight: 'light',
          lineHeight: 1.5
        }}>

          <Text>Your username can contain 3 to 30 <b>letters</b> (a-z), <b>numbers</b>, and <b>single underscores</b> (_).</Text>
          <Text sx={{ mt: 2 }}>It cannot begin or end with an underscore.</Text>
        </Box>
        <Button onClick={closeModal} sx={{ width: '100%' }}>
          OK
        </Button>
      </Flex>
    </ModalPopup>
  )
}

export default NewUserPage