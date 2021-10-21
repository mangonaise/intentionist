import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { Box, Button, Flex, Text } from '@/components/primitives'
import { FocusTimerContext } from 'pages/focus'
import formatSeconds from '@/lib/logic/utils/formatSeconds'
import getWeekdayName from '@/lib/logic/utils/getWeekdayName'
import useCurrentDay from '@/lib/hooks/useCurrentDay'

const TimerDailyTimeText = () => {
  const [period, setPeriod] = useState<'day' | 'week'>('day')
  const { getTimeSpentThisWeek, progress, status, selectedHabit, weekdayId: timerWeekdayId } = useContext(FocusTimerContext)
  const { weekdayId: todayId } = useCurrentDay()

  const weekdayIdToDisplay = status === 'not started' ? todayId : timerWeekdayId
  const weekdayName = getWeekdayName(weekdayIdToDisplay)

  let time = getTimeSpentThisWeek(period === 'day' ? weekdayIdToDisplay : 'all')
  if (status === 'playing' || status === 'paused') {
    time += progress
  }

  function togglePeriod() {
    setPeriod(period === 'day' ? 'week' : 'day')
  }

  return (
    <Flex
      align="center"
      sx={{
        opacity: !!selectedHabit ? 1 : 0.25,
        pointerEvents: !!selectedHabit ? 'auto' : 'none'
      }}
    >
      <Button
        onClick={togglePeriod}
        hoverEffect="none"
        sx={{
          background: 'none',
          padding: 0,
          textDecoration: 'underline 2px',
          textDecorationColor: 'whiteAlpha.20',
          fontWeight: 'light',
          '&:hover': {
            textDecorationColor: 'whiteAlpha.50'
          }
        }}
      >
        {period === 'day' ? weekdayName : 'This week'}
      </Button>
      <Box sx={{ bg: 'whiteAlpha.30', size: '3px', borderRadius: '50%', mx: 2 }} />
      <Text type="span" sx={{ fontWeight: 'medium', fontVariantNumeric: 'tabular-nums' }}>
        {time ? formatSeconds(time, 'letters') : 'No focused time'}
      </Text>
    </Flex>
  )
}

export default observer(TimerDailyTimeText)