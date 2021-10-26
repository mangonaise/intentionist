import { observer } from 'mobx-react-lite'
import { ChangeEvent, useContext } from 'react'
import { JournalContext } from 'pages/journal/[id]'
import EmojiButton from '@/components/app/EmojiButton'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Input from '@/components/primitives/Input'
import Spacer from '@/components/primitives/Spacer'

const JournalEntryEditorView = () => {
  return (
    <Box>
      <Flex>
        <JournalEntryIconPicker />
        <JournalEntryTitleInput />
      </Flex>
      <Spacer mb={[2, 3]} />
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
      emojiSizeRem={1.5}
      label="as your journal entry's icon"
    />
  )
})

const JournalEntryTitleInput = observer(() => {
  const { editor, entryData } = useContext(JournalContext)

  return (
    <Input
      placeholder="Enter title"
      value={entryData.title}
      maxLength={150}
      onChange={(e: ChangeEvent<HTMLInputElement>) => editor.updateEntry('title', e.target.value)}
      sx={{
        fontSize: ['1.25rem', '1.5rem'],
        fontWeight: 'semibold',
        ml: [2, 3]
      }}
    />
  )
})

export default JournalEntryEditorView