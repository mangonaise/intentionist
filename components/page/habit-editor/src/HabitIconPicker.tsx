import type { BaseEmoji } from 'emoji-mart'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { BlurListener, EmojiPicker } from '@/components/app'
import { Box, Button, CenteredFlex } from '@/components/primitives'
import { HabitEditorContext } from 'pages/habits/[id]'

const HabitIconPicker = () => {
  const editor = useContext(HabitEditorContext)
  const [showPicker, setShowPicker] = useState(false)

  function handleSelectEmoji(emoji: BaseEmoji) {
    editor.updateHabit({ icon: emoji.native })
    setShowPicker(false)
  }

  return (
    <Box position="relative">
      <BlurListener onBlur={() => setShowPicker(false)}>
      <Button 
          onClick={() => setShowPicker(!showPicker)}
          fontSize={['1.5rem', '2rem']}
          width={['3.5rem', '5rem']}
          height={['3.5rem', '5rem']}
        >
          <CenteredFlex>
            {editor.habit?.icon}
          </CenteredFlex>
        </Button>
        <EmojiPicker
          display={showPicker}
          label="Select a habit icon"
          onSelect={handleSelectEmoji}
          onClose={() => setShowPicker(false)}
        />
      </BlurListener>
    </Box>
  )
}

export default observer(HabitIconPicker)