import Icon from '@/components/primitives/Icon'
import Text from '@/components/primitives/Text'
import Flex from '@/components/primitives/Flex'
import FlameIcon from '@/components/icons/FlameIcon'

const HabitStreak = () => {
  return (
    <Flex center>
      <Icon icon={FlameIcon} sx={{ color: 'textAccent', fontSize: ['1.2rem', '1.3rem'] }} />
      <Text type="span" sx={{ ml: 1, color: 'whiteAlpha.60' }}>
        ...
      </Text>
    </Flex>
  )
}

export default HabitStreak