import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { FocusTimerContext } from 'pages/focus'
import Flex from '@/components/primitives/Flex'
import Button from '@/components/primitives/Button'

const TimerDurationButtons = () => {
  const { setDuration, addDuration, status } = useContext(FocusTimerContext)

  if (status !== 'not started') return null

  return (
    <Flex
      sx={{
        height: '100%',
        '& button': {
          flex: 1,
          paddingY: 0,
          paddingX: 0,
          fontWeight: 'semibold',
          '&:not(:first-of-type)': {
            backgroundColor: 'focus',
            color: 'text'
          },
          '&:not(:last-of-type)': {
            marginRight: 2
          }
        }
      }}
    >
      <Button onClick={() => setDuration(0)}>
        0
      </Button>
      <Button onClick={() => addDuration(1200)} hoverEffect="opacity">
        +20
      </Button>
      <Button onClick={() => addDuration(300)} hoverEffect="opacity">
        +5
      </Button>
      <Button onClick={() => addDuration(60)} hoverEffect="opacity">
        +1
      </Button>
    </Flex>
  )
}

export default observer(TimerDurationButtons)