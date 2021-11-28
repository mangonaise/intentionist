import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { HabitEditorContext } from 'pages/habit'
import { Habit } from '@/logic/app/HabitsHandler'
import Dropdown from '@/components/app/Dropdown'
import Box from '@/components/primitives/Box'
import Checkbox from '@/components/primitives/Checkbox'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Icon from '@/components/primitives/Icon'
import FlameIcon from '@/components/icons/FlameIcon'

const HabitStreakSettings = observer(() => {
  const { habit, updateHabit } = useContext(HabitEditorContext)

  function handleCheckboxChange(checked: boolean) {
    if (checked) {
      updateHabit({ weeklyFrequency: 7 })
    } else {
      updateHabit({ weeklyFrequency: null })
    }
  }

  return (
    <Box>
      <Checkbox
        label="Display streak"
        checked={!!habit?.weeklyFrequency}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
      />
      {!!habit?.weeklyFrequency && (
        <Flex align="center" sx={{ mt: 2 }}>
          <Icon icon={FlameIcon} sx={{ color: 'textAccent', fontSize: '1.2rem' }} />
          <Text type="span" sx={{ mx: 2 }}>Aim for</Text><FrequencyDropdown />
        </Flex>
      )
      }
    </Box >
  )
})

const frequencyData: Array<{ frequency: Exclude<Habit['weeklyFrequency'], null>, text: string }> = [
  { frequency: 7, text: 'every day' },
  { frequency: 6, text: '6 days per week' },
  { frequency: 5, text: '5 days per week' },
  { frequency: 4, text: '4 days per week' },
  { frequency: 3, text: '3 days per week' },
  { frequency: 2, text: '2 days per week' },
  { frequency: 1, text: '1 day per week' },
]

const FrequencyDropdown = () => {
  const { habit, updateHabit } = useContext(HabitEditorContext)

  function handleChangeFrequency(frequency: Habit['weeklyFrequency']) {
    updateHabit({ weeklyFrequency: frequency })
  }

  const title = frequencyData.find((data) => data.frequency === habit?.weeklyFrequency)?.text

  return (
    <Dropdown title={title}>
      {frequencyData.map((data) => (
        <Dropdown.Item itemAction={() => handleChangeFrequency(data.frequency)} key={data.frequency}>
          {data.text}
        </Dropdown.Item>
      ))}
    </Dropdown>
  )
}

export default HabitStreakSettings