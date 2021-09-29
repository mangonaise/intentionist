import { BackIcon } from '@/components/icons'
import { Box, Button, Flex, IconButton } from '@/components/primitives'
import { HabitEditorContext } from 'pages/habits/[id]'
import { useContext } from 'react'

const HabitEditorNavSection = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <Flex pb={[3, 4]} borderBottom="solid 1px" borderColor="divider">
      <IconButton icon={BackIcon} onClick={editor.exit} />
      <Box as="span" alignSelf="center" ml={4} color="whiteAlpha.60">
        {editor.isNewHabit ? 'Adding new ' : 'Editing '}habit
      </Box>
      <Button
        onClick={editor.saveAndExit}
        bg="text"
        color="bg"
        reduceHoverOpacity
        ml="auto"
        fontWeight="medium"
      >
        {editor.isNewHabit ? 'Add' : 'Save'}
      </Button>
    </Flex>
  )
}

export default HabitEditorNavSection