import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'
import { WeekdayId } from '@/logic/app/WeekInView'
import WeekInView from '@/logic/app/WeekInView'
import TrackerStatusEditor from './TrackerStatusEditor'
import SmartEmoji from '@/components/app/SmartEmoji'
import Button from '@/components/primitives/Button'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'

interface TrackerStatusCellProps {
  habitId: string,
  weekday: WeekdayId,
  rowIndex: number,
  readonly: boolean
}

const TrackerStatusCell = ({ habitId, weekday, rowIndex, readonly }: TrackerStatusCellProps) => {
  const { weekData: { statuses }, isLoadingWeek, setTrackerStatus } = container.resolve(WeekInView)
  const status = statuses?.[habitId]?.[weekday] ?? []
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(status)
  const [shouldSaveDraft, setShouldSaveDraft] = useState(false)
  const visibleEmojis = isLoadingWeek ? [] : (isEditing ? draft : status)

  function startEditing() {
    setDraft(status)
    setIsEditing(true)
  }

  function finishEditing() {
    setIsEditing(false)
    setShouldSaveDraft(true)
  }

  function saveDraft() {
    setTrackerStatus(habitId, weekday, draft)
  }

  // Save status in an effect because the draft editor is closed by the focus trap, which doesn't have access to current state
  useEffect(() => {
    if (shouldSaveDraft) {
      saveDraft()
      setShouldSaveDraft(false)
    }
  }, [shouldSaveDraft])

  return (
    <Flex
      center
      sx={{
        flex: 1,
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
    >
      <CellButton
        onClickCell={startEditing}
        isEditing={isEditing}
        isLoading={isLoadingWeek}
        hasStatus={!!visibleEmojis.length}
        readonly={readonly}
        id={`cell-${weekday},${rowIndex}`}
      >
        <Flex center flexWrap sx={{ py: '4px' }}>
          {visibleEmojis.map((emoji, index) => (
            <FadeIn time={isEditing ? 250 : 0} key={index}>
              <Flex center sx={{ p: '3px' }}>
                <SmartEmoji nativeEmoji={emoji} rem={1.2} />
              </Flex>
            </FadeIn>
          ))}
        </Flex>
      </CellButton >
      {isEditing && (
        <TrackerStatusEditor
          draft={draft}
          habitId={habitId}
          onEditDraft={setDraft}
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
  hasStatus: boolean,
  readonly: boolean,
  id: string,
}

const CellButton: FC<CellButtonProps> = (props) => {
  const { onClickCell, isEditing, isLoading, hasStatus, readonly, id, children } = props

  return (
    <Button
      onClick={onClickCell}
      disabled={readonly}
      sx={{
        '--highlight': '0 0 0 2px #747474 inset',
        padding: 0,
        size: '100%',
        borderRadius: 0,
        backgroundColor: isEditing ? 'whiteAlpha.8' : (isLoading ? 'transparent' : (hasStatus ? 'whiteAlpha.3' : 'transparent')),
        boxShadow: isEditing ? 'var(--highlight)' : 'none',
        '&:hover': {
          backgroundColor: 'whiteAlpha.8',
          '&:not(:focus-visible)': {
            boxShadow: 'var(--highlight) !important'
          }
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
        },
        '&:disabled': {
          opacity: 1
        }
      }}
      id={id}
    >
      {children}
    </Button>
  )
}

export default observer(TrackerStatusCell)