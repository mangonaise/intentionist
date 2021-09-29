import { CenteredFlex, Text } from '@/components/primitives'
import { HabitEditorContext } from 'pages/habits/[id]'
import { useContext } from 'react'

const HabitIconPicker = () => {
  const editor = useContext(HabitEditorContext)

  return (
    <CenteredFlex
      minWidth={["3.5rem", "5rem"]}
      minHeight={["3.5rem", "5rem"]}
      bg="whiteAlpha.5"
      borderRadius="default"
    >
      <Text as="span" fontSize={["1.5rem", "2rem"]}>
        {editor.habit?.icon}
      </Text>
    </CenteredFlex>
  )
}

export default HabitIconPicker