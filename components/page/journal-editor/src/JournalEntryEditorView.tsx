import { ChangeEvent, useContext } from 'react'
import { JournalContext } from 'pages/journal/[id]'
import { Box, Flex, Input } from '@/components/primitives'
import { EmojiButton } from '@/components/app'
import { observer } from 'mobx-react-lite'

const JournalEntryEditorView = () => {
  return (
    <Box>
      <Flex>
        <JournalEntryIconPicker />
        <JournalEntryTitleInput />
      </Flex>
      <JournalEntryContentEditor />
    </Box>
  )
}

const JournalEntryIconPicker = observer(() => {
  const { editor, entryData } = useContext(JournalContext)

  return (
    <EmojiButton
      value={entryData.icon}
      onChangeEmoji={(emoji) => editor.updateEntry('icon', emoji)}
      buttonSize={['3rem', '3.5rem']}
      emojiFontSize={['1.25rem', '1.5rem']}
      twemojiSize={22}
      label="Select journal entry icon"
    />
  )
})

const JournalEntryTitleInput = observer(() => {
  const { editor, entryData } = useContext(JournalContext)

  return (
    <Input
      placeholder="Enter title"
      value={entryData.title}
      onChange={(e: ChangeEvent<HTMLInputElement>) => editor.updateEntry('title', e.target.value)}
      sx={{
        fontSize: ['1.25rem', '1.5rem'],
        fontWeight: 'semibold',
        pl: ['0.35em', 3],
        ml: [2, 3]
      }}
    />
  )
})

const JournalEntryContentEditor = observer(() => {
  const { editor, entryData } = useContext(JournalContext)

  return (
    <textarea
      value={entryData.content}
      maxLength={1000000}
      onChange={(e) => editor.updateEntry('content', e.target.value)}
      sx={{
        width: '100%',
        height: '50vh',
        mt: 3,
        p: 2,
        resize: 'none',
        color: 'text',
        fontSize: 'inherit',
        fontWeight: 'light',
        bg: 'whiteAlpha.3',
        borderRadius: 'default',
        border: 'solid 2px rgba(255, 255, 255, 0.25)',
        fontFamily: 'inherit',
        '&:focus': {
          boxShadow: 'none'
        }
      }}
    />
  )
})

export default JournalEntryEditorView