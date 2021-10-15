import { useContext } from 'react'
import { SmartEmoji } from '@/components/app'
import { Box, Flex, Heading, Text } from '@/components/primitives'
import { JournalContext } from 'pages/journal/[id]'

const JournalEntryViewer = () => {
  return (
    <>
      <IconAndTitle />
      <Box sx={{ borderBottom: 'solid 1.5px', borderColor: 'divider', my: [2, 3] }} />
      <Content />
    </>
  )
}

const IconAndTitle = () => {
  const { entryData } = useContext(JournalContext)

  return (
    <Flex align="center">
      <SmartEmoji nativeEmoji={entryData.icon} nativeFontSize="2rem" twemojiSize={32} />
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

const Content = () => {
  const { entryData } = useContext(JournalContext)

  return (
    <Box sx={{ fontWeight: 'light', mt: [3, 5] }}>
      {!entryData.title ? (
        <Text sx={{ opacity: 0.6 }}>
          To create this journal entry, press the edit button at the top of the page.
        </Text>)
        : entryData.content
      }
    </Box>
  )
}

export default JournalEntryViewer