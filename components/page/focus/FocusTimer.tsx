import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { FocusTimerContext } from 'pages/focus'
import DbHandler from '@/logic/app/DbHandler'
import useWarnUnsavedChanges from '@/hooks/useWarnUnsavedChanges'
import Box from '@/components/primitives/Box'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import Spacer from '@/components/primitives/Spacer'
import TimerIcon from '@/components/icons/TimerIcon'
import TimerDurationButtons from './TimerDurationButtons'
import TimerProgress from './TimerProgress'
import TimerStatusText from './TimerStatusText'
import FocusHabitDropdown from './FocusHabitDropdown'
import TimerDailyTimeText from './TimerDailyTimeText'

const FocusTimer = () => {
  return (
    <Box
      sx={{
        width: '100%',
        padding: [1, 4],
        paddingTop: [0, null],
        backgroundColor: ['transparent', 'whiteAlpha.3'],
        borderRadius: 'default'
      }}
    >
      <Flex align="center">
        <Flex center sx={{ minWidth: '28px', minHeight: '28px', fontSize: '20px', bg: 'focus', borderRadius: '50%', p: 0, mr: 3 }}>
          <Icon icon={TimerIcon} sx={{ transform: 'translateY(-0.04rem)' }} />
        </Flex>
        <FocusHabitDropdown />
      </Flex>
      <Spacer mb={2} />
      <TimerDailyTimeText />
      <Spacer mb={1} />
      <TimerProgress />
      <Spacer mb={2} />
      <Box sx={{ height: '2.5rem' }}>
        <TimerDurationButtons />
        <TimerStatusText />
      </Box>
      <UnsavedTimerHandler />
    </Box>
  )
}

const UnsavedTimerHandler = observer(() => {
  const { isWriteComplete } = container.resolve(DbHandler)
  const { status } = useContext(FocusTimerContext)

  const isTimerActive = status === 'playing' || status === 'paused'

  useWarnUnsavedChanges(
    {
      routeChange: isTimerActive,
      unload: isTimerActive || !isWriteComplete
    },
    'Your focused time will not be saved because the timer is still active. Are you sure you want to leave?'
  )

  return null
})

export default FocusTimer