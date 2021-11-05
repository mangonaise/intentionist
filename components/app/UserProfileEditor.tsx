import { container } from 'tsyringe'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { runInAction } from 'mobx'
import isEqual from 'lodash/isEqual'
import ProfileHandler, { UsernameAvailability, UserProfileInfo } from '@/logic/app/ProfileHandler'
import DbHandler from '@/logic/app/DbHandler'
import Button from '@/components/primitives/Button'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Spacer from '@/components/primitives/Spacer'
import Label from '@/components/primitives/Label'
import Input from '@/components/primitives/Input'
import Text from '@/components/primitives/Text'
import ModalPopup from './ModalPopup'
import EmojiButton from './EmojiButton'

interface Props {
  initialProfile: UserProfileInfo,
  isNewUser: boolean
}

const UserProfileEditor = ({ initialProfile, isNewUser }: Props) => {
  const router = useRouter()
  const [profileDraft, setProfileDraft] = useState(initialProfile)
  const [usernameAvailability, setUsernameAvailability] = useState('unknown' as UsernameAvailability)
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)

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
    setIsSubmittingProfile(true)
    try {
      await container.resolve(ProfileHandler).setUserProfileInfo(profileDraft)
      if (isNewUser) {
        router.push('/home')
      } else {
        setIsSubmittingProfile(false)
      }
    } catch {
      setUsernameAvailability('taken')
      setIsSubmittingProfile(false)
      runInAction(() => container.resolve(DbHandler).isWriteComplete = true)
    }
  }

  const showSubmitButton = !!profileDraft.username &&
    (usernameAvailability === 'available'
      || (!isNewUser && profileDraft.username === initialProfile.username))

  const disableSubmitButton = showSubmitButton &&
    (isSubmittingProfile
      || Object.values(profileDraft).some((value) => !value)
      || isEqual(profileDraft, initialProfile))

  return (
    <>
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
        {isNewUser && <>
          <UsernameInfo />
          <Spacer mb={4} />
        </>}
        {showSubmitButton
          ? (
            <Button
              onClick={handleSubmitUser}
              disabled={disableSubmitButton}
              hoverEffect="opacity"
              sx={{
                '&:disabled': {
                  opacity: isSubmittingProfile ? 0.7 : null,
                },
                '&:not(:disabled)': {
                  color: 'bg',
                  backgroundColor: 'text',
                  fontWeight: 'medium',
                }
              }}
            >
              {isSubmittingProfile
                ? (isNewUser ? 'Creating your profile...' : 'Saving changes...')
                : (isNewUser ? 'Start' : 'Save changes')}
            </Button>
          )
          : <UsernameAvailabilitySection
            username={profileDraft.username}
            availability={usernameAvailability}
            onCheckAvailability={handleCheckUsernameAvailability}
          />}
      </Flex>
    </>
  )
}

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
        onChange={(e) => onChangeDisplayName(e.target.value)}
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
          onChange={(e) => onChangeUsername(e.target.value.toLowerCase())}
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

export default UserProfileEditor