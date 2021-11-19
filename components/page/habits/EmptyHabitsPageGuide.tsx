import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import HabitsHandler, { HabitPreset } from '@/logic/app/HabitsHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import HabitPresetsList from '@/components/app/HabitPresetsList'
import Flex from '@/components/primitives/Flex'
import Box from '@/components/primitives/Box'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'

const EmptyHabitsPageGuide = () => {
  return (
    <>
      <SetHabitsPrompt />
      <HabitPresetsSection />
    </>
  )
}

const SetHabitsPrompt = observer(() => {
  const { activeHabits } = container.resolve(HabitsHandler)

  if (activeHabits.length) return null

  return (
    <Flex column align="center" sx={{ pt: [2, 4], pb: [4, 6], textAlign: 'center' }}>
      <Flex center sx={{ backgroundColor: 'whiteAlpha.10', borderRadius: '50%', p: 4 }}>
        <SmartEmoji nativeEmoji="🎯" rem={2.25} />
      </Flex>
      <Heading level={2} sx={{ pt: [3, 4], pb: [4, 8], fontSize: ['1.75rem', '2rem'], fontWeight: 'bold' }}>
        Set your daily habits
      </Heading>
      <Box sx={{ maxWidth: '800px', px: 2, margin: 'auto', fontWeight: 'light' }}>
        <Text sx={{ mb: 4 }}>
          Add custom habits with the <b>+</b> button above, or get started quickly by choosing some presets below.
        </Text>
        <Text>
          If you stop focusing on a habit at any time in the future, you can easily archive it.
        </Text>
      </Box>
    </Flex>
  )
})

const HabitPresetsSection = () => {
  function handleAddPreset(preset: HabitPreset) {
    container.resolve(HabitsHandler).addHabitFromPreset(preset)
  }

  return (
    <>
      <Flex align="center" sx={{ mt: [2, 4], mb: [2, 3], pb: [2, 3], borderBottom: 'solid 1px', borderColor: 'divider' }}>
        <Heading level={3} sx={{ fontSize: ['1.25rem', '1.5rem'], fontWeight: 'medium' }}>
          Presets
        </Heading>
      </Flex>
      <HabitPresetsList onSelectPreset={handleAddPreset} />
    </>
  )
}

export default EmptyHabitsPageGuide