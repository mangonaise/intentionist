import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { isEqual } from 'lodash'
import ProfileHandler, { UserProfileInfo } from '@/lib/logic/app/ProfileHandler'
import EmojiButton from '@/components/app/EmojiButton'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Label from '@/components/primitives/Label'
import Input from '@/components/primitives/Input'
import Button from '@/components/primitives/Button'
import Box from '@/components/primitives/Box'

const ProfileSettings = observer(() => {
  const { profileInfo, setUserProfileInfo } = container.resolve(ProfileHandler)
  const [draftProfileInfo, setDraftProfileInfo] = useState<UserProfileInfo>(profileInfo!)

  function updateDraft(updates: Partial<UserProfileInfo>) {
    setDraftProfileInfo({ ...draftProfileInfo, ...updates })
  }

  function saveChanges() {
    setUserProfileInfo(draftProfileInfo)
  }

  return (
    <Flex column>
      <Flex column align="center" sx={{ alignSelf: 'center', mb: 2 }}>
        <EmojiButton
          label="as your avatar"
          value={draftProfileInfo.avatar ?? '🙂'}
          onChangeEmoji={(emoji) => updateDraft({ avatar: emoji })}
          buttonSize="5rem"
          emojiSizeRem={2.25}
          sx={{ borderRadius: '50%' }}
        />
        <Text type="span" sx={{ color: 'whiteAlpha.60', mt: 2 }}>Your avatar</Text>
      </Flex>
      <Label sx={{ textAlign: 'left', color: 'whiteAlpha.60' }}>
        Your name
        <Input
          value={draftProfileInfo.displayName}
          onChange={(e) => updateDraft({ displayName: e.target.value })}
          placeholder="Enter your name or a nickname"
          required
          type="text"
          aria-label="Your name"
          sx={{ mt: 2, width: '100%' }}
        />
      </Label>
      <Box sx={{ borderBottom: 'solid 1px', borderColor: 'divider', my: 4 }} />
      <Button
        onClick={saveChanges}
        disabled={!draftProfileInfo?.displayName || isEqual(draftProfileInfo, profileInfo)}
        hoverEffect="opacity"
        sx={{ bg: 'text', color: 'bg' }}
      >
        Save changes
      </Button>
    </Flex>
  )
})

export default ProfileSettings