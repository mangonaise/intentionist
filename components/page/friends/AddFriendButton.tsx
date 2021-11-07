import { container } from 'tsyringe'
import { useEffect, useRef, useState } from 'react'
import { AvatarAndDisplayName } from '@/logic/app/ProfileHandler'
import FriendRequestsHandler, { UserSearchResult } from '@/logic/app/FriendRequestsHandler'
import ModalPopup from '@/components/app/ModalPopup'
import AddFriendIcon from '@/components/icons/AddFriendIcon'
import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Button from '@/components/primitives/Button'
import IconButton from '@/components/primitives/IconButton'
import Input from '@/components/primitives/Input'
import Label from '@/components/primitives/Label'
import Text from '@/components/primitives/Text'
import SearchIcon from '@/components/icons/SearchIcon'
import EllipsisIcon from '@/components/icons/EllipsisIcon'

const AddFriendButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <AddFriendModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
      <IconButton
        icon={AddFriendIcon}
        onClick={() => setIsModalOpen(true)}
        hoverEffect="opacity"
        sx={{
          backgroundColor: 'text',
          color: 'bg',
          fontWeight: 'medium'
        }}
      >
        Add friend
      </IconButton>
    </>
  )
}

const AddFriendModal = ({ isOpen, closeModal }: { isOpen: boolean, closeModal: () => void }) => {
  const { searchForUser, sendFriendRequest } = container.resolve(FriendRequestsHandler)
  const [username, setUsername] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<UserSearchResult | undefined>()
  const [showSearchResult, setShowSearchResult] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (isOpen) {
      setUsername('')
      setIsSearching(false)
      setShowSearchResult(false)
    }
  }, [isOpen])

  async function handleSearch() {
    setIsSearching(true)
    const result = await searchForUser(username[0] === '@' ? username.slice(1) : username)
    setSearchResult(result)
    setShowSearchResult(true)
    setIsSearching(false)
  }

  function handleCloseSearchResult() {
    setShowSearchResult(false)
    inputRef.current?.focus()
  }

  function handleSendFriendRequest() {
    sendFriendRequest(username)
    setShowSearchResult(false)
    closeModal()
  }

  return (
    <ModalPopup isOpen={isOpen} closeModal={closeModal}>
      <SearchResultModal
        isOpen={showSearchResult}
        searchResult={searchResult}
        closeModal={handleCloseSearchResult}
        onSendFriendRequest={handleSendFriendRequest}
      />
      <Heading level={2} sx={{ my: 6, textAlign: 'center' }}>Add friend</Heading>
      <Box sx={{ maxWidth: '435px', pb: 5, px: 4 }}>
        <Label sx={{ fontWeight: 'medium' }}>
          Search via username
          <Flex align="center" sx={{ mt: 3 }}>
            <Text type="span" sx={{ mr: 2, color: 'whiteAlpha.60' }}>@</Text>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              ref={inputRef}
            />
            <IconButton
              icon={isSearching ? EllipsisIcon : SearchIcon}
              onClick={handleSearch}
              hoverEffect="opacity"
              disabled={isSearching || !username}
              sx={{ ml: 2 }}
            />
          </Flex>
        </Label>
        <Box sx={{ p: 4, mt: 4, borderRadius: 'default', bg: 'whiteAlpha.5', fontWeight: 'light' }}>
          <Text>When you add a friend, they'll be able to see your activity, including your tracked habits and public journal entries.</Text>
        </Box>
      </Box>
    </ModalPopup>
  )
}

interface SearchResultModalProps {
  isOpen: boolean,
  closeModal: () => void,
  searchResult?: UserSearchResult,
  onSendFriendRequest: () => void
}

const SearchResultModal = ({ isOpen, closeModal, searchResult, onSendFriendRequest }: SearchResultModalProps) => {
  if (!searchResult) return null

  let content: { title: string, body: string }
  let userData = null as AvatarAndDisplayName | null
  if (typeof searchResult === 'string') {
    const contentMap = {
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
      }
    }
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
        <Flex sx={{ flexWrap: ['wrap', 'nowrap'], width: '100%', mb: 4, px: 4 }}>
          <Button onClick={closeModal} sx={{ flex: 1, mr: [0, 3], mb: [3, 0], minWidth: ['100%', 'auto'] }}>
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

export default AddFriendButton