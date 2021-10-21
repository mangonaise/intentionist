import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'

interface CellEditorButtonProps {
  content: string | (() => JSX.Element)
  action: () => void,
  invert?: boolean,
  disabled?: boolean
}

const CellEditorButton = ({ content, action, invert, disabled = false }: CellEditorButtonProps) => {
  return (
    <Box sx={{ mr: '4px', mb: '4px', opacity: 0, animation: 'fade-in forwards 175ms' }}>
      <Button
        onClick={action}
        hoverEffect={disabled || invert ? 'none' : 'default'}
        sx={{
          width: '2.5rem', height: '2.5rem', p: 0, 
          bg: invert ? 'text' : 'transparent',
          color: disabled ? '#666' : 'text',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <Flex center>
          {typeof content === 'string'
            ? <SmartEmoji nativeEmoji={content} nativeFontSize="1.25rem" twemojiSize={18} />
            : <Icon icon={content} sx={{ fontSize: '1.15rem', color: invert ? 'bg' : undefined }} />
          }
        </Flex>
      </Button>
    </Box>
  )
}

export default CellEditorButton