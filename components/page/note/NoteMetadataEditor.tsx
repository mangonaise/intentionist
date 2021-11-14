import { observer } from 'mobx-react-lite'
import { ChangeEvent, useContext } from 'react'
import { NoteContext } from 'pages/note'
import EmojiButton from '@/components/app/EmojiButton'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Input from '@/components/primitives/Input'
import Spacer from '@/components/primitives/Spacer'

const NoteMetadataEditor = () => {
  return (
    <Box>
      <Flex>
        <NoteIconPicker />
        <NoteTitleInput />
      </Flex>
      <Spacer mb={2} />
    </Box>
  )
}

const NoteIconPicker = observer(() => {
  const { editor, noteData } = useContext(NoteContext)

  return (
    <EmojiButton
      value={noteData.icon}
      onChangeEmoji={(emoji) => editor.updateNote('icon', emoji)}
      buttonSize={['3rem', '3.5rem']}
      emojiSizeRem={1.5}
      label="as your note's icon"
    />
  )
})

const NoteTitleInput = observer(() => {
  const { editor, noteData } = useContext(NoteContext)

  return (
    <Input
      placeholder="Enter title"
      value={noteData.title}
      maxLength={150}
      onChange={(e: ChangeEvent<HTMLInputElement>) => editor.updateNote('title', e.target.value)}
      sx={{
        fontSize: ['1.25rem', '1.5rem'],
        fontWeight: 'semibold',
        ml: [2, 3]
      }}
    />
  )
})

export default NoteMetadataEditor