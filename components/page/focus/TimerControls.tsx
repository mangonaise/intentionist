import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { FocusTimerContext } from 'pages/focus'
import { ButtonProps } from '@/components/primitives/Button'
import exclude from '@/lib/logic/utils/exclude'
import TimerConfirmNewWeekModal from './TimerConfirmNewWeekModal'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import PauseFillIcon from '@/components/icons/PauseFillIcon'
import PlayIcon from '@/components/icons/PlayIcon'
import StopIcon from '@/components/icons/StopIcon'

const TimerControls = () => {
  return (
    <Flex>
      <PlayPauseButton />
      <StopButton />
    </Flex>
  )
}

const PlayPauseButton = observer(() => {
  const { status, startTimer, pauseTimer, duration, selectedHabit, activeHabits, getIsUntrackedWeek } = useContext(FocusTimerContext)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  if (status === 'finished') return null

  function handleClick() {
    if (status === 'not started' && getIsUntrackedWeek()) {
      setIsConfirmModalOpen(true)
    } else {
      if (status === 'not started' || status === 'paused') {
        startTimer()
      } else if (status === 'playing') {
        pauseTimer()
      }
    }
  }

  const icon = status === 'playing' ? PauseFillIcon : PlayIcon

  return (
    <>
      <TimerControlButton
        onClick={handleClick}
        icon={icon}
        disabled={!duration || !activeHabits.length || !selectedHabit}
        sx={{ '& svg': { position: 'relative', left: icon === PlayIcon ? '5%' : null } }}
      />
      <TimerConfirmNewWeekModal
        isOpen={isConfirmModalOpen}
        onCloseModal={() => setIsConfirmModalOpen(false)}
        onConfirmStart={startTimer}
      />
    </>
  )
})

const StopButton = observer(() => {
  const { status, stopTimer } = useContext(FocusTimerContext)

  if (status === 'not started') return null

  return (
    <TimerControlButton
      onClick={stopTimer}
      icon={StopIcon}
      sx={{ marginLeft: status === 'finished' ? 0 : [3, 4] }}
    />
  )
})

interface TimerControlButtonProps extends ButtonProps { icon: () => JSX.Element }
const TimerControlButton = (props: TimerControlButtonProps) => {
  return (
    <IconButton
      icon={props.icon}
      sx={{
        size: ['3.5rem', '4rem'],
        borderRadius: '50%',
        color: 'bg',
        backgroundColor: 'text',
        '& svg': { transform: 'scale(1.8)' }
      }}
      hoverEffect="opacity"
      {...exclude(props, 'icon')}
    />
  )
}

export default TimerControls