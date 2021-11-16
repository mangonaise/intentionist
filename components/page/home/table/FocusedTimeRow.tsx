import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { ColumnsDisplayContext } from '../WeekTable'
import formatSeconds from '@/logic/utils/formatSeconds'
import WeekHandler, { WeekdayId } from '@/logic/app/WeekHandler'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import TimerIcon from '@/components/icons/TimerIcon'
import NextLink from 'next/link'

const FocusedTimeRow = observer(({ habitId }: { habitId: string }) => {
  const { getFocusedTime } = container.resolve(WeekHandler).weekInView
  const { collapseColumns, weekdayId } = useContext(ColumnsDisplayContext)

  return (
    <Flex center sx={{ borderTop: 'solid 1px', borderColor: 'grid' }}>
      {collapseColumns
        ? <TimeCell time={getFocusedTime(habitId, weekdayId)} />
        : Array.from({ length: 7 }).map((_, weekdayId) => (
          <TimeCell time={getFocusedTime(habitId, weekdayId as WeekdayId)} key={weekdayId} />
        ))}
      <TimeCell isSum time={getFocusedTime(habitId, 'week')} />
      <OpenTimerButton habitId={habitId} />
    </Flex>
  )
})

const TimeCell = ({ time, isSum }: { time: number, isSum?: boolean }) => {
  const sumStyle = isSum ? {
    color: 'focus',
    fontWeight: 'medium',
    filter: 'brightness(1.2)'
  } : {}

  return (
    <Flex
      center
      sx={{
        flex: 1,
        height: '100%',
        borderLeft: 'solid 1px',
        borderColor: 'grid',
        backgroundColor: time ? 'whiteAlpha.3' : null,
        ...sumStyle
      }}
    >
      {!!time && formatSeconds(time, 'letters')}
    </Flex>
  )
}

const OpenTimerButton = ({ habitId }: { habitId: string }) => {
  return (
    <NextLink href={`/focus?habitId=${habitId}`}>
      <IconButton
        icon={TimerIcon}
        sx={{
          height: '100%',
          width: '2.25rem',
          paddingY: 0,
          paddingX: '0.6rem',
          color: 'focus',
          backgroundColor: 'transparent',
          borderRadius: 0,
          borderLeft: 'solid 1px',
          borderColor: 'grid',
          fontSize: '0.95rem',
          filter: 'brightness(1.2)'
        }}
      />
    </NextLink>
  )
}

export default FocusedTimeRow