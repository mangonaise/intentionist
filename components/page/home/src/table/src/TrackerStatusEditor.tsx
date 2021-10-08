import { EmojiPicker } from '@/components/app'
import { BackspaceIcon, CheckIcon, SearchIcon } from '@/components/icons'
import { Dispatch, SetStateAction, useState } from 'react'
import CellEditorButton from './CellEditorButton'
import CellEditorButtonsBar from './CellEditorButtonsBar'

const palette = ['🌟', '👍', '🙂', '🆗', '🙁']

interface TrackerStatusEditorProps {
  draft: string[],
  onEditDraft: Dispatch<SetStateAction<string[]>>,
  onFinishEditing: () => void
}

const TrackerStatusEditor = ({ draft, onEditDraft, onFinishEditing }: TrackerStatusEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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
      {!showEmojiPicker && (
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

export default TrackerStatusEditor