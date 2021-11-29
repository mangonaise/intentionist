import { useEffect, useState } from 'react'
import { BaseEmoji } from 'emoji-mart'
import TrackerStatusEditorBar from '@/components/page/home/habit-tracker/TrackerStatusEditorBar'
import TrackerStatusEditorButton from '@/components/page/home/habit-tracker/TrackerStatusEditorButton'
import EmojiPicker from '@/components/app/EmojiPicker'
import Box from '@/components/primitives/Box'
import SearchIcon from '@/components/icons/SearchIcon'
import CrossIcon from '@/components/icons/CrossIcon'
import FocusTrap from 'focus-trap-react'

interface TrackerStatusEditorProps {
  hasValue: boolean,
  palette: string[],
  onSelectStatus: (status: string | null) => void,
  onCancelEditing: () => void
}

const TrackerStatusEditor = ({ hasValue, palette, onSelectStatus, onCancelEditing }: TrackerStatusEditorProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useStatusEditorArrowNavigation()

  async function handleEmojiPickerResult(emoji: BaseEmoji) {
    await new Promise(resolve => setTimeout(resolve, 250))
    onSelectStatus(emoji.native)
  }

  return (
    <FocusTrap
      paused={showEmojiPicker}
      focusTrapOptions={{
        clickOutsideDeactivates: true,
        onDeactivate: onCancelEditing,
        initialFocus: false
      }}
    >
      <Box sx={{ position: 'absolute', size: '100%' }}>
        {!!palette.length && (
          <TrackerStatusEditorBar above>
            <TrackerStatusEditorButton content={SearchIcon} action={() => setShowEmojiPicker(true)} focusIndex={0} />
            {palette.map((emoji, index) => (
              <TrackerStatusEditorButton
                content={emoji}
                action={() => onSelectStatus(emoji)}
                focusIndex={index + 1}
                key={index}
              />
            ))}
            {hasValue && (
              <TrackerStatusEditorButton content={CrossIcon} action={() => onSelectStatus(null)} focusIndex={palette.length + 1} />
            )}
          </TrackerStatusEditorBar>
        )}
        <EmojiPicker
          isOpen={showEmojiPicker}
          label="as your habit's daily status"
          onSelectEmoji={handleEmojiPickerResult}
          onClosePicker={() => setShowEmojiPicker(false)}
        />
        <Box onClick={onCancelEditing} sx={{ position: 'absolute', size: '100%' }} />
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

    function focusFirstElement() {
      document.getElementById('status_editor-0')?.focus()
    }

    function focusLastElement() {
      const editorButtonElements = document.querySelectorAll('[id^="status_editor-"]') as NodeListOf<HTMLElement>
      editorButtonElements[editorButtonElements.length - 1]?.focus()
    }

    if (direction === 'up' || direction === 'down') {
      focusFirstElement()
    } else {
      const focusedElementId = document.activeElement?.id
      if (focusedElementId?.includes('status_editor')) {
        const focusedIndex = parseInt(focusedElementId.split('-')[1])
        const newIndex = focusedIndex + (direction === 'right' ? 1 : -1)
        document.getElementById(`status_editor-${newIndex}`)?.focus()
      } else if (direction === 'left') {
        focusLastElement()
      } else if (direction === 'right') {
        focusFirstElement()
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

export default TrackerStatusEditor