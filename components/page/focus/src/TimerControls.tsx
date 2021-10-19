import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { Flex, IconButton } from '@/components/primitives'
import { PauseFillIcon, PlayIcon, StopIcon } from '@/components/icons'
import { FocusTimerContext } from 'pages/focus'

const TimerControls = () => {
  return (
    <Flex>
      <PlayPauseButton />
      <StopButton />
    </Flex>
  )
}

const PlayPauseButton = observer(() => {
  const { status, startTimer, pauseTimer, duration } = useContext(FocusTimerContext)

  if (status === 'finished') return null

  function handleClick() {
    if (status === 'not started' || status === 'paused') {
      startTimer()
    } else if (status === 'playing') {
      pauseTimer()
    }
  }

  const icon = status === 'playing' ? PauseFillIcon : PlayIcon

  return (
    <IconButton
      icon={icon}
      onClick={handleClick}
      hoverEffect="opacity"
      disabled={!duration}
      sx={{
        size: ['3.5rem', '4rem'],
        borderRadius: '50%',
        backgroundColor: 'text',
        color: 'bg',
        fontSize: '2rem',
        '& svg': { position: 'relative', left: icon === PlayIcon ? '5%' : null }
      }}
    />
  )
})

const StopButton = observer(() => {
  const { status, stopTimer } = useContext(FocusTimerContext)

  if (status === 'not started') return null

  return (
    <IconButton
      icon={StopIcon}
      onClick={stopTimer}
      hoverEffect="opacity"
      sx={{
        marginLeft: status === 'finished' ? 0 : [3, 4],
        size: ['3.5rem', '4rem'],
        borderRadius: '50%',
        backgroundColor: 'text',
        color: 'bg',
        fontSize: '2rem'
      }}
    />
  )
})

export default TimerControls