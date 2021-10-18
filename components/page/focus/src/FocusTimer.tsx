import { TimerIcon } from '@/components/icons'
import { Box, Flex, Icon, Spacer } from '@/components/primitives'
import TimerAdjustButtons from './TimerAdjustButtons'
import TimerProgress from './TimerProgress'

const FocusTimer = () => {
  return (
    <Box
      sx={{
        width: '100%',
        padding: [1, 5],
        backgroundColor: ['transparent', 'whiteAlpha.3'],
        borderRadius: 'default'
      }}
    >
      <Flex align="center">
        <Flex center sx={{ size: 0, bg: 'focus', borderRadius: '50%', p: 4, mr: 3 }}>
          <Icon icon={TimerIcon} sx={{ transform: 'scale(1.35) translateY(-0.04rem)' }} />
        </Flex>
        Focus timer
      </Flex>
      <TimerProgress />
      <Spacer mb={4} />
      <TimerAdjustButtons />
    </Box>
  )
}

export default FocusTimer