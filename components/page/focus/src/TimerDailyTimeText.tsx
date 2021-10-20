import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { Text } from '@/components/primitives'
import { FocusTimerContext } from 'pages/focus'
import formatSeconds from '@/lib/logic/utils/formatSeconds'
import useCurrentDay from '@/lib/hooks/useCurrentDay'

const TimerDailyTimeText = () => {
  const { getTimeSpentThisWeek } = useContext(FocusTimerContext)
  const { weekdayId, weekdayName } = useCurrentDay()
  const time = getTimeSpentThisWeek(weekdayId)

  return (
    <Text type="span" sx={{ fontWeight: 'light' }}>
      <Text type="span" sx={{ fontWeight: 'medium' }}>
        {time ? formatSeconds(time) : 'No focused time'}
      </Text>
      {` on ${weekdayName}`}
    </Text>
  )
}

export default observer(TimerDailyTimeText)