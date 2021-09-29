import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitFilterContext } from 'pages/habits'
import { Button } from '@/components/primitives'

const HabitStatusDropdown = () => {
  const { setFilter } = useContext(HabitFilterContext)

  return (
    <Button
      as="select"
      color="gray"
      ml={3}
      py={0}
      flexGrow={[1, 0]}
      onChange={(e: any) => setFilter(e.target.value)}
    >
      <option value={'active'}>Active habits</option>
      <option value={'suspended'}>Suspended habits</option>
      <option value={'archived'}>Archived habits</option>
    </Button>
  )
}

export default observer(HabitStatusDropdown)