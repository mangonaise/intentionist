import type { StyledComponent } from '../types/StyledComponent'
import type { BaseEmoji } from 'emoji-mart'
import { useState } from 'react'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import EmojiPicker from './EmojiPicker'
import SmartEmoji from './SmartEmoji'

interface Props {
  value: string,
  onChangeEmoji: (nativeEmoji: string) => void,
  buttonSize: string | string[]
  emojiSizeRem: number
  label: string
}

const EmojiButton: StyledComponent<Props> = ({ value, onChangeEmoji, buttonSize, emojiSizeRem, label, className }) => {
  const [showPicker, setShowPicker] = useState(false)

  function handleSelectEmoji(emoji: BaseEmoji) {
    onChangeEmoji(emoji.native)
  }

  return (
    <>
      <Button
        onClick={() => setShowPicker(!showPicker)}
        sx={{ size: buttonSize }}
        className={className}
      >
        <Flex center>
          <SmartEmoji nativeEmoji={value} rem={emojiSizeRem} />
        </Flex>
      </Button>
      <EmojiPicker
        isOpen={showPicker}
        onClosePicker={() => setShowPicker(false)}
        label={label}
        onSelectEmoji={handleSelectEmoji}
      />
    </>
  )
}

export default EmojiButton