import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useRef, useState } from 'react'
import { BlurListener, SmartEmoji } from '@/components/app'
import { Button, CenteredFlex, FadeIn } from '@/components/primitives'
import WeekHandler, { WeekdayId } from '@/lib/logic/app/WeekHandler'
import TrackerStatusEditor from './TrackerStatusEditor'
import styled from '@emotion/styled'
import css from '@styled-system/css'

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
    setIsEditing(false)
    container.resolve(WeekHandler).setTrackerStatus(habitId, weekday, draft)
  }

  return (
    <CenteredFlex
      borderBottom="solid 1px"
      borderLeft="solid 1px"
      borderColor="grid"
      onKeyDown={e => e.key === 'Escape' && finishEditing()}
      ref={cellRef}
    >
      <BlurListener blurAction={finishEditing} position="relative" height="100%" width="100%">
        <CellButton
          onClick={toggleEditing}
          isEditing={isEditing}
          isLoading={isLoadingWeek}
          hasStatus={!!visibleEmojis.length}
        >
          <CenteredFlex flexWrap="wrap" py="4px">
            {visibleEmojis.map((emoji, index) => (
              <FadeIn time={250} delay={0} key={index}>
                <CenteredFlex p="1px">
                  <SmartEmoji nativeEmoji={emoji} nativeFontSize="1.15rem" twemojiSize={18} />
                </CenteredFlex>
              </FadeIn>
            ))}
          </CenteredFlex>
        </CellButton >
        {isEditing && (
          <TrackerStatusEditor
            draft={draft}
            onEditDraft={setDraft}
            onFinishEditing={finishEditing}
          />
        )}
      </BlurListener >
    </CenteredFlex >
  )
}

interface CellButtonProps {
  isEditing: boolean,
  isLoading: boolean,
  hasStatus: boolean
}

const CellButton = styled(Button)<CellButtonProps>(({ isEditing, isLoading, hasStatus }: CellButtonProps) => (css({
  padding: 0,
  height: '100%',
  width: '100%',
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
})))

export default observer(TrackerStatusCell)