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
  const status = statuses?.[habitId]?.[weekday] ?? []
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
          borderColor: 'grid'
        }
      }}
      ref={cellRef}
    >
      <BlurListener
        blurAction={finishEditing}
        escapeAction={finishEditing}
        sx={{ position: 'relative', size: '100%' }}
      >
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
            habitId={habitId}
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