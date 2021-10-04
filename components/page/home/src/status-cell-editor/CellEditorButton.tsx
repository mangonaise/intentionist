import { SmartEmoji } from '@/components/app'
import { Button, CenteredFlex, Icon } from '@/components/primitives'
import styled from '@emotion/styled'
import css from '@styled-system/css'

interface CellEditorButtonProps {
  content: string | (() => JSX.Element)
  action: () => void,
  invert?: boolean,
  disabled?: boolean
}

const CellEditorButton = ({ content, action, invert, disabled = false }: CellEditorButtonProps) => {
  return (
    <EditorButtonWrapper disabled={disabled}>
      <Button
        onClick={action}
        width="2.5rem"
        height="2.5rem"
        padding={0}
        bg={invert ? 'var(--text-color) !important' : undefined}
      >
        <CenteredFlex>
          {typeof content === 'string'
            ? <SmartEmoji nativeEmoji={content} nativeFontSize="1.25rem" twemojiSize={18} />
            : <Icon icon={content} fontSize="1.5rem" color={invert ? 'bg' : undefined} />
          }
        </CenteredFlex>
      </Button>
    </EditorButtonWrapper>
  )
}

const EditorButtonWrapper = styled.div<{ disabled: boolean }>(({ disabled }) => css({
  mb: '4px',
  mr: '4px',
  opacity: 0,
  animation: 'fade-in forwards 175ms',
  '& button': {
    backgroundColor: 'transparent',
    borderRadius: 'default',
    cursor: disabled ? 'default' : 'pointer',
    '&, &:hover': {
      color: disabled ? '#666' : 'text',
    },
    '&:hover': {
      backgroundColor: disabled ? 'transparent' : undefined,
    }
  }
}))

export default CellEditorButton