import { ChangeEvent, useContext } from 'react'
import { observer } from 'mobx-react-lite'
import { HabitEditorContext } from 'pages/habit'
import Input from '@/components/primitives/Input'

const HabitNameInput = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <Input
      placeholder="Enter habit name"
      value={editor.habit?.name}
      onChange={(e: ChangeEvent<HTMLInputElement>) => editor.updateHabit({ name: e.target.value })}
      sx={{
        fontSize: ["1.5rem", "2.5rem"],
        fontWeight: 'semibold',
        pl: '0.35em',
        transition: 'border-color 150ms, background-color 150ms',
        '&:not(:focus, :hover)': {
          borderColor: 'transparent',
          backgroundColor: 'transparent'
        }
      }}
    />
  )
}

export default observer(HabitNameInput)