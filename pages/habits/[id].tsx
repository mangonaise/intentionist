import { container } from 'tsyringe'
import { createContext, useState } from 'react'
import { withApp } from '@/components/app'
import { FadeIn, Flex, Spacer } from '@/components/primitives'
import { HabitEditorNavSection, HabitIconPicker, HabitNameInput, HabitStatusPicker } from '@/components/page/habit-editor'
import HabitEditor from '@/lib/logic/app/HabitEditor'
import Head from 'next/head'

export const HabitEditorContext = createContext<HabitEditor>(null!)

const HabitEditorPage = () => {
  const [editor] = useState(container.resolve(HabitEditor))
  if (!editor.habit) return <></>
  return (
    <HabitEditorContext.Provider value={editor}>
      <Head><title>{editor.isNewHabit ? 'Add habit' : 'Edit habit'}</title></Head>
      <FadeIn maxWidth="habits" margin="auto">
        <HabitEditorNavSection />
        <Spacer mb={[3, 4]} />
        <Flex>
          <HabitIconPicker />
          <Spacer pr={[2, 3]} />
          <HabitNameInput />
        </Flex>
        <Spacer mb={[3, 4]} />
        {!editor.isNewHabit && <HabitStatusPicker />}
      </FadeIn>
    </HabitEditorContext.Provider>
  )
}

export default withApp(HabitEditorPage, 'neutral')