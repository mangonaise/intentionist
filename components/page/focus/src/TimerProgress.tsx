import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { Flex, Text } from '@/components/primitives'
import { FocusTimerContext } from 'pages/focus'
import TimerControls from './TimerControls'
import ProgressBar from 'react-customizable-progressbar'

const TimerProgress = () => {
  return (
    <Flex
      center
      sx={{
        width: '100%',
        '.RCP': {
          '--pointer-stroke-color': ['var(--background-color)', '#1f1f1f'],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '100%',
          maxHeight: 'min-content',
          width: '400px !important',
          '& svg': {
            width: '100%',
            height: '100%'
          }
        }
      }}
    >
      <ProgressCircle />
    </Flex>
  )
}

const ProgressCircle = observer(() => {
  const { progress, duration, status } = useContext(FocusTimerContext)

  return (
    <ProgressBar
      progress={progress / (duration || 1)}
      steps={1}
      radius={100}
      strokeColor="var(--focus-accent-color)"
      strokeWidth={6}
      trackStrokeColor="var(--focus-timer-track-color)"
      trackStrokeWidth={6}
      pointerFillColor="var(--focus-accent-color)"
      pointerRadius={7}
      pointerStrokeWidth={3}
      pointerStrokeColor="var(--pointer-stroke-color)"
    >
      <Flex column align="center" sx={{ position: 'absolute' }}>
        <ProgressText timeRemaining={duration - progress} isFinished={status === 'finished'} />
        <TimerControls />
      </Flex>
    </ProgressBar>
  )
})

const ProgressText = ({ timeRemaining, isFinished }: { timeRemaining: number, isFinished: boolean }) => {
  const hours = Math.floor(timeRemaining / 3600)
  const minutes = Math.floor(timeRemaining / 60) % 60
  const seconds = timeRemaining % 60

  const segments = [minutes, seconds]
    .map((value) => value < 10 ? '0' + value : value)
  if (hours) segments.unshift(hours)

  const formattedTime = segments.join(':')

  return (
    <Text
      type="div"
      sx={{
        marginBottom: 2,
        fontSize: ['2.75rem', '4rem'],
        fontWeight: 'semibold',
        fontVariantNumeric: 'tabular-nums',
        animation: isFinished ? 'fade-in infinite alternate 850ms ease-in-out' : null
      }}
    >
      {formattedTime}
    </Text>
  )
}

export default TimerProgress