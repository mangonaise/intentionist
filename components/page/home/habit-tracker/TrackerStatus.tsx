import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'

interface Props {
  weekdayIndex: number,
  connectLeft: boolean,
  connectRight: boolean
}

const TrackerStatus = ({ weekdayIndex, connectLeft, connectRight }: Props) => {
  return (
    <>
      <ConnectingLine visible={connectLeft} fade={weekdayIndex === 0 ? 'left' : null} />
      <Button
        sx={{
          px: 0, minHeight: '2.5rem', minWidth: '2.5rem',
          border: 'solid 2px', borderColor: 'buttonAccent', borderRadius: '0.75rem',
          bg: 'whiteAlpha.3'
        }}
      >
        <Flex center asSpan>
          <SmartEmoji nativeEmoji="🌟" rem={1} />
        </Flex>
      </Button>
      <ConnectingLine visible={connectRight} fade={weekdayIndex === 6 ? 'right' : null} />
    </>
  )
}

const leftGradient = 'linear-gradient(to right, transparent, var(--button-accent-color) 50%)'
const RightGradient = 'linear-gradient(to left, transparent, var(--button-accent-color) 50%)'

const ConnectingLine = ({ visible, fade }: { visible: boolean, fade?: 'left' | 'right' | null }) => {
  return (
    <Box
      sx={{
        visibility: visible ? 'visible' : 'hidden',
        height: '2px',
        flex: 1,
        zIndex: -1,
        backgroundColor: fade ? 'transparent' : 'buttonAccent',
        backgroundImage: fade ? (fade === 'left' ? leftGradient : RightGradient) : 'none'
      }}
      role="presentation"
    />
  )
}

export default TrackerStatus