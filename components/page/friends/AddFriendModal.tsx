import { container } from 'tsyringe'
import { useEffect, useRef, useState } from 'react'
import FriendRequestsHandler, { UserSearchResult } from '@/logic/app/FriendRequestsHandler'
import UserSearchResultModal from '@/components/page/friends/UserSearchResultModal'
import ModalPopup from '@/components/app/ModalPopup'
import Heading from '@/components/primitives/Heading'
import Box from '@/components/primitives/Box'
import Label from '@/components/primitives/Label'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Input from '@/components/primitives/Input'
import IconButton from '@/components/primitives/IconButton'
import EllipsisIcon from '@/components/icons/EllipsisIcon'
import SearchIcon from '@/components/icons/SearchIcon'

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

  function handleInputKeyDown(key: string) {
    if (key === 'Enter') {
      handleSearch()
    }
  }

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
    <ModalPopup isOpen={isOpen} closeModal={closeModal} initialFocusRef={inputRef}>
      <UserSearchResultModal
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
              onKeyDown={(e) => handleInputKeyDown(e.key)}
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
          <Text sx={{ mb: 2 }}>Adding a friend allows you to set up shared habits.</Text>
          <Text>Be aware that your public habits are visible to friends.</Text>
        </Box>
      </Box>
    </ModalPopup>
  )
}

export default AddFriendModal