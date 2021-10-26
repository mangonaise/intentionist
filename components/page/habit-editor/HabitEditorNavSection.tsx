import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitEditorContext } from 'pages/habits/[id]'
import DeleteHabitDropdown from './DeleteHabitDropdown'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import Text from '@/components/primitives/Text'
import CloseIcon from '@/components/icons/CloseIcon'

const HabitEditorNavSection = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <Flex sx={{ pb: [2, 3], borderBottom: 'solid 1.5px', borderColor: 'divider' }}>
      {editor.isNewHabit && <IconButton icon={CloseIcon} onClick={editor.exit} sx={{ mr: [2, 3, 4] }} />}
      <Text
        type="span"
        sx={{
          color: 'whiteAlpha.70',
          alignSelf: 'center',
          transform: editor.isNewHabit ? null : ['translateY(0.25rem)', 'translateY(0.45rem)']
        }}
      >
        {editor.isNewHabit ? 'Adding new ' : 'Editing '}habit
      </Text>
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