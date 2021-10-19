import { PlayIcon } from '@/components/icons'
import { Flex, IconButton, Text } from '@/components/primitives'
import ProgressBar from 'react-customizable-progressbar'

const TimerProgress = () => {
  return (
    <Flex
      center
      sx={{
        width: '100%',
        '.RCP': {
          '--pointer-stroke-color': ['var(--background-color)', '#1f1f1f'],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '100%',
          maxHeight: 'min-content',
          width: '400px !important',
          '& svg': {
            width: '100%',
            height: '100%'
          }
        }
      }}
    >
      <ProgressBar
        progress={0}
        radius={100}
        strokeColor="var(--focus-accent-color)"
        strokeWidth={6}
        trackStrokeColor="var(--focus-timer-track-color)"
        trackStrokeWidth={6}
        pointerFillColor="var(--focus-accent-color)"
        pointerRadius={7}
        pointerStrokeWidth={3}
        pointerStrokeColor="var(--pointer-stroke-color)"
      >
        <Flex column align="center" sx={{ position: 'absolute' }}>
          <Text
            type="div"
            sx={{ fontSize: ['3rem', '4rem'], fontWeight: 'semibold', mb: 2 }}
          >
            25:00
          </Text>
          <IconButton
            icon={PlayIcon}
            hoverEffect="opacity"
            sx={{
              size: ['3.5rem', '4rem'],
              borderRadius: '50%',
              backgroundColor: 'text',
              color: 'bg',
              fontSize: '1.75rem'
            }}
          />
        </Flex>
      </ProgressBar>
    </Flex>
  )
}

export default TimerProgress