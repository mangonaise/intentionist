import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitEditorContext } from 'pages/habits/[id]'
import { Box, Button, Flex, IconButton, Text } from '@/components/primitives'
import { CloseIcon } from '@/components/icons'
import { DeleteHabitDropdown } from '..'

const HabitEditorNavSection = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <Flex pb={[3, 4]} borderBottom="solid 1.5px" borderColor="divider">
      <IconButton icon={CloseIcon} onClick={editor.exit} />
      <Box alignSelf="center" ml={4}>
        <Text as="span" color="whiteAlpha.70">
          {editor.isNewHabit ? 'Adding new ' : 'Editing '}habit
        </Text>
      </Box>
      <Button
        onClick={editor.saveAndExit}
        disabled={!editor.habit?.name}
        bg="text"
        color="bg"
        reduceHoverOpacity
        ml="auto"
        fontWeight="medium"
      >
        {editor.isNewHabit ? 'Add' : 'Save'}
      </Button>
      {!editor.isNewHabit && <DeleteHabitDropdown />}
    </Flex>
  )
}

export default observer(HabitEditorNavSection)