import SmartEmoji from '@/components/modular/SmartEmoji'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'

interface Props {
  content: string | (() => JSX.Element)
  action: () => void,
  label?: string,
  focusIndex: number
  invert?: boolean
  disabled?: boolean
}

const TrackerStatusEditorButton = ({ content, action, label, focusIndex, invert, disabled = false }: Props) => {
  return (
    <Box sx={{ mr: '4px', mb: '4px', opacity: 0, animation: 'fade-in forwards 175ms' }}>
      <Button
        onClick={action}
        aria-label={label}
        hoverEffect={disabled || invert ? 'none' : 'default'}
        sx={{
          width: '2.5rem', height: '2.5rem', p: 0,
          borderRadius: 'trackerStatus',
          bg: invert ? 'text' : 'transparent',
          color: disabled ? '#666' : 'text',
          cursor: disabled ? 'default' : 'pointer',
        }}
        id={`status_editor-${focusIndex}`}
      >
        <Flex center>
          {typeof content === 'string'
            ? <SmartEmoji nativeEmoji={content} rem={1.25} />
            : <Icon icon={content} sx={{ fontSize: '1.15rem', color: invert ? 'bg' : undefined }} />
          }
        </Flex>
      </Button>
    </Box>
  )
}

export default TrackerStatusEditorButton