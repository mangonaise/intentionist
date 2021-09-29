import { observer } from 'mobx-react-lite'
import { HabitFilterContext } from 'pages/habits'
import { useContext } from 'react'
import EditHabitButton from './EditHabitButton'

const FilteredHabitsList = () => {
  const { filteredHabits } = useContext(HabitFilterContext)
  return (
    <>
      {filteredHabits.map(habit => <EditHabitButton habit={habit} key={habit.id} />)}
    </>
  )
}

export default observer(FilteredHabitsList)