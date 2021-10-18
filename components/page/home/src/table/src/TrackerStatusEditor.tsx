import { container } from 'tsyringe'
import { EmojiPicker } from '@/components/app'
import { BackspaceIcon, CheckIcon, SearchIcon } from '@/components/icons'
import { Dispatch, SetStateAction, useState } from 'react'
import CellEditorButton from './CellEditorButton'
import CellEditorButtonsBar from './CellEditorButtonsBar'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'

interface TrackerStatusEditorProps {
  draft: string[],
  habitId: string
  onEditDraft: Dispatch<SetStateAction<string[]>>,
  onFinishEditing: () => void
}

const TrackerStatusEditor = ({ draft, habitId, onEditDraft, onFinishEditing }: TrackerStatusEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [palette] = useState(getHabitPalette(habitId))

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

  return (
    <>
      <CellEditorButtonsBar above>
        <CellEditorButton content={SearchIcon} action={() => setShowEmojiPicker(!showEmojiPicker)} invert={showEmojiPicker} />
        <CellEditorButton content={BackspaceIcon} action={backspace} disabled={!draft.length} />
        <CellEditorButton content={CheckIcon} action={onFinishEditing} />
      </CellEditorButtonsBar>
      {!showEmojiPicker && !!palette.length && (
        <CellEditorButtonsBar>
          {palette.map((emoji, index) => <CellEditorButton key={index} content={emoji} action={() => addEmoji(emoji)} />)}
        </CellEditorButtonsBar>
      )}
      <EmojiPicker
        isOpen={showEmojiPicker}
        label="Choose a status"
        onSelectEmoji={(emoji) => addEmoji(emoji.native)}
        onEscape={() => { }}
      />
    </>
  )
}

function getHabitPalette(habitId: string) {
  const allHabits = container.resolve(HabitsHandler).habits
  const habit = allHabits.find((habit) => habit.id === habitId)
  return habit?.palette ?? []
}

export default TrackerStatusEditor