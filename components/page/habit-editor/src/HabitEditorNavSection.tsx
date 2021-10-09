import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitEditorContext } from 'pages/habits/[id]'
import { Box, Button, Flex, IconButton, Text } from '@/components/primitives'
import { CloseIcon } from '@/components/icons'
import { DeleteHabitDropdown } from '..'

const HabitEditorNavSection = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <Flex sx={{ pb: [3, 4], borderBottom: 'solid 1.5px', borderColor: 'divider' }}>
      <IconButton icon={CloseIcon} onClick={editor.exit} />
      <Box sx={{ alignSelf: 'center', ml: 4 }}>
        <Text type="span" sx={{ color: 'whiteAlpha.70' }}>
          {editor.isNewHabit ? 'Adding new ' : 'Editing '}habit
        </Text>
      </Box>
      <Button
        onClick={editor.saveAndExit}
        disabled={!editor.habit?.name}
        hoverEffect="opacity"
        sx={{
          ml: 'auto',
          bg: 'text',
          color: 'bg',
          fontWeight: 'medium'
        }}
      >
        {editor.isNewHabit ? 'Add' : 'Save'}
      </Button>
      {!editor.isNewHabit && <DeleteHabitDropdown />}
    </Flex>
  )
}

export default observer(HabitEditorNavSection)