import { container } from 'tsyringe'
import { FC, useCallback, useContext, useState } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import TrackerStatusEditor from '@/components/page/home/habit-tracker/TrackerStatusEditor'
import HabitStatusesHandler, { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import CurrentDateHandler from '@/logic/app/CurrentDateHandler'
import SmartEmoji from '@/components/modular/SmartEmoji'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'

interface Props {
  value: string | null
  date: YearAndDay
  weekdayIndex: number
  connectLeft: boolean
  connectRight: boolean
}

const TrackerStatus = ({ value, date, weekdayIndex, connectLeft, connectRight }: Props) => {
  const { yearAndDay: { year: currentYear, dayOfYear: today } } = container.resolve(CurrentDateHandler)
  const { habit, isLinkedHabit } = useContext(HabitContext)
  const [isEditing, setIsEditing] = useState(false)
  const hasValue = !!value

  const isFuture = (date.year === currentYear && date.dayOfYear > today) || date.year > currentYear

  const handleChangeStatus = useCallback((status: string | null) => {
    container.resolve(HabitStatusesHandler).setHabitStatus(habit, date, status)
    setIsEditing(false)
  }, [habit, date])

  return (
    <Flex
      align="center"
      sx={{
        '--status-color': isLinkedHabit ? 'var(--color-button-accent-alt)' : 'var(--color-button-accent)',
        position: 'relative', flexGrow: 1
      }}
    >
      <ConnectingLine visible={hasValue && connectLeft} fade={weekdayIndex === 0 ? 'left' : null} />
      <TrackerStatusButton
        onClick={() => setIsEditing(true)}
        value={value}
        isEditing={isEditing}
        isFuture={isFuture}
        belongsToFriend={!!habit.friendUid}
      />
      {isEditing && (
        <TrackerStatusEditor
          hasValue={hasValue}
          palette={habit.palette}
          onSelectStatus={(status) => handleChangeStatus(status)}
          onCancelEditing={() => setIsEditing(false)}
        />
      )}
      <ConnectingLine visible={hasValue && connectRight} fade={weekdayIndex === 6 ? 'right' : null} />
    </Flex >
  )
}

interface TrackerStatusButtonProps {
  onClick: () => void,
  value: string | null,
  isEditing: boolean
  isFuture: boolean
  belongsToFriend: boolean
}

const TrackerStatusButton: FC<TrackerStatusButtonProps> = ({ onClick, value, isEditing, isFuture, belongsToFriend, children }) => {
  const hasValue = !!value

  return (
    <Button
      onClick={onClick}
      aria-label={`Status: ${value ?? 'empty'}`}
      disabled={belongsToFriend || (isFuture && !hasValue)}
      sx={{
        position: 'relative', px: 0, minHeight: '2.5rem', minWidth: '2.5rem', borderRadius: 'trackerStatus',
        bg: isEditing ? 'buttonHighlight' : (hasValue ? 'whiteAlpha.3' : 'transparent'),
        '&:disabled': {
          opacity: belongsToFriend && !isFuture ? 1 : 0.3
        },
        '&:focus': {
          boxShadow: '0 0 0 4px var(--color-focus) inset',
          '&:not(:focus-visible)': { boxShadow: 'none' }
        },
        '&::before': {
          position: 'absolute',
          inset: 0,
          content: '""',
          border: 'solid 1px',
          borderColor: 'var(--status-color)',
          borderRadius: 'inherit',
          opacity: isEditing || hasValue ? 1 : 0.6,
          transition: 'opacity 175ms'
        }
      }}
    >
      <Flex center asSpan>
        {!!value && <SmartEmoji nativeEmoji={value} rem={1} />}
      </Flex>
    </Button>
  )
}

const leftGradient = 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))'
const rightGradient = 'linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0))'

const ConnectingLine = ({ visible, fade }: { visible: boolean, fade?: 'left' | 'right' | null }) => {
  return (
    <Box
      sx={{
        maskImage: fade ? (fade === 'left' ? leftGradient : rightGradient) : null,
        borderBottom: 'solid 1px',
        borderColor: 'var(--status-color)',
        flex: 1,
        zIndex: -1,
        opacity: visible ? 1 : 0,
        transition: 'opacity 175ms'
      }}
      role="presentation"
    />
  )
}

export default TrackerStatus