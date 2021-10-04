import { useRef, useState } from 'react'
import { BlurListener, SmartEmoji } from '@/components/app'
import { Button, CenteredFlex, FadeIn } from '@/components/primitives'
import StatusCellEditor from './status-cell-editor/StatusCellEditor'
import styled from '@emotion/styled'
import css from '@styled-system/css'

const StatusCell = () => {
  const cellRef = useRef<HTMLDivElement>(null!)
  const [status, setStatus] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)

  function toggleEditing() {
    if (isEditing) {
      finishEditing()
    } else {
      setIsEditing(true)
    }
  }

  function finishEditing() {
    setIsEditing(false)
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
        <CellButton onClick={toggleEditing} isEditing={isEditing} hasStatus={!!status.length}>
          <CenteredFlex flexWrap="wrap" py="4px">
            {!!status.length && status.map((emoji, index) => (
              <FadeIn time={250} delay={0} key={index}>
                <CenteredFlex p="1px">
                  <SmartEmoji nativeEmoji={emoji} nativeFontSize="1.25rem" twemojiSize={18} />
                </CenteredFlex>
              </FadeIn>
            ))}
          </CenteredFlex>
        </CellButton >
        {isEditing && (
          <StatusCellEditor
            status={status}
            onChangeStatus={setStatus}
            onFinishEditing={finishEditing}
          />
        )}
      </BlurListener >
    </CenteredFlex >
  )
}

interface CellButtonProps {
  isEditing: boolean,
  hasStatus: boolean
}

const CellButton = styled(Button)<CellButtonProps>(({ isEditing, hasStatus }: CellButtonProps) => (css({
  padding: 0,
  height: '100%',
  width: '100%',
  borderRadius: 0,
  backgroundColor: isEditing ? 'whiteAlpha.5' : (!!hasStatus ? 'whiteAlpha.3' : 'transparent'),
  boxShadow: isEditing ? '0 0 0 2px rgba(255, 255, 255, 0.25) inset' : 'none',
  '&:hover': {
    backgroundColor: 'whiteAlpha.5'
  },
  '&:focus': {
    boxShadow: '0 0 0 2px var(--focus-color) inset',
    '&:not(:focus-visible)': {
      boxShadow: isEditing ? '0 0 0 2px rgba(255, 255, 255, 0.25) inset' : 'none',
    }
  }
})))

export default StatusCell