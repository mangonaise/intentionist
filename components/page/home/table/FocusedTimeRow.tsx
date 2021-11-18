import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { ColumnsDisplayContext } from '../WeekTable'
import WeekInView, { WeekdayId } from '@/logic/app/WeekInView'
import formatSeconds from '@/logic/utils/formatSeconds'
import Flex from '@/components/primitives/Flex'
import TimerIcon from '@/components/icons/TimerIcon'
import NextLink from 'next/link'
import IconButton from '@/components/primitives/IconButton'

const FocusedTimeRow = observer(({ habitId, readonly }: { habitId: string, readonly: boolean }) => {
  const { getFocusedTime, friendUid } = container.resolve(WeekInView)
  const { collapseColumns, weekdayId } = useContext(ColumnsDisplayContext)

  return (
    <Flex center
      sx={{
        position: 'relative',
        borderTop: 'solid 1px', borderColor: 'grid',
        '&::before': readonly ? {
          zIndex: -1,
          position: 'absolute',
          inset: 0,
          content: '""',
          backgroundColor: 'focus',
          opacity: 0.085
        } : {}
      }}
    >
      {collapseColumns
        ? <TimeCell time={getFocusedTime(habitId, weekdayId)} />
        : Array.from({ length: 7 }).map((_, weekdayId) => (
          <TimeCell time={getFocusedTime(habitId, weekdayId as WeekdayId)} key={weekdayId} />
        ))}
      <TimeCell isSum time={getFocusedTime(habitId, 'week')} />
      {!friendUid && <OpenTimerButton habitId={habitId} disabled={readonly} />}
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

const OpenTimerButton = ({ habitId, disabled }: { habitId: string, disabled: boolean }) => {
  return (
    <Flex sx={{ borderLeft: 'solid 1px', borderColor: 'grid' }}>
      <NextLink href={`/focus?habitId=${habitId}`}>
        <IconButton
          icon={TimerIcon}
          disabled={disabled}
          sx={{
            height: '100%',
            width: '2.25rem',
            paddingY: 0,
            paddingX: '0.6rem',
            color: 'focus',
            backgroundColor: 'transparent',
            borderRadius: 0,
            fontSize: '0.95rem',
            filter: 'brightness(1.2)'
          }}
        />
      </NextLink>
    </Flex>
  )
}

export default FocusedTimeRow