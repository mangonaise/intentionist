import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { Dropdown, SmartEmoji } from '@/components/app'
import { Flex, Spacer } from '@/components/primitives'
import { Habit } from '@/lib/logic/app/HabitsHandler'
import { FocusTimerContext } from 'pages/focus'

const FocusHabitDropdown = () => {
  const { activeHabits, selectHabit, selectedHabit, status } = useContext(FocusTimerContext)

  if (!activeHabits.length) return <NoActiveHabitsWarning />

  function handleSelectHabit(habit: Habit) {
    selectHabit(habit)
  }

  const disable = status !== 'not started'

  return (
    <Dropdown
      title={<DropdownTitle selectedHabit={selectedHabit} />}
      sx={{ pointerEvents: disable ? 'none' : 'auto', opacity: disable ? 0.75 : 1 }}
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
  if (!selectedHabit) return null

  return (
    <Flex align="center">
      <Flex center sx={{ transform: 'scale(1.3)' }}>
        <SmartEmoji nativeEmoji={selectedHabit.icon} nativeFontSize="1rem" twemojiSize={14} />
      </Flex>
      <Spacer mr={4} />
      {selectedHabit.name}
    </Flex>
  )
}

const NoActiveHabitsWarning = () => {
  return (
    <Flex center sx={{ fontWeight: 'medium', color: 'focus', filter: 'brightness(1.2)'}}>
      You have no active habits to focus on.
    </Flex>
  )
}

export default observer(FocusHabitDropdown)