import type { BaseEmoji } from 'emoji-mart'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { BlurListener, EmojiPicker, SmartEmoji } from '@/components/app'
import { Button, Flex } from '@/components/primitives'
import { HabitEditorContext } from 'pages/habits/[id]'

const HabitIconPicker = () => {
  const editor = useContext(HabitEditorContext)
  const [showPicker, setShowPicker] = useState(false)

  function handleSelectEmoji(emoji: BaseEmoji) {
    editor.updateHabit({ icon: emoji.native })
    setShowPicker(false)
  }

  return (
    <BlurListener blurAction={() => setShowPicker(false)} sx={{ position: 'relative' }}>
      <Button
        onClick={() => setShowPicker(!showPicker)}
        sx={{
          size: ['3.5rem', '5rem'],
          fontSize: ['1.5rem', '2rem']
        }}
      >
        <Flex center>
          <SmartEmoji nativeEmoji={editor.habit?.icon || ''} twemojiSize={28} />
        </Flex>
      </Button>
      <EmojiPicker
        isOpen={showPicker}
        label="Select a habit icon"
        onSelectEmoji={handleSelectEmoji}
        onEscape={() => setShowPicker(false)}
      />
    </BlurListener>
  )
}

export default observer(HabitIconPicker)