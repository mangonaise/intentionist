import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { Habit } from '@/lib/logic/app/HabitsHandler'
import { FocusTimerContext } from 'pages/focus'
import Dropdown from '@/components/app/Dropdown'
import SmartEmoji from '@/components/app/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'

const FocusHabitDropdown = () => {
  const { activeHabits, selectHabit, selectedHabit, status } = useContext(FocusTimerContext)

  if (!activeHabits.length) return <NoActiveHabitsWarning />

  function handleSelectHabit(habit: Habit) {
    selectHabit(habit)
  }

  return (
    <Dropdown
      title={<DropdownTitle selectedHabit={selectedHabit} />}
      disabled={status !== 'not started'}
      sx={{ width: ['100%', 'auto'] }}
      menuMaxWidth={['100%', 'none']}
    >
      {activeHabits.map((habit) => (
        <Dropdown.Item itemAction={() => handleSelectHabit(habit)} key={habit.id}>
          <Flex align="center">
            <SmartEmoji nativeEmoji={habit.icon} nativeFontSize="1.2rem" twemojiSize={18} />
            <Spacer mr={3} />
            {habit.name}
          </Flex>
        </Dropdown.Item>
      ))}
    </Dropdown>
  )
}

const DropdownTitle = ({ selectedHabit }: { selectedHabit: Habit | undefined }) => {
  return (
    <Flex align="center">
      {selectedHabit
        ? <>
          <Flex center sx={{ transform: 'scale(1.3)' }}>
            <SmartEmoji nativeEmoji={selectedHabit.icon} nativeFontSize="1rem" twemojiSize={14} />
          </Flex>
          <Spacer mr={4} />
          {selectedHabit.name}
        </>
        : <Text type="span" sx={{ color: 'focus', fontWeight: 'semibold', filter: 'brightness(1.2)' }}>
          No habit selected
        </Text>}
    </Flex>
  )
}

const NoActiveHabitsWarning = () => {
  return (
    <Flex center sx={{ fontWeight: 'medium', color: 'focus', filter: 'brightness(1.2)' }}>
      You have no active habits to focus on.
    </Flex>
  )
}

export default observer(FocusHabitDropdown)