import type { BaseEmoji } from 'emoji-mart'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { BlurListener, EmojiPicker, SmartEmoji } from '@/components/app'
import { Button, CenteredFlex } from '@/components/primitives'
import { HabitEditorContext } from 'pages/habits/[id]'

const HabitIconPicker = () => {
  const editor = useContext(HabitEditorContext)
  const [showPicker, setShowPicker] = useState(false)

  function handleSelectEmoji(emoji: BaseEmoji) {
    editor.updateHabit({ icon: emoji.native })
    setShowPicker(false)
  }

  return (
    <BlurListener blurAction={() => setShowPicker(false)} position="relative">
      <Button
        onClick={() => setShowPicker(!showPicker)}
        fontSize={['1.5rem', '2rem']}
        width={['3.5rem', '5rem']}
        height={['3.5rem', '5rem']}
      >
        <CenteredFlex>
          <SmartEmoji nativeEmoji={editor.habit?.icon || ''} twemojiSize={28} />
        </CenteredFlex>
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