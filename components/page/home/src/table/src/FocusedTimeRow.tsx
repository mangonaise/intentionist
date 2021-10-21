import { container } from 'tsyringe'
import { Flex } from '@/components/primitives'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'
import formatSeconds from '@/lib/logic/utils/formatSeconds'

const FocusedTimeRow = ({ habitId }: { habitId: string }) => {
  return (
    <Flex center sx={{ borderTop: 'solid 1px', borderColor: 'grid' }}>
      {Array.from({ length: 7 }).map((_, weekdayId) => (
        <TimeCell habitId={habitId} weekday={weekdayId as WeekdayId} key={weekdayId} />
      ))}
    </Flex>
  )
}

const TimeCell = ({ habitId, weekday }: { habitId: string, weekday: WeekdayId }) => {
  const { getFocusedTime } = container.resolve(WeekHandler)
  const time = getFocusedTime(habitId, weekday)

  return (
    <Flex
      center
      sx={{
        flex: 1,
        height: '100%',
        borderLeft: 'solid 1px',
        borderColor: 'grid',
        backgroundColor: time ? 'whiteAlpha.3' : null
      }}
    >
      {!!time && formatSeconds(time, 'letters')}
    </Flex>
  )
}

export default FocusedTimeRow