import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { FocusTimerContext } from 'pages/focus'
import formatSeconds from '@/logic/utils/formatSeconds'
import TimerControls from './TimerControls'
import ProgressBar from 'react-customizable-progressbar'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'
import Head from 'next/head'

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
          width: '425px !important',
          '& > svg': {
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
  const { progress, duration, selectedHabit } = useContext(FocusTimerContext)

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
        <ProgressText />
        {!!selectedHabit ? <TimerControls /> : <SelectHabitText />}
      </Flex>
    </ProgressBar>
  )
})

const ProgressText = () => {
  const { progress, duration, status } = useContext(FocusTimerContext)
  const formattedTimeRemaining = formatSeconds(duration - progress, 'digital')

  return (
    <>
      <Head>{status !== 'not started' && <title>{formattedTimeRemaining}</title>}</Head>
      <Text
        type="div"
        sx={{
          marginBottom: 2,
          fontSize: ['2.75rem', '4rem'],
          fontWeight: 'semibold',
          fontVariantNumeric: 'tabular-nums',
          animation: status === 'finished' ? 'fade-in infinite alternate 850ms ease-in-out' : null
        }}
      >
        {formattedTimeRemaining}
      </Text>
    </>
  )
}

const SelectHabitText = () => {
  return (
    <Flex align="center" sx={{ color: 'focus', fontWeight: 'medium', height: ['3.5rem', '4rem'] }}>
      Select a habit to focus on
    </Flex>
  )
}

export default TimerProgress