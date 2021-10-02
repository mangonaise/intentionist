import { useContext, useState } from 'react'
import { Box, Button, CenteredFlex, Flex, Heading, Text } from '@/components/primitives'
import { Dropdown, ModalPopup } from '@/components/app'
import { HabitEditorContext } from 'pages/habits/[id]'

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
      <Dropdown title="" ml={2} right={0}>
        <Dropdown.Item text="Delete" action={openModal} />
      </Dropdown>
      <ModalPopup isOpen={showModal} closeModal={closeModal}>
        <CenteredFlex flexDirection="column">
          <Heading my={6}>Hold up!</Heading>
          <Box px={4} pb={4}>
            <Box maxWidth="420px" bg="whiteAlpha.5" borderRadius="default" p={4} mb={4} fontWeight={300} textAlign="center" lineHeight={1.5}>
              <Text mb={4}>If you want to hide this habit because you aren't focusing on it anymore, simply <strong>suspend</strong> or <strong>archive</strong> it instead.</Text>
              <Text>Permanently deleting this habit will <strong>erase it from history.</strong> That includes all tracker history and journal entries.</Text>
            </Box>
            <Flex width="100%" flexWrap={['wrap', 'nowrap']}>
              <Button onClick={closeModal} flex={1} mr={[0, 3]} mb={[3, 0]} minWidth={['100%', 'auto']}>
                Cancel
              </Button>
              <Button onClick={handleDeleteHabit} flex={1} minWidth={['100%', 'auto']} bg="focus" reduceHoverOpacity>
                Got it, delete
              </Button>
            </Flex>
          </Box>
        </CenteredFlex>
      </ModalPopup>
    </>
  )
}

export default DeleteHabitDropdown