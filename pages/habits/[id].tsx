import { container } from 'tsyringe'
import { createContext, useState } from 'react'
import { withApp } from '@/components/app'
import { Box, Flex, Spacer } from '@/components/primitives'
import { EmojiPaletteEditor, HabitEditorNavSection, HabitIconPicker, HabitNameInput, HabitStatusPicker } from '@/components/page/habit-editor'
import HabitEditor from '@/lib/logic/app/HabitEditor'
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
        <Spacer mb={3} />
        <Flex>
          <HabitIconPicker />
          <Spacer mr={[2, 3]} />
          <HabitNameInput />
        </Flex>
        <Spacer mb={3} />
        {!editor.isNewHabit && <>
          <HabitStatusPicker />
        </>}
        <Spacer mb={[4, 8]} />
        <EmojiPaletteEditor />
      </Box>
    </HabitEditorContext.Provider>
  )
}

export default withApp(HabitEditorPage, 'neutral')