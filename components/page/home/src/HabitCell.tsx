import { SmartEmoji } from '@/components/app'
import { CenteredFlex, Text } from '@/components/primitives'

const HabitCell = () => {
  return (
    <CenteredFlex minHeight="row" borderBottom="solid 1px" borderColor="grid" flexStart pl={2}>
      <SmartEmoji nativeEmoji="🎯" nativeFontSize="1.25rem" twemojiSize={18} />
      <Text as="span" ml={2}>
        Habit
      </Text>
    </CenteredFlex>
  )
}

export default HabitCell