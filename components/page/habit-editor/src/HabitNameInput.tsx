import { Input } from '@/components/primitives'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'
import { HabitEditorContext } from 'pages/habits/[id]'
import { useContext } from 'react'

const StyledInput = styled(Input)({
  transition: 'border-color 150ms, background-color 150ms',
  '&:not(:focus, :hover)': {
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  '&:focus': {
    borderColor: 'transparent'
  }
})

const HabitNameInput = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <StyledInput
      placeholder="Enter habit name"
      value={editor.habit?.name}
      onChange={(e) => editor.updateHabit({ name: e.target.value })}
      fontSize={["1.5rem", "2.5rem"]}
      fontWeight="semibold"
      pl="0.35em"
    />
  )
}

export default observer(HabitNameInput)