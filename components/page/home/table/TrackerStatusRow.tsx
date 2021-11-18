import { WeekdayId } from '@/logic/app/WeekInView'
import TrackerStatusCell from '@/components/page/home/table/TrackerStatusCell'
import Flex from '@/components/primitives/Flex'

const TrackerStatusRow = ({ habitId, rowIndex, readonly }: { habitId: string, rowIndex: number, readonly: boolean }) => {
  return (
    <Flex sx={{
      position: 'relative',
      '&::before': readonly ? {
        zIndex: -1,
        position: 'absolute', 
        inset: 0,
        content: '""', 
        backgroundColor: 'tracker',
        opacity: 0.09
      } : {}
    }}
    >
      {Array.from({ length: 7 }).map((_, weekdayId) => (
        <TrackerStatusCell
          habitId={habitId}
          weekday={weekdayId as WeekdayId}
          rowIndex={rowIndex}
          readonly={readonly}
          key={weekdayId}
        />
      ))}
    </Flex>
  )
}

export default TrackerStatusRow