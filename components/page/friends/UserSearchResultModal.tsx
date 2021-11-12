import { UserSearchResult } from '@/logic/app/FriendRequestsHandler'
import { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import ModalPopup from '@/components/app/ModalPopup'
import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'

interface Props {
  isOpen: boolean,
  closeModal: () => void,
  searchResult?: UserSearchResult,
  onSendFriendRequest: () => void
}

const contentMap: { [result in Exclude<UserSearchResult, AvatarAndDisplayName>]: { title: string, body: string } } = {
  'invalid': {
    title: 'Invalid username',
    body: 'The username you entered is not a valid username.'
  },
  'not found': {
    title: 'User not found',
    body: 'The user you searched for could not be found.'
  },
  'self': {
    title: 'Nice try',
    body: `You're curious. But you can't add yourself as a friend.`
  },
  'already friends': {
    title: 'Oops',
    body: `You're already friends with that user.`
  },
  'already outgoing': {
    title: 'Oops',
    body: `You've already sent a friend request to that user.`
  },
  'already incoming': {
    title: 'Oops',
    body: `You've already received a friend request from that user.`
  },
  'max friends': {
    title: 'Maximum friends',
    body: `You can't send out any more friend requests because you've reached the maximum friends limit.`
  }
}

const UserSearchResultModal = ({ isOpen, closeModal, searchResult, onSendFriendRequest }: Props) => {
  if (!searchResult) return null

  let content: { title: string, body: string }
  let userData = null as AvatarAndDisplayName | null
  if (typeof searchResult === 'string') {
    content = contentMap[searchResult]
  } else {
    content = {
      title: 'User found',
      body: 'Would you like to send a friend request to this user?'
    }
    userData = searchResult
  }

  return (
    <ModalPopup isOpen={isOpen} closeModal={closeModal}>
      <Heading level={2} sx={{ my: 6, px: 4, textAlign: 'center' }}>{content.title}</Heading>
      <Box sx={{
        p: 4, m: 4, maxWidth: '420px',
        bg: 'whiteAlpha.5', borderRadius: 'default',
        fontWeight: 'light', textAlign: 'center'
      }}>
        {content.body}
        {userData && (
          <Flex center sx={{ mt: 4 }}>
            <SmartEmoji nativeEmoji={userData.avatar} rem={1.75} />
            <Text type="span" sx={{ ml: 3, fontWeight: 'medium' }}>{userData.displayName}</Text>
          </Flex>
        )}
      </Box>
      {userData && (
        <Flex sx={{ flexWrap: ['wrap', 'nowrap'], flexDirection: ['column-reverse', 'row'], width: '100%', mb: 4, px: 4 }}>
          <Button onClick={closeModal} sx={{ flex: 1, mr: [0, 3], mt: [3, 0], minWidth: ['100%', 'auto'] }}>
            Cancel
          </Button>
          <Button
            onClick={onSendFriendRequest}
            hoverEffect="opacity"
            sx={{ flex: 1, minWidth: ['100%', 'auto'], color: 'bg', backgroundColor: 'text', fontWeight: 'medium' }}
          >
            Send request
          </Button>
        </Flex>
      )}
    </ModalPopup>
  )
}

export default UserSearchResultModal