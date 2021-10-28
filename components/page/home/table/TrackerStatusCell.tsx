import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'
import TrackerStatusEditor from './TrackerStatusEditor'
import SmartEmoji from '@/components/app/SmartEmoji'
import Button from '@/components/primitives/Button'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'

interface TrackerStatusCellProps {
  habitId: string,
  weekday: WeekdayId,
  rowIndex: number
}

const TrackerStatusCell = ({ habitId, weekday, rowIndex }: TrackerStatusCellProps) => {
  const { isLoadingWeek, weekInView: { statuses } } = container.resolve(WeekHandler)
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
    container.resolve(WeekHandler).setTrackerStatus(habitId, weekday, draft)
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
        id={`cell-${weekday},${rowIndex}`}
      >
        <Flex center flexWrap sx={{ py: '4px' }}>
          {visibleEmojis.map((emoji, index) => (
            <FadeIn time={isEditing ? 250 : 0} key={index}>
              <Flex center sx={{ p: '1px' }}>
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
  id: string,
}

const CellButton: FC<CellButtonProps> = (props) => {
  const { onClickCell, isEditing, isLoading, hasStatus, id, children } = props

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
        }
      }}
      id={id}
    >
      {children}
    </Button>
  )
}

export default observer(TrackerStatusCell)