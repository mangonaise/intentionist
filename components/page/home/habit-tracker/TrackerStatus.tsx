import { container } from 'tsyringe'
import { FC, useCallback, useContext, useState } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import { CurrentDateContext } from '@/components/app/withApp'
import TrackerStatusEditor from '@/components/page/home/habit-tracker/TrackerStatusEditor'
import HabitStatusesHandler, { YearAndDay } from '@/logic/app/HabitStatusesHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'

interface Props {
  value: string | null,
  date: YearAndDay,
  weekdayIndex: number,
  connectLeft: boolean,
  connectRight: boolean
}

const TrackerStatus = ({ value, date, weekdayIndex, connectLeft, connectRight }: Props) => {
  const { habit } = useContext(HabitContext)
  const { yearAndDay: { year: currentYear, dayOfYear: today } } = useContext(CurrentDateContext)
  const [isEditing, setIsEditing] = useState(false)
  const hasValue = !!value

  const isFuture = (date.year === currentYear && date.dayOfYear > today) || date.year > currentYear

  const handleChangeStatus = useCallback((status: string | null) => {
    container.resolve(HabitStatusesHandler).setHabitStatus(habit, date, status)
    setIsEditing(false)
  }, [habit, date])

  return (
    <Flex align="center" sx={{ position: 'relative', flexGrow: 1 }}>
      <ConnectingLine visible={hasValue && connectLeft} fade={weekdayIndex === 0 ? 'left' : null} />
      <TrackerStatusButton
        onClick={() => setIsEditing(true)}
        hasValue={hasValue}
        isEditing={isEditing}
        isFuture={isFuture}
        belongsToFriend={!!habit.friendUid}
      >
        <Flex center asSpan>
          {!!value && <SmartEmoji nativeEmoji={value} rem={1} />}
        </Flex>
      </TrackerStatusButton>
      {isEditing && (
        <TrackerStatusEditor
          hasValue={hasValue}
          palette={habit.palette}
          onSelectStatus={(status) => handleChangeStatus(status)}
          onCancelEditing={() => setIsEditing(false)}
        />
      )}
      <ConnectingLine visible={hasValue && connectRight} fade={weekdayIndex === 6 ? 'right' : null} />
    </Flex>
  )
}

interface TrackerStatusButtonProps {
  onClick: () => void
  hasValue: boolean
  isEditing: boolean,
  isFuture: boolean,
  belongsToFriend: boolean
}

const TrackerStatusButton: FC<TrackerStatusButtonProps> = ({ onClick, hasValue, isEditing, isFuture, belongsToFriend, children }) => {
  return (
    <Button
      onClick={onClick}
      disabled={belongsToFriend || (isFuture && !hasValue)}
      sx={{
        position: 'relative', px: 0, minHeight: '2.5rem', minWidth: '2.5rem', borderRadius: 'trackerStatus',
        bg: isEditing ? 'buttonHighlight' : (hasValue ? 'whiteAlpha.3' : 'transparent'),
        '&:disabled': {
          opacity: belongsToFriend ? 1 : 0.3
        },
        '&:focus': {
          boxShadow: '0 0 0 4px var(--focus-color) inset',
          '&:not(:focus-visible)': { boxShadow: 'none' }
        },
        '&::before': {
          position: 'absolute',
          inset: 0,
          content: '""',
          border: 'solid 2px',
          borderColor: 'buttonAccent',
          borderRadius: 'inherit',
          opacity: isEditing || hasValue ? 1 : 0.6,
          transition: 'opacity 175ms'
        }
      }}
    >
      {children}
    </Button>
  )
}

const leftGradient = 'linear-gradient(to right, transparent, var(--button-accent-color) 50%)'
const RightGradient = 'linear-gradient(to left, transparent, var(--button-accent-color) 50%)'

const ConnectingLine = ({ visible, fade }: { visible: boolean, fade?: 'left' | 'right' | null }) => {
  return (
    <Box
      sx={{
        height: '2px',
        flex: 1,
        zIndex: -1,
        backgroundColor: fade ? 'transparent' : 'buttonAccent',
        backgroundImage: fade ? (fade === 'left' ? leftGradient : RightGradient) : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 175ms'
      }}
      role="presentation"
    />
  )
}

export default TrackerStatus