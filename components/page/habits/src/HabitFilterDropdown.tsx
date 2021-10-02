import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { HabitFilterContext } from 'pages/habits'
import { Dropdown } from '@/components/app'
import { HabitStatus } from '@/lib/logic/app/HabitsHandler'
import { Flex, Text } from '@/components/primitives'

const dropdownTextMap: { [status in HabitStatus]: string } = {
  active: 'Active habits',
  suspended: 'Suspended habits',
  archived: 'Archived habits'
}

const statuses = ['active', 'suspended', 'archived'] as HabitStatus[]

const HabitFilterDropdown = () => {
  const { filter, setFilter, getFilteredHabits } = useContext(HabitFilterContext)
  const [filteredCounts] = useState<{ [status in HabitStatus]: number }>({
    active: getFilteredHabits('active').length,
    suspended: getFilteredHabits('suspended').length,
    archived: getFilteredHabits('archived').length
  })

  return (
    <Dropdown title={dropdownTextMap[filter]} flexGrow={[1, 0]} ml={3}>
      {statuses.map(status => {
        const count = filteredCounts[status]
        return (
          <Dropdown.Item action={() => setFilter(status)} key={status}>
            <Flex>
              {dropdownTextMap[status]}
              {!!count && (
                <Text as="span" pl={5} ml="auto" opacity={0.5} fontWeight="normal">
                  {filteredCounts[status]}
                </Text>
              )}
            </Flex>
          </Dropdown.Item>
        )
      })}
    </Dropdown>
  )
}

export default observer(HabitFilterDropdown)