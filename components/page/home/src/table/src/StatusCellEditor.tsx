import { EmojiPicker } from '@/components/app'
import { BackspaceIcon, CheckIcon, SearchIcon } from '@/components/icons'
import { Dispatch, SetStateAction, useState } from 'react'
import CellEditorButton from './CellEditorButton'
import CellEditorButtonsBar from './CellEditorButtonsBar'

const palette = ['🌟', '👍', '🙂', '🆗', '🙁']

interface StatusCellEditorProps {
  status: string[],
  onChangeStatus: Dispatch<SetStateAction<string[]>>,
  onFinishEditing: () => void
}

const StatusCellEditor = ({ status, onChangeStatus, onFinishEditing }: StatusCellEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  function addEmoji(emoji: string) {
    const newStatus = [...status]
    newStatus.push(emoji)
    onChangeStatus(newStatus)
  }

  function backspace() {
    const newStatus = [...status]
    newStatus.splice(-1)
    onChangeStatus(newStatus)
  }

  return (
    <>
      <CellEditorButtonsBar above>
        <CellEditorButton content={SearchIcon} action={() => setShowEmojiPicker(!showEmojiPicker)} invert={showEmojiPicker} />
        <CellEditorButton content={BackspaceIcon} action={backspace} disabled={!status.length} />
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

export default StatusCellEditor