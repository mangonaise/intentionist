import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { createContext, useContext, useState } from 'react'
import { format } from 'date-fns'
import { Global } from '@emotion/react'
import { css } from '@theme-ui/css'
import JournalEntryEditor, { JournalEntryDocumentData } from '@/lib/logic/app/JournalEntryEditor'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'
import withApp from '@/components/app/withApp'
import LoadingScreen from '@/components/app/LoadingScreen'
import SmartEmoji from '@/components/app/SmartEmoji'
import JournalEntryEditorView from '@/components/page/journal-editor/JournalEntryEditorView'
import JournalEntryNavSection from '@/components/page/journal-editor/JournalEntryNavSection'
import JournalEntryRichText from '@/components/page/journal-editor/JournalEntryRichText'
import JournalEntryPreview from '@/components/page/journal-editor/JournalEntryPreview'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Spacer from '@/components/primitives/Spacer'
import Text from '@/components/primitives/Text'
import Head from 'next/head'

export const JournalContext = createContext<{ editor: JournalEntryEditor, entryData: JournalEntryDocumentData }>(null!)

const JournalEntryPage = observer(() => {
  const [editor] = useState(container.resolve(JournalEntryEditor))

  if (!editor.entry) return (
    <>
      <Head><title>...</title></Head>
      <LoadingScreen />
      <JournalFontPreload />
    </>
  )

  return (
    <JournalContext.Provider value={{ editor, entryData: editor.entry }}>
      <Head><title>{editor.entry.title || 'New journal entry'}</title></Head>
      <FadeIn sx={{ maxWidth: '750px', margin: 'auto' }}>
        <JournalEntryNavSection />
        <Spacer mb={[4, 6]} />
        <DateAndHabit />
        <Spacer mb={[2, 3]} />
        {!!editor.isEditing ? <JournalEntryEditorView /> : <JournalEntryPreview />}
        <JournalEntryRichText />
      </FadeIn>
      <JournalFontPreload />
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
        {format(new Date(entryData.date), 'd MMM yyyy')} in
      </Text>
      <Flex center sx={{ maxWidth: '100%' }}>
        <SmartEmoji nativeEmoji={habit.icon} rem={1.2} />
        <Text type="span" sx={{ ml: 2, opacity: 0.5, maxWidth: '100%', overflowWrap: 'break-word' }}>
          {habit.name}
        </Text>
      </Flex>
    </Flex>
  )
}

const JournalFontPreload = () => {
  return (
    <>
      <Global styles={css({
        '@font-face': {
          fontFamily: 'Inter Extended',
          fontWeight: '1 999',
          'src': `url('/fonts/Inter-var-extended.woff2') format('woff2')`,
          'fontDisplay': 'swap'
        },
      })}
      />
      <span sx={{ fontFamily: 'Inter Extended', pointerEvents: 'none' }} role="none presentation" />
    </>
  )
}

export default withApp(JournalEntryPage, 'journal')