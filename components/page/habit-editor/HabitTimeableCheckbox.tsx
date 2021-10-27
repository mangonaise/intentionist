import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitEditorContext } from 'pages/habits/[id]'
import Checkbox from '@/components/primitives/Checkbox'

const HabitTimeableCheckbox = observer(() => {
  const editor = useContext(HabitEditorContext)

  return (
    <Checkbox
      label="Track focused time for this habit"
      checked={!!editor.habit?.timeable}
      onChange={(e) => editor.updateHabit({ timeable: e.target.checked })}
    />
  )
})

export default HabitTimeableCheckbox