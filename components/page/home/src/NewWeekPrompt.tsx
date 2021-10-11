import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { SmartEmoji } from '@/components/app'
import { Button, Flex, Heading, Text } from '@/components/primitives'
import NewWeekPromptHandler from '@/lib/logic/app/NewWeekPromptHandler'
import accentColor from '@/lib/logic/utils/accentColor'
import format from 'date-fns/format'

const NewWeekPrompt = () => {
  const { checkIsNewWeek, showPrompt, thisWeekStartDate, trackNewWeek } = container.resolve(NewWeekPromptHandler)
  
  useEffect(() => {
    checkIsNewWeek()
  }, [checkIsNewWeek])

  if (!showPrompt) return null

  return (
    <Flex
      sx={{
        position: 'relative',
        flexDirection: ['column', 'row'],
        padding: [3, 4],
        mb: 3,
        '&::before': {
          position: 'absolute',
          zIndex: -1,
          content: '""',
          inset: 0,
          backgroundColor: accentColor.current,
          transition: 'background-color 250ms',
          borderRadius: 'default',
          opacity: 0.15
        }
      }}
    >
      <Seedling />
      <Flex column justify="center" sx={{ flexGrow: 1, ml: [0, 4], mt: [2, 0], textAlign: ['center', 'left'] }}>
        <Heading level={3} sx={{ fontSize: '1.4rem', mb: 1 }}>It's a new week</Heading>
        <Text sx={{ fontWeight: 'thin', opacity: 0.6 }}>
          You haven't started tracking the week beginning on <b>{format(thisWeekStartDate, 'EEEE, MMMM d')}</b>.
        </Text>
      </Flex>
      <Button
        onClick={trackNewWeek}
        sx={{ mt: [3, 0], bg: accentColor.current, transition: 'background-color 250ms' }}
        hoverEffect="opacity"
      >
        Track
      </Button>
    </Flex>
  )
}

const Seedling = () => {
  return (
    <Flex
      center
      sx={{
        position: 'relative',
        alignSelf: 'center',
        size: '4rem',
        borderRadius: '50%',
        '&::before': {
          position: 'absolute',
          zIndex: -1,
          content: '""',
          inset: 0,
          backgroundColor: accentColor.current,
          transition: 'background-color 250ms',
          borderRadius: '50%',
          opacity: 0.15
        }
      }}
    >
      <SmartEmoji nativeEmoji="🌱" nativeFontSize="1.8rem" twemojiSize={25} />
    </Flex>
  )
}

export default observer(NewWeekPrompt)