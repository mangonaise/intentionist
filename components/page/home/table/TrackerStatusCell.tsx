import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useRef, useState } from 'react'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'
import TrackerStatusEditor from './TrackerStatusEditor'
import SmartEmoji from '@/components/app/SmartEmoji'
import Button from '@/components/primitives/Button'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'

interface TrackerStatusCellProps {
  habitId: string,
  weekday: WeekdayId,
}

const TrackerStatusCell = ({ habitId, weekday }: TrackerStatusCellProps) => {
  const { isLoadingWeek, weekInView: { statuses } } = container.resolve(WeekHandler)
  const [isEditing, setIsEditing] = useState(false)
  const [status, setStatus] = useState<string[]>(statuses?.[habitId]?.[weekday] ?? [])
  const [shouldSaveStatus, setShouldSaveStatus] = useState(false)
  const cellRef = useRef<HTMLDivElement>(null!)

  const visibleEmojis = isLoadingWeek ? [] : status

  function startEditing() {
    setIsEditing(true)
  }

  function finishEditing() {
    setIsEditing(false)
    setShouldSaveStatus(true)
  }

  function saveDraft() {
    container.resolve(WeekHandler).setTrackerStatus(habitId, weekday, status)
  }

  // Save status in an effect because the draft editor is closed by the focus trap, which doesn't have access to current state
  useEffect(() => {
    if (shouldSaveStatus) {
      saveDraft()
      setShouldSaveStatus(false)
    }
  }, [shouldSaveStatus])

  return (
    <Flex
      center
      sx={{
        position: 'relative',
        borderLeft: 'solid 1px',
        borderColor: 'grid',
        '::before': {
          position: 'absolute',
          content: '""',
          inset: 0,
          borderTop: 'solid 1px',
          borderColor: 'grid',
          zIndex: -1
        }
      }}
      ref={cellRef}
    >
      <CellButton
        onClickCell={startEditing}
        isEditing={isEditing}
        isLoading={isLoadingWeek}
        hasStatus={!!visibleEmojis.length}
      >
        <Flex center flexWrap sx={{ py: '4px' }}>
          {visibleEmojis.map((emoji, index) => (
            <FadeIn time={250} key={index}>
              <Flex center sx={{ p: '1px' }}>
                <SmartEmoji nativeEmoji={emoji} nativeFontSize="1.15rem" twemojiSize={18} />
              </Flex>
            </FadeIn>
          ))}
        </Flex>
      </CellButton >
      {isEditing && (
        <TrackerStatusEditor
          status={status}
          habitId={habitId}
          onEditStatus={setStatus}
          closeEditor={finishEditing}
        />
      )}
    </Flex >
  )
}

interface CellButtonProps {
  onClickCell: () => void,
  isEditing: boolean,
  isLoading: boolean,
  hasStatus: boolean
}

const CellButton: FC<CellButtonProps> = (props) => {
  const { onClickCell, isEditing, isLoading, hasStatus, children } = props

  return (
    <Button
      onClick={onClickCell}
      sx={{
        '--highlight': '0 0 0 2px #747474 inset',
        padding: 0,
        size: '100%',
        borderRadius: 0,
        backgroundColor: isEditing ? 'whiteAlpha.8' : (isLoading ? 'transparent' : (hasStatus ? 'whiteAlpha.3' : 'transparent')),
        boxShadow: isEditing ? 'var(--highlight)' : 'none',
        '&:hover': {
          backgroundColor: 'whiteAlpha.8',
          boxShadow: 'var(--highlight) !important'
        },
        '&:not:hover': {
          transition: 'background-color 100ms'
        },
        '&:focus': {
          boxShadow: '0 0 0 2px var(--focus-color) inset',
          '&:not(:focus-visible)': {
            boxShadow: isEditing ? 'var(--highlight)' : 'none',
            transition: 'none',
          }
        }
      }}
    >
      {children}
    </Button>
  )
}

export default observer(TrackerStatusCell)