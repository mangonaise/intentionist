import type { BaseEmoji } from 'emoji-mart'
import { useState } from 'react'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import EmojiPicker from './EmojiPicker'
import SmartEmoji from './SmartEmoji'
import BlurListener from './BlurListener'

interface Props {
  value: string,
  onChangeEmoji: (nativeEmoji: string) => void,
  buttonSize: string | string[]
  emojiFontSize: string | string[]
  twemojiSize: number,
  label: string
}

const EmojiButton = ({ value, onChangeEmoji, buttonSize, emojiFontSize, twemojiSize, label }: Props) => {
  const [showPicker, setShowPicker] = useState(false)

  function handleSelectEmoji(emoji: BaseEmoji) {
    onChangeEmoji(emoji.native)
    setShowPicker(false)
  }

  return (
    <>
      <Button
        onClick={() => setShowPicker(!showPicker)}
        sx={{
          size: buttonSize,
          fontSize: emojiFontSize
        }}
      >
        <Flex center>
          <SmartEmoji nativeEmoji={value} twemojiSize={twemojiSize} />
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