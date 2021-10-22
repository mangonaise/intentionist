import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitEditorContext } from 'pages/habits/[id]'
import EmojiButton from '@/components/app/EmojiButton'

const HabitIconPicker = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <EmojiButton
      value={editor.habit?.icon || ''}
      onChangeEmoji={(emoji) => editor.updateHabit({ icon: emoji })}
      buttonSize={['3.5rem', '5rem']}
      emojiFontSize={['1.5rem', '2rem']}
      twemojiSize={28}
      label="as your habit's icon"
    />
  )
}

export default observer(HabitIconPicker)