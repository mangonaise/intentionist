import { container } from 'tsyringe'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { BaseEmoji } from 'emoji-mart'
import HabitsHandler from '@/logic/app/HabitsHandler'
import CellEditorButton from './CellEditorButton'
import CellEditorButtonsBar from './CellEditorButtonsBar'
import EmojiPicker from '@/components/app/EmojiPicker'
import Box from '@/components/primitives/Box'
import BackspaceIcon from '@/components/icons/BackspaceIcon'
import CheckIcon from '@/components/icons/CheckIcon'
import SearchIcon from '@/components/icons/SearchIcon'
import FocusTrap from 'focus-trap-react'

interface TrackerStatusEditorProps {
  draft: string[],
  onEditDraft: Dispatch<SetStateAction<string[]>>,
  habitId: string
  closeEditor: () => void
}

const TrackerStatusEditor = ({ draft, onEditDraft, habitId, closeEditor }: TrackerStatusEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [palette] = useState(getHabitPalette(habitId))

  useStatusEditorArrowNavigation()

  function addEmoji(emoji: string) {
    const newDraft = [...draft]
    newDraft.push(emoji)
    onEditDraft(newDraft)
  }

  function backspace() {
    const newDraft = [...draft]
    newDraft.splice(-1)
    onEditDraft(newDraft)
  }

  function handleEmojiPickerResult(emoji: BaseEmoji) {
    addEmoji(emoji.native)
  }

  return (
    <FocusTrap
      paused={showEmojiPicker}
      focusTrapOptions={{
        clickOutsideDeactivates: true,
        onDeactivate: closeEditor,
        initialFocus: false
      }}
    >
      <Box sx={{ position: 'absolute', size: '100%' }}>
        <CellEditorButtonsBar above>
          <CellEditorButton content={SearchIcon} action={() => setShowEmojiPicker(!showEmojiPicker)} focusIndex={0} />
          <CellEditorButton content={BackspaceIcon} action={backspace} disabled={!draft.length} focusIndex={1} />
          <CellEditorButton content={CheckIcon} action={closeEditor} focusIndex={2} />
        </CellEditorButtonsBar>
        {!!palette.length && (
          <CellEditorButtonsBar>
            {palette.map((emoji, index) => (
              <CellEditorButton key={index} content={emoji} action={() => addEmoji(emoji)} focusIndex={index + 3} />
            ))}
          </CellEditorButtonsBar>
        )}
        <EmojiPicker
          isOpen={showEmojiPicker}
          label="as your habit's daily status"
          onSelectEmoji={handleEmojiPickerResult}
          onClosePicker={() => setShowEmojiPicker(false)}
        />
        <Box onClick={closeEditor} sx={{ position: 'absolute', size: '100%' }} />
      </Box>
    </FocusTrap>
  )
}

function useStatusEditorArrowNavigation() {
  function handleKeyDown(e: KeyboardEvent) {
    if (document.getElementById('emoji-picker')) return

    const direction = ({
      'ArrowUp': 'up',
      'w': 'up',
      'ArrowRight': 'right',
      'd': 'right',
      'ArrowDown': 'down',
      's': 'down',
      'ArrowLeft': 'left',
      'a': 'left'
    } as { [key: string]: 'up' | 'right' | 'down' | 'left' })[e.key]

    if (!direction) return

    if (direction === 'up') {
      document.getElementById('cell_editor-2')?.focus()
    } else if (direction === 'down') {
      document.getElementById('cell_editor-3')?.focus()
    } else {
      const focusedElementId = document.activeElement?.id
      if (focusedElementId?.includes('cell_editor')) {
        const focusedIndex = parseInt(focusedElementId.split('-')[1])
        const newIndex = focusedIndex + (direction === 'right' ? 1 : -1)
        document.getElementById(`cell_editor-${newIndex}`)?.focus()
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

function getHabitPalette(habitId: string) {
  const allHabits = container.resolve(HabitsHandler).habits
  const habit = allHabits.find((habit) => habit.id === habitId)
  return habit?.palette ?? []
}

export default TrackerStatusEditor