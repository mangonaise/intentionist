import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { HabitPreset } from '@/logic/app/HabitsHandler'
import { HabitEditorContext } from 'pages/habit'
import HabitPresetsList from '@/components/modular/HabitPresetsList'
import Box from '@/components/primitives/Box'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'

const HabitEditorPresetsSection = observer(() => {
  const habitEditor = useContext(HabitEditorContext)
  const [isVisible, setIsVisible] = useState(true)

  if (isVisible && habitEditor.habit?.name) setIsVisible(false)
  if (!isVisible && !habitEditor.habit?.name) setIsVisible(true)

  function handleSelectPreset(preset: HabitPreset) {
    habitEditor.updateHabit({ ...preset })

    habitEditor.updateHabit({
      name: preset.name,
      palette: preset.palette,
      timeable: preset.timeable,
      icon: preset.icon,
      weeklyFrequency: preset.weeklyFrequency
    })
  }

  if (!isVisible || habitEditor.habit?.name) return null

  return (
    <Box sx={{ mt: 4 }}>
      <Text sx={{ fontSize: '1.2rem' }}>Or start with a preset</Text>
      <Spacer mb={3} />
      <HabitPresetsList onSelectPreset={handleSelectPreset} />
    </Box>
  )
})

export default HabitEditorPresetsSection