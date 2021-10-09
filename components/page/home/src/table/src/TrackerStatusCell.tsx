import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { FC, useRef, useState } from 'react'
import { BlurListener, SmartEmoji } from '@/components/app'
import { Button, FadeIn, Flex } from '@/components/primitives'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'
import TrackerStatusEditor from './TrackerStatusEditor'

interface TrackerStatusCellProps {
  habitId: string,
  weekday: WeekdayId,
}

const TrackerStatusCell = ({ habitId, weekday }: TrackerStatusCellProps) => {
  const cellRef = useRef<HTMLDivElement>(null!)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<string[]>([])

  const { isLoadingWeek, weekInView: { statuses } } = container.resolve(WeekHandler)
  const status = statuses[habitId]?.[weekday] ?? []
  const visibleEmojis: string[] = isLoadingWeek ? [] : (isEditing ? draft : status)

  function toggleEditing() {
    if (isEditing) {
      finishEditing()
    } else {
      startEditing()
    }
  }

  function startEditing() {
    setDraft(status)
    setIsEditing(true)
  }

  function finishEditing() {
    if (isEditing) {
      setIsEditing(false)
      container.resolve(WeekHandler).setTrackerStatus(habitId, weekday, draft)
    }
  }

  return (
    <Flex
      onKeyDown={e => e.key === 'Escape' && finishEditing()}
      center
      sx={{
        borderBottom: 'solid 1px',
        borderLeft: 'solid 1px',
        borderColor: 'grid'
      }}
      ref={cellRef}
    >
      <BlurListener blurAction={finishEditing} sx={{ position: 'relative', size: '100%' }}>
        <CellButton
          onClickCell={toggleEditing}
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
            draft={draft}
            onEditDraft={setDraft}
            onFinishEditing={finishEditing}
          />
        )}
      </BlurListener >
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
        padding: 0,
        size: '100%',
        borderRadius: 0,
        backgroundColor: isLoading ? 'transparent' : (isEditing ? 'whiteAlpha.5' : (hasStatus ? 'whiteAlpha.3' : 'transparent')),
        boxShadow: isEditing ? '0 0 0 2px rgba(255, 255, 255, 0.25) inset' : 'none',
        pointerEvents: isLoading ? 'none' : 'auto',
        '&:hover': {
          backgroundColor: 'whiteAlpha.5'
        },
        '&:not:hover': {
          transition: 'background-color 100ms'
        },
        '&:focus': {
          boxShadow: '0 0 0 2px var(--focus-color) inset',
          '&:not(:focus-visible)': {
            boxShadow: isEditing ? '0 0 0 2px rgba(255, 255, 255, 0.25) inset' : 'none',
          }
        }
      }}
    >
      {children}
    </Button>
  )
}

export default observer(TrackerStatusCell)