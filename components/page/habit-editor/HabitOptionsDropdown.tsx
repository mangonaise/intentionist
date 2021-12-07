import { useContext, useState } from 'react'
import { HabitEditorContext } from 'pages/habit'
import Dropdown from '@/components/app/Dropdown'
import ModalPopup from '@/components/app/ModalPopup'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'

const HabitOptionsDropdown = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)

  return (
    <>
      <Dropdown anchorRight sx={{ ml: '5px', '& > button': { bg: 'transparent' } }}>
        <Dropdown.Item itemAction={() => setShowArchiveModal(true)}>Archive</Dropdown.Item>
        <Dropdown.Item itemAction={() => setShowDeleteModal(true)}>Delete</Dropdown.Item>
      </Dropdown>
      <DeleteConfirmationModal isOpen={showDeleteModal} closeModal={() => setShowDeleteModal(false)} />
      <ArchiveModal isOpen={showArchiveModal} closeModal={() => setShowArchiveModal(false)} />
    </>
  )
}

const ArchiveModal = ({ isOpen, closeModal }: { isOpen: boolean, closeModal: () => void }) => {
  const [isArchiving, setIsArchiving] = useState(false)
  const editor = useContext(HabitEditorContext)

  function handleArchiveHabit() {
    setIsArchiving(true)
    editor.archiveHabit()
  }

  return (
    <ModalPopup isOpen={isOpen} closeModal={closeModal} disableClose={isArchiving}>
      <Flex center column>
        <Heading sx={{ my: 6 }}>Archive habit</Heading>
        <Box sx={{ px: 4, pb: 4 }}>
          <Box sx={{
            maxWidth: '395px',
            bg: 'whiteAlpha.5',
            borderRadius: 'default',
            p: 4, mb: 4,
            fontWeight: 'light',
            lineHeight: 1.5
          }}>
            <Text sx={{ mb: 4 }}>Archiving this habit will hide it from your page.</Text>
            <Text>You can restore it at any time with the <b sx={{ color: 'textAccent' }}>View archived habits</b> option in the top right corner of the home page.</Text>
          </Box>
          <Flex sx={{ flexWrap: ['wrap', 'nowrap'], flexDirection: ['column-reverse', 'row'], width: '100%' }}>
            <Button onClick={closeModal} sx={{ flex: 1, mr: [0, 3], mt: [3, 0], minWidth: ['100%', 'auto'] }}>
              Cancel
            </Button>
            <Button
              onClick={handleArchiveHabit}
              hoverEffect="opacity"
              disabled={isArchiving}
              sx={{ flex: 1, minWidth: ['100%', 'auto'], bg: 'buttonAccent' }}
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </ModalPopup>
  )
}

const DeleteConfirmationModal = ({ isOpen, closeModal }: { isOpen: boolean, closeModal: () => void }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const editor = useContext(HabitEditorContext)

  function handleDeleteHabit() {
    setIsDeleting(true)
    editor.deleteHabit()
  }

  return (
    <ModalPopup isOpen={isOpen} closeModal={closeModal} disableClose={isDeleting}>
      <Flex center column>
        <Heading sx={{ my: 6 }}>Hold up!</Heading>
        <Box sx={{ px: 4, pb: 4 }}>
          <Box sx={{
            maxWidth: '402px',
            bg: 'whiteAlpha.5',
            borderRadius: 'default',
            p: 4, mb: 4,
            fontWeight: 'light',
            lineHeight: 1.5
          }}>
            <Text sx={{ mb: 4 }}>If you want to hide this habit because you aren't focusing on it anymore, simply <b>archive</b> it instead.</Text>
            <Text>Permanently deleting this habit will <b>erase it from history.</b></Text>
          </Box>
          <Flex sx={{ flexWrap: ['wrap', 'nowrap'], flexDirection: ['column-reverse', 'row'], width: '100%' }}>
            <Button onClick={closeModal} sx={{ flex: 1, mr: [0, 3], mt: [3, 0], minWidth: ['100%', 'auto'] }}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteHabit}
              hoverEffect="opacity"
              disabled={isDeleting}
              sx={{ flex: 1, minWidth: ['100%', 'auto'], bg: 'buttonWarning' }}
            >
              {isDeleting ? 'Deleting...' : 'Got it, delete'}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </ModalPopup>
  )
}

export default HabitOptionsDropdown