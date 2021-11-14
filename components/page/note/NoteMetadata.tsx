import { useContext } from 'react'
import { NoteContext } from 'pages/note'
import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'
import useMediaQuery from '@/hooks/useMediaQuery'

const NoteMetadata = () => {
  return (
    <>
      <IconAndTitle />
      <Box sx={{ borderBottom: 'solid 1px', borderColor: 'divider', my: [2, 3] }} />
      <EditNotePrompt />
    </>
  )
}

const IconAndTitle = () => {
  const { noteData } = useContext(NoteContext)
  const emojiSize = useMediaQuery('(max-width: 500px)', 1.3, 1.8)

  return (
    <Flex align="center">
      <SmartEmoji nativeEmoji={noteData.icon} rem={emojiSize} />
      <Heading
        level={2}
        sx={{
          marginLeft: [2, 4],
          maxWidth: '100%',
          fontSize: ['1.3rem', '2.5rem', '2.5rem'],
          fontWeight: 'bold',
          overflowWrap: 'break-word',
          wordBreak: 'break-word'
        }}
      >
        {noteData.title || 'New note'}
      </Heading>
    </Flex>
  )
}

const EditNotePrompt = () => {
  const { noteData } = useContext(NoteContext)

  if (noteData.title) return null

  return (
    <Text sx={{ opacity: 0.6, fontWeight: 'light' }}>
      To create a note, press the edit button at the top of the page.
    </Text>
  )
}

export default NoteMetadata