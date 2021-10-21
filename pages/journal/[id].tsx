import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useState } from 'react'
import { format } from 'date-fns'
import JournalEntryEditor, { JournalEntryDocumentData } from '@/lib/logic/app/JournalEntryEditor'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'
import withApp from '@/components/app/withApp'
import LoadingScreen from '@/components/app/LoadingScreen'
import SmartEmoji from '@/components/app/SmartEmoji'
import JournalEntryEditorView from '@/components/page/journal-editor/JournalEntryEditorView'
import JournalEntryNavSection from '@/components/page/journal-editor/JournalEntryNavSection'
import JournalEntryPreview from '@/components/page/journal-editor/JournalEntryPreview'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'

export const JournalContext = createContext<{ editor: JournalEntryEditor, entryData: JournalEntryDocumentData }>(null!)

const JournalEntryPage = observer(() => {
  const [editor] = useState(container.resolve(JournalEntryEditor))

  if (!editor.entry) return <LoadingScreen />

  return (
    <JournalContext.Provider value={{ editor, entryData: editor.entry }}>
      <FadeIn sx={{ maxWidth: '750px', margin: 'auto' }}>
        <JournalEntryNavSection />
        <Spacer mb={[4, 6]} />
        <DateAndHabit />
        <Spacer mb={[2, 3]} />
        {!!editor.isEditing ? <JournalEntryEditorView /> : <JournalEntryPreview />}
      </FadeIn>
    </JournalContext.Provider>
  )
})

const DateAndHabit = () => {
  const { entryData } = useContext(JournalContext)
  const [habit] = useState(container.resolve(HabitsHandler).habits.find((habit) => habit.id === entryData.habitId))
  if (!habit) return null

  return (
    <Flex align="center" flexWrap>
      <Text type="span" sx={{ opacity: 0.5, mr: 2 }}>
        {format(new Date(entryData.date), 'dd MMM yyyy')} in
      </Text>
      <Flex center sx={{ maxWidth: '100%' }}>
        <SmartEmoji nativeEmoji={habit.icon} nativeFontSize="1rem" twemojiSize={16} />
        <Text type="span" sx={{ ml: 2, opacity: 0.5, maxWidth: '100%', overflowWrap: 'break-word' }}>
          {habit.name}
        </Text>
      </Flex>
    </Flex>
  )
}

export default withApp(JournalEntryPage, 'journal')