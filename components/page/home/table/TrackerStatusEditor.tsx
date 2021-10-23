import { container } from 'tsyringe'
import { Dispatch, SetStateAction, useState } from 'react'
import { BaseEmoji } from 'emoji-mart'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'
import CellEditorButton from './CellEditorButton'
import CellEditorButtonsBar from './CellEditorButtonsBar'
import EmojiPicker from '@/components/app/EmojiPicker'
import Box from '@/components/primitives/Box'
import BackspaceIcon from '@/components/icons/BackspaceIcon'
import CheckIcon from '@/components/icons/CheckIcon'
import SearchIcon from '@/components/icons/SearchIcon'
import FocusTrap from 'focus-trap-react'

interface TrackerStatusEditorProps {
  status: string[],
  habitId: string
  onEditStatus: Dispatch<SetStateAction<string[]>>,
  closeEditor: () => void
}

const TrackerStatusEditor = ({ status, habitId, onEditStatus, closeEditor }: TrackerStatusEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [palette] = useState(getHabitPalette(habitId))

  function addEmoji(emoji: string) {
    const newDraft = [...status]
    newDraft.push(emoji)
    onEditStatus(newDraft)
  }

  function backspace() {
    const newDraft = [...status]
    newDraft.splice(-1)
    onEditStatus(newDraft)
  }

  function handleEmojiPickerResult(emoji: BaseEmoji) {
    addEmoji(emoji.native)
    setShowEmojiPicker(false)
  }

  return (
    <FocusTrap paused={showEmojiPicker} focusTrapOptions={{
      clickOutsideDeactivates: true,
      onDeactivate: closeEditor
    }}>
      <Box sx={{ position: 'absolute', size: '100%' }}>
        <Box onClick={closeEditor} sx={{ position: 'absolute', size: '100%' }} />
        <CellEditorButtonsBar above>
          <CellEditorButton content={SearchIcon} action={() => setShowEmojiPicker(!showEmojiPicker)} />
          <CellEditorButton content={BackspaceIcon} action={backspace} disabled={!status.length} />
          <CellEditorButton content={CheckIcon} action={closeEditor} />
        </CellEditorButtonsBar>
        {!!palette.length && (
          <CellEditorButtonsBar>
            {palette.map((emoji, index) => <CellEditorButton key={index} content={emoji} action={() => addEmoji(emoji)} />)}
          </CellEditorButtonsBar>
        )}
        <EmojiPicker
          isOpen={showEmojiPicker}
          label="as your habit's daily status"
          onSelectEmoji={handleEmojiPickerResult}
          onClosePicker={() => setShowEmojiPicker(false)}
        />
      </Box>
    </FocusTrap>
  )
}

function getHabitPalette(habitId: string) {
  const allHabits = container.resolve(HabitsHandler).habits
  const habit = allHabits.find((habit) => habit.id === habitId)
  return habit?.palette ?? []
}

export default TrackerStatusEditor