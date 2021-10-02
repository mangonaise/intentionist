import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitFilterContext } from 'pages/habits'
import { Dropdown } from '@/components/app'
import { HabitStatus } from '@/lib/logic/app/HabitsHandler'

const dropdownTextMap: { [status in HabitStatus]: string } = {
  active: 'Active habits',
  suspended: 'Suspended habits',
  archived: 'Archived habits'
}

const statuses = ['active', 'suspended', 'archived'] as HabitStatus[]

const HabitStatusDropdown = () => {
  const { filter, setFilter } = useContext(HabitFilterContext)

  return (
    <Dropdown title={dropdownTextMap[filter]} flexGrow={[1, 0]} ml={3}>
      {statuses.map(status => (
        <Dropdown.Item
          key={status}
          text={dropdownTextMap[status]}
          action={() => setFilter(status)}
        />
      ))}
    </Dropdown>
  )
}

export default observer(HabitStatusDropdown)