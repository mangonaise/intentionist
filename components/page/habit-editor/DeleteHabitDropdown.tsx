import { useContext, useState } from 'react'
import { HabitEditorContext } from 'pages/habits/[id]'
import Dropdown from '@/components/app/Dropdown'
import ModalPopup from '@/components/app/ModalPopup'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'

const DeleteHabitDropdown = () => {
  const editor = useContext(HabitEditorContext)
  const [showModal, setShowModal] = useState(false)

  function openModal() {
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  function handleDeleteHabit() {
    closeModal()
    editor.deleteHabit()
  }

  return (
    <>
      <Dropdown anchorRight sx={{ ml: 2 }}>
        <Dropdown.Item itemAction={openModal}>Delete</Dropdown.Item>
      </Dropdown>
      <ModalPopup isOpen={showModal} closeModal={closeModal}>
        <Flex center column>
          <Heading sx={{ my: 6 }}>Hold up!</Heading>
          <Box sx={{ px: 4, pb: 4 }}>
            <Box sx={{
              maxWidth: '420px',
              bg: 'whiteAlpha.5',
              borderRadius: 'default',
              p: 4, mb: 4,
              fontWeight: 'light',
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              <Text sx={{ mb: 4 }}>If you want to hide this habit because you aren't focusing on it anymore, simply <b>suspend</b> or <b>archive</b> it instead.</Text>
              <Text>Permanently deleting this habit will <b>erase it from history.</b> That includes all tracker history and notes.</Text>
            </Box>
            <Flex sx={{ flexWrap: ['wrap', 'nowrap'], flexDirection: ['column-reverse', 'row'], width: '100%' }}>
              <Button onClick={closeModal} sx={{ flex: 1, mr: [0, 3], mt: [3, 0], minWidth: ['100%', 'auto'] }}>
                Cancel
              </Button>
              <Button onClick={handleDeleteHabit} hoverEffect="opacity" sx={{ flex: 1, minWidth: ['100%', 'auto'], bg: 'focus' }}>
                Got it, delete
              </Button>
            </Flex>
          </Box>
        </Flex>
      </ModalPopup>
    </>
  )
}

export default DeleteHabitDropdown