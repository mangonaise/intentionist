import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { Text } from '@/components/primitives'
import { FocusTimerContext } from 'pages/focus'
import formatSeconds from '@/lib/logic/utils/formatSeconds'
import getWeekdayName from '@/lib/logic/utils/getWeekdayName'
import useCurrentDay from '@/lib/hooks/useCurrentDay'

const TimerDailyTimeText = () => {
  const { getTimeSpentThisWeek, status, weekdayId: timerWeekdayId } = useContext(FocusTimerContext)
  const { weekdayId: todayId } = useCurrentDay()

  const weekdayIdToDisplay = status === 'not started' ? todayId : timerWeekdayId
  const weekdayName = getWeekdayName(weekdayIdToDisplay)
  const time = getTimeSpentThisWeek(weekdayIdToDisplay)

  return (
    <Text type="span" sx={{ fontWeight: 'light' }}>
      <Text type="span" sx={{ fontWeight: 'medium' }}>
        {time ? formatSeconds(time, 'letters') : 'No focused time'}
      </Text>
      {` on ${weekdayName}`}
    </Text>
  )
}

export default observer(TimerDailyTimeText)