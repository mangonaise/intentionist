import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useState } from 'react'
import HabitEditor from '@/lib/logic/app/HabitEditor'
import withApp from '@/components/app/withApp'
import EmojiPaletteEditor from '@/components/page/habit-editor/EmojiPaletteEditor'
import HabitEditorNavSection from '@/components/page/habit-editor/HabitEditorNavSection'
import HabitIconPicker from '@/components/page/habit-editor/HabitIconPicker'
import HabitNameInput from '@/components/page/habit-editor/HabitNameInput'
import HabitStatusPicker from '@/components/page/habit-editor/HabitStatusPicker'
import HabitTimeableCheckbox from '@/components/page/habit-editor/HabitTimeableCheckbox'
import Box from '@/components/primitives/Box'
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
        {!editor.isNewHabit && <>
          <HabitStatusPicker />
        </>}
        <Spacer mb={3} />
        <InitiallyHiddenOptions />
      </Box>
    </HabitEditorContext.Provider>
  )
}

const InitiallyHiddenOptions = observer(() => {
  const habitEditor = useContext(HabitEditorContext)
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible && habitEditor?.habit?.name) {
    setIsVisible(true)
  }

  return (
    <Box
      sx={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 350ms 500ms'
      }}
      tabIndex={-1}
    >
      <HabitTimeableCheckbox />
      <Spacer mb={[3, 8]} />
      <EmojiPaletteEditor />
    </Box>
  )
})

export default withApp(HabitEditorPage, 'neutral')