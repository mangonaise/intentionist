import SmartEmoji from '@/components/app/SmartEmoji'
import Box from '@/components/primitives/Box'
import Button from '@/components/primitives/Button'
import Flex from '@/components/primitives/Flex'

const TrackerStatus = ({ weekdayIndex }: { weekdayIndex: number }) => {
  return (
    <>
      <ConnectingLine fade={weekdayIndex === 0 ? 'left' : null} />
      <Button
        sx={{
          px: 0, minHeight: '2.5rem', minWidth: '2.5rem',
          border: 'solid 2px', borderColor: 'buttonAccent', borderRadius: '0.7rem',
          bg: 'whiteAlpha.3'
        }}
      >
        <Flex center asSpan>
          <SmartEmoji nativeEmoji="🌟" rem={1} />
        </Flex>
      </Button>
      <ConnectingLine fade={weekdayIndex === 6 ? 'right' : null} />
    </>
  )
}

const leftGradient = 'linear-gradient(to right, transparent, var(--button-accent-color) 50%)'
const RightGradient = 'linear-gradient(to left, transparent, var(--button-accent-color) 50%)'

const ConnectingLine = ({ fade }: { fade?: 'left' | 'right' | null }) => {
  return (

    <Box
      sx={{
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