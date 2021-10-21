import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { TimerStatus } from '@/lib/logic/app/FocusTimerHandler'
import { FocusTimerContext } from 'pages/focus'
import Flex from '@/components/primitives/Flex'

const statusText: { [status in TimerStatus]?: string } = {
  'playing': 'Focusing',
  'paused': 'Paused',
  'finished': 'Finished'
}

const TimerStatusText = () => {
  const { status } = useContext(FocusTimerContext)

  if (status === 'not started') return null

  return (
    <Flex center sx={{ height: '100%', fontWeight: 'medium', opacity: 0.6 }}>
      {statusText[status]}
    </Flex>
  )
}

export default observer(TimerStatusText)