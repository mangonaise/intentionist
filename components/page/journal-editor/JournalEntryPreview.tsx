import { useContext } from 'react'
import { JournalContext } from 'pages/journal/[id]'
import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'
import Spacer from '@/components/primitives/Spacer'

const JournalEntryViewer = () => {
  return (
    <>
      <IconAndTitle />
      <Box sx={{ borderBottom: 'solid 1.5px', borderColor: 'divider', my: [2, 3] }} />
      <EditEntryPrompt />
      <Spacer mb={[3, 5]} />
    </>
  )
}

const IconAndTitle = () => {
  const { entryData } = useContext(JournalContext)

  return (
    <Flex align="center">
      <SmartEmoji nativeEmoji={entryData.icon} rem={1.85} />
      <Heading
        level={2}
        sx={{
          marginLeft: [3, 4],
          maxWidth: '100%',
          fontSize: ['1.5rem', '2.5rem', '2.5rem'],
          fontWeight: 'bold',
          overflowWrap: 'break-word',
          wordBreak: 'break-word'
        }}
      >
        {entryData.title || 'New journal entry'}
      </Heading>
    </Flex>
  )
}

const EditEntryPrompt = () => {
  const { entryData } = useContext(JournalContext)

  if (entryData.title) return null

  return (
    <Text sx={{ opacity: 0.6, fontWeight: 'light' }}>
      To create this journal entry, press the edit button at the top of the page.
    </Text>
  )
}

export default JournalEntryViewer