import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useState } from 'react'
import HabitEditor from '@/logic/app/HabitEditor'
import withApp from '@/components/app/withApp'
import EmojiPaletteEditor from '@/components/page/habit-editor/EmojiPaletteEditor'
import HabitEditorNavSection from '@/components/page/habit-editor/HabitEditorNavSection'
import HabitIconPicker from '@/components/page/habit-editor/HabitIconPicker'
import HabitNameInput from '@/components/page/habit-editor/HabitNameInput'
import HabitEditorPresetsSection from '@/components/page/habit-editor/HabitEditorPresetsSection'
import Box from '@/components/primitives/Box'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Head from 'next/head'

export const HabitEditorContext = createContext<HabitEditor>(null!)

const HabitEditorPage = () => {
  const [editor] = useState(container.resolve(HabitEditor))
  if (!editor.habit) return <></>
  return (
    <HabitEditorContext.Provider value={editor}>
      <Head><title>{editor.isNewHabit ? 'Add habit' : 'Edit habit'}</title></Head>
      <Box sx={{ maxWidth: 'habits', margin: 'auto' }}>
        <HabitEditorNavSection />
        <Spacer mb={[2, 3]} />
        <Flex>
          <HabitIconPicker />
          <Spacer mr={2} />
          <HabitNameInput />
        </Flex>
        <Spacer mb={2} />
        {editor.isNewHabit && <HabitEditorPresetsSection />}
        <InitiallyHiddenOptions />
      </Box>
    </HabitEditorContext.Provider>
  )
}

const InitiallyHiddenOptions = observer(() => {
  const habitEditor = useContext(HabitEditorContext)
  const [isVisible, setIsVisible] = useState(false)
  const [fadeIn] = useState(!habitEditor.habit?.name)

  if (!isVisible && habitEditor.habit?.name) setIsVisible(true)
  if (isVisible && !habitEditor.habit?.name) setIsVisible(false)
  if (!isVisible && habitEditor.isNewHabit) return null

  return (
    <FadeIn time={fadeIn ? 350 : 0} delay={400}>
      <Spacer mb={[2, 4]} />
      <EmojiPaletteEditor />
    </FadeIn>
  )
})

export default withApp(HabitEditorPage)