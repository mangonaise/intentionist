import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { HabitPreset } from '@/logic/app/HabitsHandler'
import { HabitEditorContext } from 'pages/habit'
import Box from '@/components/primitives/Box'
import Checkbox from '@/components/primitives/Checkbox'
import HabitPresetsList from '@/components/app/HabitPresetsList'
import Spacer from '@/components/primitives/Spacer'

const HabitEditorPresetsSection = observer(() => {
  const habitEditor = useContext(HabitEditorContext)
  const [isVisible, setIsVisible] = useState(true)
  const [showPresets, setShowPresets] = useState(false)

  if (isVisible && habitEditor.habit?.name) setIsVisible(false)

  function handleSelectPreset(preset: HabitPreset) {
    habitEditor.updateHabit({
      name: preset.name,
      palette: preset.palette,
      timeable: preset.timeable,
      icon: preset.icon
    })
  }

  if (!isVisible || habitEditor.habit?.name) return null

  return (
    <Box>
      <Spacer mb={3} />
      <Checkbox
        label="Show presets"
        checked={showPresets}
        onChange={(e) => setShowPresets(e.target.checked)}
      />
      <Spacer mb={3} />
      {showPresets && <HabitPresetsList onSelectPreset={handleSelectPreset} />}
    </Box>
  )
})

export default HabitEditorPresetsSection